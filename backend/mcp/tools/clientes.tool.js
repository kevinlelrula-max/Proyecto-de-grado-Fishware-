import { z } from "zod";

export function registerClientesTools(server, pool, empresa_id) {
  server.tool(
    "get_clientes_frecuentes",
    "Clientes con más compras en los últimos meses, con total acumulado y número de órdenes",
    {
      limite: z.number().optional().describe("Cantidad de clientes a mostrar (por defecto 10)"),
      dias: z.number().optional().describe("Rango de días hacia atrás a analizar (por defecto 90)"),
    },
    async ({ limite = 10, dias = 90 }) => {
      const result = await pool.query(
        `SELECT
           c.nombre,
           c.email,
           c.telefono,
           COUNT(v.id) AS total_compras,
           COALESCE(SUM(v.total), 0) AS total_gastado
         FROM clientes c
         JOIN ventas v ON v.cliente_id = c.id
         WHERE v.empresa_id = $1 AND v.fecha >= NOW() - ($2 || ' days')::INTERVAL
         GROUP BY c.id, c.nombre, c.email, c.telefono
         ORDER BY total_compras DESC, total_gastado DESC
         LIMIT $3`,
        [empresa_id, dias, limite]
      );

      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: `No hay clientes con compras en los últimos ${dias} días.` }],
        };
      }

      const lista = result.rows
        .map(
          (c, i) =>
            `${i + 1}. ${c.nombre}${c.email ? ` (${c.email})` : ""}\n` +
            `   ${c.total_compras} compra(s) · $${Number(c.total_gastado).toLocaleString("es-CO")} COP total`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Top ${result.rows.length} clientes más frecuentes (últimos ${dias} días):\n\n${lista}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_historial_cliente",
    "Historial de compras de un cliente específico: qué compró, cuándo y cuánto gastó",
    {
      nombre: z.string().describe("Nombre o parte del nombre del cliente"),
    },
    async ({ nombre }) => {
      const clienteResult = await pool.query(
        `SELECT id, nombre, email, telefono
         FROM clientes
         WHERE empresa_id = $1 AND LOWER(nombre) LIKE LOWER($2)
         LIMIT 1`,
        [empresa_id, `%${nombre}%`]
      );

      if (clienteResult.rows.length === 0) {
        return {
          content: [{ type: "text", text: `No se encontró ningún cliente con el nombre "${nombre}".` }],
        };
      }

      const cliente = clienteResult.rows[0];

      const ventasResult = await pool.query(
        `SELECT
           v.id,
           v.fecha,
           v.total,
           JSON_AGG(
             JSON_BUILD_OBJECT('producto', p.nombre, 'cantidad', dv.cantidad)
             ORDER BY p.nombre
           ) AS productos
         FROM ventas v
         JOIN detalle_venta dv ON dv.venta_id = v.id
         JOIN productos p ON p.id = dv.producto_id
         WHERE v.empresa_id = $1 AND v.cliente_id = $2
         GROUP BY v.id, v.fecha, v.total
         ORDER BY v.fecha DESC
         LIMIT 15`,
        [empresa_id, cliente.id]
      );

      const totalGastado = ventasResult.rows.reduce(
        (acc, v) => acc + Number(v.total),
        0
      );

      if (ventasResult.rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `${cliente.nombre} está registrado pero no tiene compras registradas.`,
            },
          ],
        };
      }

      const historial = ventasResult.rows
        .map(
          (v) =>
            `• ${new Date(v.fecha).toLocaleDateString("es-CO")} — $${Number(v.total).toLocaleString("es-CO")} COP\n` +
            `  ${v.productos.map((p) => `${p.producto} x${p.cantidad}`).join(", ")}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text:
              `Cliente: ${cliente.nombre}${cliente.email ? ` · ${cliente.email}` : ""}${cliente.telefono ? ` · ${cliente.telefono}` : ""}\n` +
              `Total gastado: $${totalGastado.toLocaleString("es-CO")} COP en ${ventasResult.rows.length} compra(s)\n\n` +
              `Historial:\n${historial}`,
          },
        ],
      };
    }
  );
}
