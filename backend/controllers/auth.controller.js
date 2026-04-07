import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generarToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
    }

    const result = await pool.query(
      "SELECT * FROM persona WHERE usuario = $1",
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(contrasena, user.contrasena);

const valid = match || contrasena === user.contrasena;

if (!valid) {
  return res.status(401).json({ error: "Contraseña incorrecta" });
}
    const token = generarToken(user);

    res.json({
      token,
      usuario: user.usuario,
      empresa_id: user.empresa_id,
      rol_id: user.rol_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
};