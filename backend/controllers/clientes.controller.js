import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generarToken } from "../utils/jwt.js";
// Clientes

export const getClientes = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, telefono, direccion
       FROM persona 
       WHERE empresa_id = $1 AND rol_id = 4`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

export const crearCliente = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const {
      nombre,
      apellido,
      usuario,
      contrasena,
      telefono,
      direccion
    } = req.body;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO persona 
      (empresa_id, nombre, apellido, usuario, contrasena, telefono, direccion, rol_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,4)
      RETURNING id, nombre, usuario`,
      [
        empresa_id,
        nombre,
        apellido,
        usuario,
        hashedPassword,
        telefono,
        direccion
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    const { nombre, apellido, telefono, direccion } = req.body;

    const result = await pool.query(
      `UPDATE persona
       SET nombre=$1, apellido=$2, telefono=$3, direccion=$4
       WHERE id=$5 AND empresa_id=$6 AND rol_id=4
       RETURNING *`,
      [nombre, apellido, telefono, direccion, id, empresa_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    await pool.query(
      `DELETE FROM persona 
       WHERE id = $1 AND empresa_id = $2 AND rol_id = 4`,
      [id, empresa_id]
    );

    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};