import pool from "../config/db.js";

export const getreporteEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // ── Período ──────────────────────────────────────────────────────────────
    // periodo: hoy | semana | mes | año  (default: mes)
    const periodo = req.query.periodo || "mes";
    let fechaDesde;
    const ahora = new Date();

    if (periodo === "hoy") {
      fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    } else if (periodo === "semana") {
      fechaDesde = new Date(ahora);
      fechaDesde.setDate(ahora.getDate() - 6);
    } else if (periodo === "mes") {
      fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    } else { // año
      fechaDesde = new Date(ahora.getFullYear(), 0, 1);
    }

    const desde = fechaDesde.toISOString().slice(0, 10);

    // ── KPIs combinados POS + Online ─────────────────────────────────────────
    const kpis = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM ventas
          WHERE empresa_id=$1 AND DATE(fecha) >= $2)
         + (SELECT COUNT(*) FROM pedidos_online
            WHERE empresa_id=$1 AND DATE(fecha_pedido) >= $2 AND estado != 'cancelado')
         AS total_ventas,

         COALESCE((SELECT SUM(total) FROM ventas
                   WHERE empresa_id=$1 AND DATE(fecha) >= $2), 0)
         + COALESCE((SELECT SUM(total) FROM pedidos_online
                     WHERE empresa_id=$1 AND DATE(fecha_pedido) >= $2 AND estado != 'cancelado'), 0)
         AS ingresos,

         (SELECT COUNT(DISTINCT cliente_id) FROM ventas
          WHERE empresa_id=$1 AND DATE(fecha) >= $2)
         + (SELECT COUNT(DISTINCT cliente_id) FROM pedidos_online
            WHERE empresa_id=$1 AND DATE(fecha_pedido) >= $2 AND estado != 'cancelado')
         AS clientes_activos`,
      [empresa_id, desde]
    );

    const { total_ventas, ingresos, clientes_activos } = kpis.rows[0];
    const ticketPromedio = total_ventas > 0 ? (ingresos / total_ventas) : 0;

    // ── Ingresos por día (POS + Online) ──────────────────────────────────────
    const ventasPorDia = await pool.query(
      `SELECT dia, SUM(total) AS total, SUM(pos) AS pos, SUM(online) AS online
       FROM (
         SELECT DATE(fecha) AS dia, SUM(total) AS total, SUM(total) AS pos, 0 AS online
         FROM ventas
         WHERE empresa_id=$1 AND DATE(fecha) >= $2
         GROUP BY dia

         UNION ALL

         SELECT DATE(fecha_pedido) AS dia, SUM(total) AS total, 0 AS pos, SUM(total) AS online
         FROM pedidos_online
         WHERE empresa_id=$1 AND DATE(fecha_pedido) >= $2 AND estado != 'cancelado'
         GROUP BY dia
       ) t
       GROUP BY dia
       ORDER BY dia ASC`,
      [empresa_id, desde]
    );

    // ── Top productos por ingresos (POS + Online) ────────────────────────────
    const topProductos = await pool.query(
      `SELECT nombre, SUM(ingresos) AS ingresos, SUM(unidades) AS unidades
       FROM (
         SELECT p.nombre,
                SUM(dv.cantidad * dv.precio_unitario) AS ingresos,
                SUM(dv.cantidad) AS unidades
         FROM detalle_venta dv
         JOIN productos p  ON p.id = dv.producto_id
         JOIN ventas v      ON v.id = dv.venta_id
         WHERE v.empresa_id=$1 AND DATE(v.fecha) >= $2
         GROUP BY p.nombre

         UNION ALL

         SELECT p.nombre,
                SUM(dp.cantidad * dp.precio_unitario) AS ingresos,
                SUM(dp.cantidad) AS unidades
         FROM detalle_pedido_online dp
         JOIN productos p         ON p.id = dp.producto_id
         JOIN pedidos_online po    ON po.id = dp.pedido_id
         WHERE po.empresa_id=$1 AND DATE(po.fecha_pedido) >= $2 AND po.estado != 'cancelado'
         GROUP BY p.nombre
       ) t
       GROUP BY nombre
       ORDER BY ingresos DESC
       LIMIT 8`,
      [empresa_id, desde]
    );

    // ── Top clientes ─────────────────────────────────────────────────────────
    const topClientes = await pool.query(
      `SELECT nombre, SUM(total) AS total, SUM(compras) AS compras
       FROM (
         SELECT CONCAT(pe.nombre, ' ', pe.apellido) AS nombre,
                SUM(v.total) AS total, COUNT(*) AS compras
         FROM ventas v
         JOIN persona pe ON pe.id = v.cliente_id
         WHERE v.empresa_id=$1 AND DATE(v.fecha) >= $2
         GROUP BY pe.nombre, pe.apellido

         UNION ALL

         SELECT CONCAT(pe.nombre, ' ', pe.apellido) AS nombre,
                SUM(po.total) AS total, COUNT(*) AS compras
         FROM pedidos_online po
         JOIN persona pe ON pe.id = po.cliente_id
         WHERE po.empresa_id=$1 AND DATE(po.fecha_pedido) >= $2 AND po.estado != 'cancelado'
         GROUP BY pe.nombre, pe.apellido
       ) t
       GROUP BY nombre
       ORDER BY total DESC
       LIMIT 5`,
      [empresa_id, desde]
    );

    // ── POS vs Online ────────────────────────────────────────────────────────
    const posVsOnline = await pool.query(
      `SELECT
         COALESCE((SELECT SUM(total) FROM ventas
                   WHERE empresa_id=$1 AND DATE(fecha) >= $2), 0) AS pos,
         COALESCE((SELECT SUM(total) FROM pedidos_online
                   WHERE empresa_id=$1 AND DATE(fecha_pedido) >= $2 AND estado != 'cancelado'), 0) AS online`,
      [empresa_id, desde]
    );

    res.json({
      periodo,
      desde,
      kpis: {
        total_ventas: parseInt(total_ventas),
        ingresos: parseFloat(ingresos),
        ticket_promedio: parseFloat(ticketPromedio.toFixed(2)),
        clientes_activos: parseInt(clientes_activos),
      },
      ventasPorDia: ventasPorDia.rows,
      topProductos: topProductos.rows,
      topClientes: topClientes.rows,
      posVsOnline: posVsOnline.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// RENTABILIDAD POR PRODUCTO
// ─────────────────────────────────────────────────────────────────────────────
export const getRentabilidad = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const periodo    = req.query.periodo || "mes";
    const desde      = calcDesde(periodo);

    const result = await pool.query(
      `SELECT
         p.id,
         p.nombre,
         p.precio,
         p.precio_costo,
         SUM(t.unidades)  AS unidades_vendidas,
         SUM(t.ingresos)  AS ingresos_brutos,
         SUM(t.costo)     AS costo_total,
         SUM(t.ingresos) - SUM(t.costo) AS ganancia_bruta,
         CASE WHEN SUM(t.ingresos) > 0
           THEN ROUND(((SUM(t.ingresos) - SUM(t.costo)) / SUM(t.ingresos) * 100)::numeric, 1)
           ELSE 0
         END AS margen_pct
       FROM (
         SELECT dv.producto_id,
                SUM(dv.cantidad)                                        AS unidades,
                SUM(dv.cantidad * dv.precio_unitario)                   AS ingresos,
                SUM(dv.cantidad * COALESCE(pr.precio_costo, 0))         AS costo
         FROM detalle_venta dv
         JOIN ventas v    ON v.id  = dv.venta_id
         JOIN productos pr ON pr.id = dv.producto_id
         WHERE v.empresa_id = $1 AND DATE(v.fecha) >= $2
         GROUP BY dv.producto_id

         UNION ALL

         SELECT dp.producto_id,
                SUM(dp.cantidad)                                        AS unidades,
                SUM(dp.cantidad * dp.precio_unitario)                   AS ingresos,
                SUM(dp.cantidad * COALESCE(pr.precio_costo, 0))         AS costo
         FROM detalle_pedido_online dp
         JOIN pedidos_online po ON po.id  = dp.pedido_id
         JOIN productos pr      ON pr.id  = dp.producto_id
         WHERE po.empresa_id = $1 AND DATE(po.fecha_pedido) >= $2
           AND po.estado != 'cancelado'
         GROUP BY dp.producto_id
       ) t
       JOIN productos p ON p.id = t.producto_id
       GROUP BY p.id, p.nombre, p.precio, p.precio_costo
       ORDER BY ganancia_bruta DESC`,
      [empresa_id, desde]
    );

    // Totales globales para el período
    const totales = result.rows.reduce(
      (acc, r) => ({
        ingresos:      acc.ingresos      + parseFloat(r.ingresos_brutos),
        costo:         acc.costo         + parseFloat(r.costo_total),
        ganancia:      acc.ganancia      + parseFloat(r.ganancia_bruta),
        unidades:      acc.unidades      + parseFloat(r.unidades_vendidas),
      }),
      { ingresos: 0, costo: 0, ganancia: 0, unidades: 0 }
    );
    totales.margen_pct = totales.ingresos > 0
      ? parseFloat(((totales.ganancia / totales.ingresos) * 100).toFixed(1))
      : 0;

    res.json({ periodo, desde, productos: result.rows, totales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPARATIVA: período actual vs período anterior
// ─────────────────────────────────────────────────────────────────────────────
export const getComparativa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const periodo    = req.query.periodo || "mes";

    const { desde: desdeActual, hasta: hastaActual,
            desdeAnterior, hastaAnterior, label, labelAnterior } = calcRangos(periodo);

    const kpisQuery = (desdeStr, hastaStr) => pool.query(
      `SELECT
         (SELECT COUNT(*) FROM ventas
          WHERE empresa_id=$1 AND DATE(fecha) BETWEEN $2 AND $3)
         + (SELECT COUNT(*) FROM pedidos_online
            WHERE empresa_id=$1 AND DATE(fecha_pedido) BETWEEN $2 AND $3
            AND estado != 'cancelado')                                  AS total_ventas,

         COALESCE((SELECT SUM(total) FROM ventas
                   WHERE empresa_id=$1 AND DATE(fecha) BETWEEN $2 AND $3), 0)
         + COALESCE((SELECT SUM(total) FROM pedidos_online
                     WHERE empresa_id=$1 AND DATE(fecha_pedido) BETWEEN $2 AND $3
                     AND estado != 'cancelado'), 0)                     AS ingresos,

         (SELECT COUNT(DISTINCT cliente_id) FROM ventas
          WHERE empresa_id=$1 AND DATE(fecha) BETWEEN $2 AND $3)
         + (SELECT COUNT(DISTINCT cliente_id) FROM pedidos_online
            WHERE empresa_id=$1 AND DATE(fecha_pedido) BETWEEN $2 AND $3
            AND estado != 'cancelado')                                  AS clientes_activos`,
      [empresa_id, desdeStr, hastaStr]
    );

    const [rActual, rAnterior] = await Promise.all([
      kpisQuery(desdeActual, hastaActual),
      kpisQuery(desdeAnterior, hastaAnterior),
    ]);

    const actual   = rActual.rows[0];
    const anterior = rAnterior.rows[0];

    const pct = (a, b) => {
      a = parseFloat(a); b = parseFloat(b);
      if (b === 0) return a > 0 ? 100 : 0;
      return parseFloat(((a - b) / b * 100).toFixed(1));
    };

    const ticketActual   = actual.total_ventas   > 0 ? actual.ingresos   / actual.total_ventas   : 0;
    const ticketAnterior = anterior.total_ventas > 0 ? anterior.ingresos / anterior.total_ventas : 0;

    // Ventas por día para ambos períodos (para la gráfica superpuesta)
    const diasQuery = (desdeStr, hastaStr) => pool.query(
      `SELECT dia, SUM(total) AS total
       FROM (
         SELECT DATE(fecha) AS dia, SUM(total) AS total
         FROM ventas WHERE empresa_id=$1 AND DATE(fecha) BETWEEN $2 AND $3
         GROUP BY dia
         UNION ALL
         SELECT DATE(fecha_pedido) AS dia, SUM(total) AS total
         FROM pedidos_online WHERE empresa_id=$1
           AND DATE(fecha_pedido) BETWEEN $2 AND $3 AND estado != 'cancelado'
         GROUP BY dia
       ) t GROUP BY dia ORDER BY dia ASC`,
      [empresa_id, desdeStr, hastaStr]
    );

    const [dActual, dAnterior] = await Promise.all([
      diasQuery(desdeActual, hastaActual),
      diasQuery(desdeAnterior, hastaAnterior),
    ]);

    res.json({
      periodo, label, labelAnterior,
      actual: {
        ingresos:        parseFloat(actual.ingresos),
        total_ventas:    parseInt(actual.total_ventas),
        ticket_promedio: parseFloat(ticketActual.toFixed(2)),
        clientes_activos: parseInt(actual.clientes_activos),
        ventasPorDia:    dActual.rows,
      },
      anterior: {
        ingresos:        parseFloat(anterior.ingresos),
        total_ventas:    parseInt(anterior.total_ventas),
        ticket_promedio: parseFloat(ticketAnterior.toFixed(2)),
        clientes_activos: parseInt(anterior.clientes_activos),
        ventasPorDia:    dAnterior.rows,
      },
      cambios: {
        ingresos:         pct(actual.ingresos,        anterior.ingresos),
        total_ventas:     pct(actual.total_ventas,    anterior.total_ventas),
        ticket_promedio:  pct(ticketActual,           ticketAnterior),
        clientes_activos: pct(actual.clientes_activos, anterior.clientes_activos),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS de fechas
// ─────────────────────────────────────────────────────────────────────────────
function calcDesde(periodo) {
  const ahora = new Date();
  if (periodo === "hoy")    return ahora.toISOString().slice(0, 10);
  if (periodo === "semana") {
    const d = new Date(ahora); d.setDate(ahora.getDate() - 6);
    return d.toISOString().slice(0, 10);
  }
  if (periodo === "mes") return new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().slice(0, 10);
  return new Date(ahora.getFullYear(), 0, 1).toISOString().slice(0, 10); // año
}

function calcRangos(periodo) {
  const ahora = new Date();
  const fmt   = (d) => d.toISOString().slice(0, 10);

  if (periodo === "hoy") {
    const hoy      = fmt(ahora);
    const ayer     = fmt(new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1));
    return { desde: hoy, hasta: hoy, desdeAnterior: ayer, hastaAnterior: ayer,
             desdeActual: hoy, hastaActual: hoy, label: "Hoy", labelAnterior: "Ayer" };
  }
  if (periodo === "semana") {
    const desde  = new Date(ahora); desde.setDate(ahora.getDate() - 6);
    const dAntes = new Date(ahora); dAntes.setDate(ahora.getDate() - 13);
    const hAntes = new Date(ahora); hAntes.setDate(ahora.getDate() - 7);
    return { desdeActual: fmt(desde), hastaActual: fmt(ahora),
             desdeAnterior: fmt(dAntes), hastaAnterior: fmt(hAntes),
             label: "Últimos 7 días", labelAnterior: "7 días anteriores" };
  }
  if (periodo === "mes") {
    const desdeActual  = fmt(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
    const hastaActual  = fmt(ahora);
    const desdeAnterior = fmt(new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1));
    const hastaAnterior = fmt(new Date(ahora.getFullYear(), ahora.getMonth(), 0));
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return { desdeActual, hastaActual, desdeAnterior, hastaAnterior,
             label: meses[ahora.getMonth()], labelAnterior: meses[ahora.getMonth() - 1 < 0 ? 11 : ahora.getMonth() - 1] };
  }
  // año
  const desdeActual   = fmt(new Date(ahora.getFullYear(), 0, 1));
  const hastaActual   = fmt(ahora);
  const desdeAnterior = fmt(new Date(ahora.getFullYear() - 1, 0, 1));
  const hastaAnterior = fmt(new Date(ahora.getFullYear() - 1, 11, 31));
  return { desdeActual, hastaActual, desdeAnterior, hastaAnterior,
           label: String(ahora.getFullYear()), labelAnterior: String(ahora.getFullYear() - 1) };
}

// ─────────────────────────────────────────────────────────────────────────────
export const getResumenInicio = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // Ventas de hoy (POS + pedidos online no cancelados)
    const ventasHoy = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM ventas
          WHERE empresa_id = $1 AND DATE(fecha) = CURRENT_DATE)
         +
         (SELECT COUNT(*) FROM pedidos_online
          WHERE empresa_id = $1 AND DATE(fecha_pedido) = CURRENT_DATE
          AND estado != 'cancelado')
         AS total_ventas,
         COALESCE(
           (SELECT SUM(total) FROM ventas
            WHERE empresa_id = $1 AND DATE(fecha) = CURRENT_DATE), 0
         )
         +
         COALESCE(
           (SELECT SUM(total) FROM pedidos_online
            WHERE empresa_id = $1 AND DATE(fecha_pedido) = CURRENT_DATE
            AND estado != 'cancelado'), 0
         )
         AS ingresos_hoy`,
      [empresa_id]
    );

    // Pedidos online pendientes
    const pedidosPendientes = await pool.query(
      `SELECT COUNT(*) AS total
       FROM pedidos_online
       WHERE empresa_id = $1 AND estado = 'pendiente'`,
      [empresa_id]
    );

    // Productos con stock bajo (stock <= stock_minimo)
    const stockBajo = await pool.query(
      `SELECT COUNT(*) AS total
       FROM productos
       WHERE empresa_id = $1
       AND stock_minimo IS NOT NULL
       AND stock <= stock_minimo`,
      [empresa_id]
    );

    // Total clientes
    const clientes = await pool.query(
      `SELECT COUNT(*) AS total
       FROM persona
       WHERE empresa_id = $1 AND rol_id = 4`,
      [empresa_id]
    );

    // Total productos
    const productos = await pool.query(
      `SELECT COUNT(*) AS total FROM productos WHERE empresa_id = $1`,
      [empresa_id]
    );

    // Últimos 5 pedidos online
    const ultimosPedidos = await pool.query(
      `SELECT po.id, po.estado, po.total, po.fecha_pedido,
              p.nombre, p.apellido
       FROM pedidos_online po
       JOIN persona p ON p.id = po.cliente_id
       WHERE po.empresa_id = $1
       ORDER BY po.fecha_pedido DESC
       LIMIT 5`,
      [empresa_id]
    );

    // Productos con stock bajo detalle
    const productosStockBajo = await pool.query(
      `SELECT nombre, stock, stock_minimo
       FROM productos
       WHERE empresa_id = $1
       AND stock_minimo IS NOT NULL
       AND stock <= stock_minimo
       ORDER BY stock ASC
       LIMIT 5`,
      [empresa_id]
    );

    // Sugerencias de reorden: promedio diario (30 días) y cantidad sugerida (7 días)
    const sugerenciasReorden = await pool.query(
      `SELECT
         p.id,
         p.nombre,
         p.stock,
         p.stock_minimo,
         p.unidad,
         ROUND(COALESCE(v30.total_vendido / 30.0, 0)::numeric, 2) AS promedio_diario,
         GREATEST(0, ROUND((COALESCE(v30.total_vendido / 30.0, 0) * 7 - p.stock)::numeric, 1)) AS cantidad_sugerida
       FROM productos p
       LEFT JOIN (
         SELECT producto_id, SUM(cantidad) AS total_vendido
         FROM (
           SELECT dv.producto_id, dv.cantidad
           FROM detalle_venta dv
           JOIN ventas v ON v.id = dv.venta_id
           WHERE v.empresa_id = $1
             AND v.fecha >= NOW() - INTERVAL '30 days'
           UNION ALL
           SELECT dp.producto_id, dp.cantidad
           FROM detalle_pedido_online dp
           JOIN pedidos_online po ON po.id = dp.pedido_id
           WHERE po.empresa_id = $1
             AND po.fecha_pedido >= NOW() - INTERVAL '30 days'
             AND po.estado != 'cancelado'
         ) t
         GROUP BY producto_id
       ) v30 ON v30.producto_id = p.id
       WHERE p.empresa_id = $1
         AND p.stock_minimo IS NOT NULL
         AND p.stock <= p.stock_minimo
       ORDER BY p.stock ASC
       LIMIT 8`,
      [empresa_id]
    );

    // Ventas del mes actual (POS + pedidos online)
    const ventasMes = await pool.query(
      `SELECT
         COALESCE(
           (SELECT SUM(total) FROM ventas
            WHERE empresa_id = $1
            AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)), 0
         )
         +
         COALESCE(
           (SELECT SUM(total) FROM pedidos_online
            WHERE empresa_id = $1
            AND DATE_TRUNC('month', fecha_pedido) = DATE_TRUNC('month', CURRENT_DATE)
            AND estado != 'cancelado'), 0
         ) AS total_mes`,
      [empresa_id]
    );

    // Clientes dormidos: sin compra en los últimos 30 días
    const clientesDormidos = await pool.query(
      `SELECT p.id, p.nombre, p.apellido, p.telefono,
              MAX(GREATEST(
                COALESCE(v.fecha::date, '2000-01-01'::date),
                COALESCE(po.fecha_pedido::date, '2000-01-01'::date)
              )) AS ultima_compra
       FROM persona p
       LEFT JOIN ventas v ON v.cliente_id = p.id AND v.empresa_id = $1
       LEFT JOIN pedidos_online po ON po.cliente_id = p.id AND po.empresa_id = $1
                                   AND po.estado != 'cancelado'
       WHERE p.empresa_id = $1 AND p.rol_id = 4
       GROUP BY p.id, p.nombre, p.apellido, p.telefono
       HAVING MAX(GREATEST(
                COALESCE(v.fecha::date, '2000-01-01'::date),
                COALESCE(po.fecha_pedido::date, '2000-01-01'::date)
              )) < CURRENT_DATE - INTERVAL '30 days'
          OR (MAX(v.fecha) IS NULL AND MAX(po.fecha_pedido) IS NULL)
       ORDER BY ultima_compra ASC NULLS FIRST
       LIMIT 8`,
      [empresa_id]
    );

    // ── ONBOARDING: verificar qué pasos están completos ──
    const [empresaInfo, lealtadCount, equipoCount, referidosCount] = await Promise.all([
      pool.query(
        `SELECT logo_url, descripcion, whatsapp, color_primario, banner_url
         FROM empresas WHERE id = $1`,
        [empresa_id]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM niveles_lealtad WHERE empresa_id = $1`,
        [empresa_id]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM persona
         WHERE empresa_id = $1 AND rol_id != 1`,
        [empresa_id]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM referidos_config_referidor
         WHERE empresa_id = $1 AND activo = true`,
        [empresa_id]
      ).catch(() => ({ rows: [{ total: 0 }] })), // tabla puede no existir aún
    ]);

    const emp = empresaInfo.rows[0] || {};
    const onboarding = {
      tieneProductos: parseInt(productos.rows[0].total) > 0,
      tieneLogo:      !!emp.logo_url,
      tienePerfil:    !!(emp.descripcion || emp.whatsapp),
      tieneLealtad:   parseInt(lealtadCount.rows[0].total) > 0,
      tieneEquipo:    parseInt(equipoCount.rows[0].total) > 0,
      tieneTienda:    !!(emp.color_primario || emp.banner_url),
      tieneReferidos: parseInt(referidosCount.rows[0].total) > 0,
    };
    onboarding.total       = 7; // 7 pasos fijos
    onboarding.completados = Object.values(onboarding).filter(Boolean).length;
    onboarding.completo    = onboarding.completados === onboarding.total;

    res.json({
      ventasHoy:          ventasHoy.rows[0],
      ventasMes:          parseFloat(ventasMes.rows[0].total_mes),
      pedidosPendientes:  parseInt(pedidosPendientes.rows[0].total),
      stockBajo:          parseInt(stockBajo.rows[0].total),
      totalClientes:      parseInt(clientes.rows[0].total),
      totalProductos:     parseInt(productos.rows[0].total),
      ultimosPedidos:     ultimosPedidos.rows,
      productosStockBajo: productosStockBajo.rows,
      sugerenciasReorden: sugerenciasReorden.rows,
      clientesDormidos:   clientesDormidos.rows,
      onboarding,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
};