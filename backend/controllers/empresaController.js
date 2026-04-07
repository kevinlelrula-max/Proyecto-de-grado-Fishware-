import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generarToken } from "../utils/jwt.js";

export const registrarEmpresa = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombre_empresa,
      nit,
      email_empresa,
      telefono_empresa,
      nombre_admin,
      apellido_admin,
      usuario_admin,
      contrasena_admin,
      telefono_admin,
      direccion_admin,
      numero_documento_admin,
      id_municipio
    } = req.body;

    if (!nombre_empresa || !usuario_admin || !contrasena_admin) {
      return res.status(400).json({ error: "Datos obligatorios incompletos" });
    }

    await client.query("BEGIN");

    // 🔹 Crear empresa
    const empresaResult = await client.query(
      `INSERT INTO empresas (nombre, nit, email, telefono)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [nombre_empresa, nit, email_empresa, telefono_empresa]
    );

    const empresa = empresaResult.rows[0];

    // 🔹 Crear usuario admin
    const hashedPassword = await bcrypt.hash(contrasena_admin, 10);

    const usuarioResult = await client.query(
      `INSERT INTO persona
       (empresa_id, nombre, apellido, usuario, contrasena, telefono, direccion, rol_id, id_municipio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,1,$8)
       RETURNING id, nombre, apellido, usuario, rol_id, empresa_id`,
      [
        empresa.id,
        nombre_admin,
        apellido_admin,
        usuario_admin,
        hashedPassword,
        telefono_admin,
        direccion_admin,
        id_municipio
      ]
    );

    const admin = usuarioResult.rows[0];

    await client.query("COMMIT");

    // 🔹 Generar token JWT
    const token = generarToken(admin);

    res.json({
      message: "Empresa y admin creados con éxito 🚀",
      token,
      usuario: admin.usuario,
      empresa_id: admin.empresa_id,
      rol_id: admin.rol_id
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Usuario o empresa ya existe" });
    }
    res.status(500).json({ error: "Error al registrar empresa" });
  } finally {
    client.release();
  }
};