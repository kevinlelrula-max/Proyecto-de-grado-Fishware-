import pool from "../config/db.js";
import { crearNotificacion } from "../utils/notificaciones.js";
import { procesarReferidoPrimeraCompra } from "./referidos.controller.js";

// =========================
// 🛒 CREAR PEDIDO ONLINE
// El cliente crea su pedido desde la tienda
// =========================
export const crearPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      empresa_id,
      cliente_id,
      metodo_pago_id,
      direccion_entrega,
      notas,
      total,
      detalle, // [{ producto_id, kilos, precio_unitario }]
      cupon_id,
      descuento,
    } = req.body;

    if (!detalle || detalle.length === 0) {
      return res.status(400).json({ error: "El pedido debe tener al menos un producto" });
    }

    await client.query("BEGIN");

    // Insertar pedido (con cupón si aplica)
    const pedidoResult = await client.query(
      `INSERT INTO pedidos_online
        (empresa_id, cliente_id, metodo_pago_id, direccion_entrega, notas, total, estado, cupon_id, descuento)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7, $8)
       RETURNING *`,
      [empresa_id, cliente_id, metodo_pago_id, direccion_entrega, notas || null, total, cupon_id || null, descuento || 0]
    );

    const pedido = pedidoResult.rows[0];

    // Insertar detalle
    for (const item of detalle) {
      await client.query(
        `INSERT INTO detalle_pedido_online (pedido_id, producto_id, kilos, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.producto_id, item.kilos, item.precio_unitario]
      );
    }

    // Registrar uso del cupón si se aplicó
    if (cupon_id && descuento > 0) {
      await client.query(
        `INSERT INTO cupones_usos (cupon_id, cliente_id, pedido_id, descuento_aplicado)
         VALUES ($1, $2, $3, $4)`,
        [cupon_id, cliente_id, pedido.id, descuento]
      );
      await client.query(
        `UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE id = $1`,
        [cupon_id]
      );
    }

    await client.query("COMMIT");

    // 🤝 Procesar referido (primera compra del amigo)
    procesarReferidoPrimeraCompra({ cliente_id, empresa_id, pedido_id: pedido.id });

    // 🔔 Notificación: nuevo pedido online
    await crearNotificacion({
      empresa_id,
      tipo: "nuevo_pedido",
      titulo: `Nuevo pedido online #${pedido.id}`,
      mensaje: `Total: $${Number(total).toFixed(2)}`,
      seccion: "pedidos",
      referencia_id: pedido.id,
    });

    res.json({ id: pedido.id, estado: pedido.estado, total: pedido.total });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error crearPedido:", error);
    res.status(500).json({ error: "Error al crear el pedido" });
  } finally {
    client.release();
  }
};

// =========================
// 🛒 MIS PEDIDOS (cliente)
// El cliente ve todos sus pedidos con detalle
// =========================
export const getMisPedidos = async (req, res) => {
  try {
    const cliente_id = req.user.id;

    const result = await pool.query(
      `SELECT 
         p.id,
         p.estado,
         p.total,
         p.direccion_entrega,
         p.notas,
         p.fecha_pedido,
         p.fecha_actualizacion,
         e.nombre AS empresa_nombre,
         e.telefono AS empresa_telefono,
         mp.metodo AS metodo_pago,
         json_agg(
           json_build_object(
             'producto_id',    dp.producto_id,
             'nombre',         pr.nombre,
             'kilos',          dp.kilos,
             'precio_unitario', dp.precio_unitario,
             'subtotal',       dp.subtotal
           )
         ) AS detalle
       FROM pedidos_online p
       JOIN empresas e       ON e.id = p.empresa_id
       JOIN metodo_pago mp   ON mp.id = p.metodo_pago_id
       JOIN detalle_pedido_online dp ON dp.pedido_id = p.id
       JOIN productos pr      ON pr.id = dp.producto_id
       WHERE p.cliente_id = $1
       GROUP BY p.id, e.nombre, e.telefono, mp.metodo
       ORDER BY p.fecha_pedido DESC`,
      [cliente_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getMisPedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// =========================
// 🛒 ESTADO DE UN PEDIDO (polling)
// El cliente consulta el estado de un pedido específico
// =========================
export const getEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente_id = req.user.id;

    const result = await pool.query(
      `SELECT id, estado, fecha_actualizacion
       FROM pedidos_online
       WHERE id = $1 AND cliente_id = $2`,
      [id, cliente_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error getEstadoPedido:", error);
    res.status(500).json({ error: "Error al obtener estado del pedido" });
  }
};

// =========================
// 🔥 PEDIDOS ONLINE (panel cajero)
// El cajero ve los pedidos de su empresa
// =========================
export const getPedidosEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT 
         p.id,
         p.estado,
         p.total,
         p.direccion_entrega,
         p.notas,
         p.fecha_pedido,
         p.fecha_actualizacion,
         per.nombre    AS cliente_nombre,
         per.apellido  AS cliente_apellido,
         per.telefono  AS cliente_telefono,
         mp.metodo     AS metodo_pago,
         json_agg(
           json_build_object(
             'producto_id',     dp.producto_id,
             'nombre',          pr.nombre,
             'kilos',           dp.kilos,
             'precio_unitario', dp.precio_unitario,
             'subtotal',        dp.subtotal
           )
         ) AS detalle
       FROM pedidos_online p
       JOIN persona per          ON per.id = p.cliente_id
       JOIN metodo_pago mp       ON mp.id = p.metodo_pago_id
       JOIN detalle_pedido_online dp ON dp.pedido_id = p.id
       JOIN productos pr          ON pr.id = dp.producto_id
       WHERE p.empresa_id = $1
       GROUP BY p.id, per.nombre, per.apellido, per.telefono, mp.metodo
       ORDER BY p.fecha_pedido DESC`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getPedidosEmpresa:", error);
    res.status(500).json({ error: "Error al obtener pedidos de la empresa" });
  }
};

// =========================
// 🔥 ACTUALIZAR ESTADO (cajero)
// pendiente → confirmado → en_preparacion → enviado → entregado → cancelado
// =========================
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const empresa_id = req.user.empresa_id;

    const estadosValidos = [
      "pendiente",
      "confirmado",
      "en_preparacion",
      "enviado",
      "entregado",
      "cancelado",
    ];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    const result = await pool.query(
      `UPDATE pedidos_online
       SET estado = $1, fecha_actualizacion = NOW()
       WHERE id = $2 AND empresa_id = $3
       RETURNING id, estado, fecha_actualizacion`,
      [estado, id, empresa_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Registrar en historial
    await pool.query(
      `INSERT INTO pedido_estados_historial (pedido_id, estado, nota)
       VALUES ($1, $2, $3)`,
      [id, estado, req.body.nota || null]
    );

    // 🔔 Notificación para estados relevantes
    if (estado === "entregado") {
      await crearNotificacion({
        empresa_id,
        tipo: "pedido_entregado",
        titulo: `Pedido #${id} entregado`,
        mensaje: "El pedido fue marcado como entregado.",
        seccion: "pedidos",
        referencia_id: Number(id),
      });
    } else if (estado === "cancelado") {
      await crearNotificacion({
        empresa_id,
        tipo: "pedido_cancelado",
        titulo: `Pedido #${id} cancelado`,
        mensaje: "El pedido fue cancelado.",
        seccion: "pedidos",
        referencia_id: Number(id),
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizarEstadoPedido:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};

// =========================
// 📋 HISTORIAL DE ESTADOS (cliente y empresa)
// =========================
export const getHistorialPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT estado, nota, cambiado_en
       FROM pedido_estados_historial
       WHERE pedido_id = $1
       ORDER BY cambiado_en ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getHistorialPedido:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};