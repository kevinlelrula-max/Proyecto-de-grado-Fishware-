import pool from "../config/db.js";
import bcrypt from "bcrypt";

// 🔹 Obtener usuarios de la empresa
export const getUsuarios = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, telefono, direccion, numero_documento, rol_id, id_municipio, fecha_registro 
       FROM persona 
       WHERE empresa_id = $1`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// 🔹 Crear usuario (SOLO ADMIN)
export const crearUsuario = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // 🔐 Validar rol (solo admin puede crear)
    if (req.user.rol_id !== 1) {
      return res.status(403).json({ error: "Solo el administrador puede crear usuarios" });
    }

    const {
      nombre,
      apellido,
      usuario,
      contrasena,
      telefono,
      direccion,
      numero_documento,
      rol_id,
      id_municipio
    } = req.body;

    // 🔐 Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO persona 
      (empresa_id, nombre, apellido, usuario, contrasena, telefono, direccion, numero_documento, rol_id, id_municipio)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, nombre, apellido, usuario, telefono, direccion, numero_documento, rol_id, id_municipio`,
      [
        empresa_id,
        nombre,
        apellido,
        usuario,
        hashedPassword, // 🔥 contraseña encriptada
        telefono,
        direccion,
        numero_documento,
        rol_id,
        id_municipio
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    // 🔥 Manejo de usuario duplicado
    if (error.code === "23505") {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    res.status(500).json({ error: "Error al crear usuario" });
  }
};