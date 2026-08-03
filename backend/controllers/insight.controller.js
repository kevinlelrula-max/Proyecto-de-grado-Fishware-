import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../config/db.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gemini = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Cache por empresa: empresa_id -> { generatedAt, content }
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export const getInsight = async (req, res) => {
  const empresa_id = req.user.empresa_id;

  const cached = cache.get(empresa_id);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL) {
    return res.json({ insight: cached.content, cached: true, generatedAt: cached.generatedAt });
  }

  try {
    const hoy = new Date().toISOString().split("T")[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const hace7 = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    const [ventasHoy, ventasAyer, stockCritico, pedidos, topProductos] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(total),0) AS ingresos, COUNT(*) AS transacciones
         FROM ventas WHERE empresa_id=$1 AND DATE(fecha)=CURRENT_DATE`,
        [empresa_id]
      ),
      pool.query(
        `SELECT COALESCE(SUM(total),0) AS ingresos, COUNT(*) AS transacciones
         FROM ventas WHERE empresa_id=$1 AND DATE(fecha)=$2`,
        [empresa_id, ayer]
      ),
      pool.query(
        `SELECT nombre, stock, stock_minimo
         FROM productos
         WHERE empresa_id=$1 AND stock_minimo IS NOT NULL AND stock<=stock_minimo
         ORDER BY stock ASC LIMIT 5`,
        [empresa_id]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pedidos_online
         WHERE empresa_id=$1 AND estado='pendiente'`,
        [empresa_id]
      ),
      pool.query(
        `SELECT p.nombre, SUM(dv.cantidad) AS unidades
         FROM detalle_venta dv
         JOIN ventas v ON v.id=dv.venta_id
         JOIN productos p ON p.id=dv.producto_id
         WHERE v.empresa_id=$1 AND DATE(v.fecha) BETWEEN $2 AND $3
         GROUP BY p.id, p.nombre ORDER BY unidades DESC LIMIT 3`,
        [empresa_id, hace7, hoy]
      ),
    ]);

    const ingHoy  = Number(ventasHoy.rows[0].ingresos);
    const txHoy   = Number(ventasHoy.rows[0].transacciones);
    const ingAyer = Number(ventasAyer.rows[0].ingresos);
    const txAyer  = Number(ventasAyer.rows[0].transacciones);
    const varIng  = ingAyer > 0 ? (((ingHoy - ingAyer) / ingAyer) * 100).toFixed(1) : null;

    const fmt = (n) => Number(n).toLocaleString("es-CO");

    const contexto = [
      `Fecha: ${hoy}`,
      `Ventas hoy: $${fmt(ingHoy)} COP | ${txHoy} transacciones`,
      `Ventas ayer: $${fmt(ingAyer)} COP | ${txAyer} transacciones`,
      varIng !== null ? `Variación vs ayer: ${Number(varIng) >= 0 ? "+" : ""}${varIng}%` : "Sin datos de ayer para comparar",
      `Pedidos online pendientes: ${pedidos.rows[0].total}`,
      stockCritico.rows.length > 0
        ? `Productos con stock crítico: ${stockCritico.rows.map(p => `${p.nombre} (${p.stock} uds.)`).join(", ")}`
        : "Sin productos en stock crítico",
      topProductos.rows.length > 0
        ? `Top productos últimos 7 días: ${topProductos.rows.map((p, i) => `${i + 1}. ${p.nombre}`).join(", ")}`
        : "Sin ventas en los últimos 7 días",
    ].join("\n");

    const prompt = `Eres un consejero de negocios conciso. Analiza estos datos y escribe un párrafo breve (3-4 oraciones) en español con: qué está pasando hoy, algo notable (positivo o negativo), y UNA recomendación accionable concreta. Sin saludos, sin listas, solo el análisis directo.\n\n${contexto}`;

    const result = await gemini.generateContent(prompt);
    const content = result.response.text().trim();
    cache.set(empresa_id, { generatedAt: Date.now(), content });

    res.json({ insight: content, cached: false, generatedAt: Date.now() });
  } catch (err) {
    console.error("[Insight] Error:", err.message);
    res.status(500).json({ error: "No se pudo generar el análisis" });
  }
};
