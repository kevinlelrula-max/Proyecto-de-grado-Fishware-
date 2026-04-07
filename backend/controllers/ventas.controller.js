import pool from "../config/db.js";

// 🔹 Crear venta
export const crearVenta = async (req, res) => {
  const client = await pool.connect();

  try {
    const empresa_id = req.user.empresa_id;
    const administrador_id = req.user.id;

    const { cliente_id, metodo_pago_id, productos } = req.body;

    await client.query("BEGIN");

    // 🔹 Crear venta
    const ventaResult = await client.query(
      `INSERT INTO ventas (empresa_id, administrador_id, cliente_id, metodo_pago_id, total)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [empresa_id, administrador_id, cliente_id, metodo_pago_id]
    );

    const venta = ventaResult.rows[0];

    let total = 0;

    // 🔹 Procesar productos
    for (const item of productos) {
      const { producto_id, cantidad } = item;

      const productoResult = await client.query(
        "SELECT * FROM productos WHERE id = $1 AND empresa_id = $2",
        [producto_id, empresa_id]
      );

      const producto = productoResult.rows[0];

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      const subtotal = producto.precio * cantidad;
      total += subtotal;

      // 🔹 Insertar detalle
      await client.query(
        `INSERT INTO detalle_venta (venta_id, producto_id, kilos, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [venta.id, producto_id, cantidad, producto.precio]
      );

      // 🔹 Descontar stock
      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
        [cantidad, producto_id]
      );
    }

    // 🔹 Actualizar total
    await client.query(
      "UPDATE ventas SET total = $1 WHERE id = $2",
      [total, venta.id]
    );

    await client.query("COMMIT");

    res.json({ message: "Venta realizada", total });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// 🔹 Listar todas las ventas con detalle de productos
export const listarVentas = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // 🔹 Primero traemos las ventas principales
    const ventasResult = await pool.query(
      `SELECT 
         v.id AS venta_id,
         v.fecha,
         v.total,
         p_admin.nombre || ' ' || p_admin.apellido AS administrador,
         p_cliente.nombre || ' ' || p_cliente.apellido AS cliente,
         mp.metodo AS metodo_pago
       FROM ventas v
       JOIN persona p_admin ON v.administrador_id = p_admin.id
       JOIN persona p_cliente ON v.cliente_id = p_cliente.id
       JOIN metodo_pago mp ON v.metodo_pago_id = mp.id
       WHERE v.empresa_id = $1
       ORDER BY v.fecha DESC`,
      [empresa_id]
    );

    const ventas = ventasResult.rows;

    // 🔹 Para cada venta, traemos los productos
    for (let venta of ventas) {
      const detallesResult = await pool.query(
        `SELECT 
           dv.producto_id,
           pr.nombre AS producto,
           dv.kilos AS cantidad,
           dv.precio_unitario,
           dv.subtotal
         FROM detalle_venta dv
         JOIN productos pr ON dv.producto_id = pr.id
         WHERE dv.venta_id = $1`,
        [venta.venta_id]
      );

      venta.productos = detallesResult.rows;
    }

    res.json(ventas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};