import pool from "../config/db.js";

// =========================
// ABRIR SESIÓN DE CAJA
// =========================
export const abrirCaja = async (req, res) => {
  try {
    const empresa_id  = req.user.empresa_id;
    const usuario_id  = req.user.id;
    const { monto_apertura = 0 } = req.body;

    // Verificar si ya hay una sesión abierta
    const abierta = await pool.query(
      `SELECT id FROM caja_sesiones WHERE empresa_id = $1 AND estado = 'abierta' LIMIT 1`,
      [empresa_id]
    );
    if (abierta.rows.length > 0) {
      return res.status(409).json({ error: "Ya hay una caja abierta", sesion_id: abierta.rows[0].id });
    }

    const result = await pool.query(
      `INSERT INTO caja_sesiones (empresa_id, usuario_id, monto_apertura)
       VALUES ($1, $2, $3) RETURNING *`,
      [empresa_id, usuario_id, Number(monto_apertura)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error abrirCaja:", error);
    res.status(500).json({ error: "Error al abrir caja" });
  }
};

// =========================
// CERRAR SESIÓN DE CAJA
// =========================
export const cerrarCaja = async (req, res) => {
  try {
    const empresa_id  = req.user.empresa_id;
    const { sesion_id, monto_cierre, observaciones } = req.body;

    if (!sesion_id || monto_cierre === undefined) {
      return res.status(400).json({ error: "sesion_id y monto_cierre son obligatorios" });
    }

    const result = await pool.query(
      `UPDATE caja_sesiones
       SET estado = 'cerrada', monto_cierre = $1, observaciones = $2, fecha_cierre = NOW()
       WHERE id = $3 AND empresa_id = $4 AND estado = 'abierta'
       RETURNING *`,
      [Number(monto_cierre), observaciones || null, sesion_id, empresa_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Sesión no encontrada o ya cerrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error cerrarCaja:", error);
    res.status(500).json({ error: "Error al cerrar caja" });
  }
};

// =========================
// SESIÓN ACTIVA
// =========================
export const getSesionActiva = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const result = await pool.query(
      `SELECT cs.*, p.nombre AS usuario_nombre
       FROM caja_sesiones cs
       JOIN persona p ON p.id = cs.usuario_id
       WHERE cs.empresa_id = $1 AND cs.estado = 'abierta'
       ORDER BY cs.fecha_apertura DESC LIMIT 1`,
      [empresa_id]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Error getSesionActiva:", error);
    res.status(500).json({ error: "Error al obtener sesión activa" });
  }
};

// =========================
// HISTORIAL DE SESIONES
// =========================
export const getHistorialCaja = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const result = await pool.query(
      `SELECT cs.*, p.nombre AS usuario_nombre
       FROM caja_sesiones cs
       JOIN persona p ON p.id = cs.usuario_id
       WHERE cs.empresa_id = $1
       ORDER BY cs.fecha_apertura DESC
       LIMIT 30`,
      [empresa_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error getHistorialCaja:", error);
    res.status(500).json({ error: "Error al obtener historial de caja" });
  }
};
