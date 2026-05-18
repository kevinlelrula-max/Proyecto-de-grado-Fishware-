import pool from "../config/db.js";
import { crearNotificacion } from "../utils/notificaciones.js";

function generarCodigo(nombre = "") {
  const prefix = nombre.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X").padEnd(3, "X");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}${suffix}`;
}
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generarToken } from "../utils/jwt.js";
import { enviarEmailRecuperacion } from "../utils/email.js";
// Clientes

export const getClientes = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, telefono, direccion, numero_documento
       FROM persona 
       WHERE empresa_id = $1 AND rol_id = 4`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

// ✅ Nueva — búsqueda en tiempo real para el POS
export const buscarClientes = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { q } = req.query;

    const result = await pool.query(
      `SELECT id, nombre, apellido, numero_documento, telefono
       FROM persona
       WHERE empresa_id = $1 AND rol_id = 4
         AND (nombre ILIKE $2 OR apellido ILIKE $2 OR numero_documento ILIKE $2)
       ORDER BY nombre
       LIMIT 10`,
      [empresa_id, `%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en la búsqueda" });
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
      direccion,
      numero_documento,
      tipo_documento,   // ← agregar
      id_municipio      // ← agregar
    } = req.body;

    const tieneAcceso = usuario && contrasena;

    const usuarioFinal = tieneAcceso
      ? usuario
      : (numero_documento || `cliente_${Date.now()}`);

    const contrasenaFinal = tieneAcceso
      ? await bcrypt.hash(contrasena, 10)
      : await bcrypt.hash(`sin_acceso_${Date.now()}`, 10);

    const result = await pool.query(
      `INSERT INTO persona 
      (empresa_id, nombre, apellido, usuario, contrasena, telefono, direccion, 
       numero_documento, tipo_documento, id_municipio, rol_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,4)
      RETURNING id, nombre, apellido, usuario, numero_documento`,
      [
        empresa_id,
        nombre,
        apellido,
        usuarioFinal,
        contrasenaFinal,
        telefono       || null,
        direccion      || null,
        numero_documento || null,
        tipo_documento || 'Cédula de ciudadanía',
        id_municipio   ? Number(id_municipio) : null  // ← castear a número
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

// ✅ Eliminación segura — verifica primero si tiene ventas asociadas
export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    // Verificar si tiene ventas antes de eliminar
    const ventas = await pool.query(
      `SELECT COUNT(*) FROM ventas WHERE cliente_id = $1 AND empresa_id = $2`,
      [id, empresa_id]
    );

    if (parseInt(ventas.rows[0].count) > 0) {
      return res.status(400).json({
        error: "No se puede eliminar un cliente con ventas registradas"
      });
    }

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

export const registrarClientePublico = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      usuario,
      contrasena,
      telefono,
      direccion,
      tipo_documento,
      numero_documento,
      id_municipio,
      empresa_id,
      codigo_referido_invitante, // código del cliente que refirió
    } = req.body;

    const hashedPassword  = await bcrypt.hash(contrasena, 10);
    const codigoPropio    = generarCodigo(nombre); // código único del nuevo cliente

    const result = await pool.query(
      `INSERT INTO persona (
        nombre, apellido, usuario, contrasena,
        telefono, direccion, tipo_documento,
        numero_documento, rol_id, id_municipio, codigo_referido
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,4,$9,$10)
      RETURNING *`,
      [
        nombre, apellido, usuario, hashedPassword,
        telefono, direccion, tipo_documento,
        numero_documento, id_municipio, codigoPropio,
      ]
    );

    const nuevoCliente = result.rows[0];

    // 🔔 Notificación nuevo cliente
    if (empresa_id) {
      crearNotificacion({
        empresa_id,
        tipo:          "nuevo_cliente",
        titulo:        "Nuevo cliente registrado",
        mensaje:       `${nombre} ${apellido} se registró en la tienda.`,
        seccion:       "clientes",
        referencia_id: nuevoCliente.id,
      });
    }

    // 🤝 Procesar referido si llegó con un código
    if (codigo_referido_invitante && empresa_id) {
      try {
        const { rows: [referidor] } = await pool.query(
          `SELECT id FROM persona WHERE codigo_referido=$1`, [codigo_referido_invitante]
        );

        if (referidor && referidor.id !== nuevoCliente.id) {
          // Anti-abuso: verificar límite de 3 referidos desde la misma IP en 72h
          const ip = req.ip || req.headers["x-forwarded-for"] || null;
          const { rows: [limiteIp] } = await pool.query(
            `SELECT COUNT(*) AS total FROM referidos
             WHERE empresa_id=$1 AND ip_registro=$2
             AND creado_en >= NOW() - INTERVAL '72 hours'`,
            [empresa_id, ip]
          );

          if (parseInt(limiteIp.total) < 3) {
            // Obtener nivel actual del referidor para calcular el descuento
            const { rows: pos }    = await pool.query(
              `SELECT COALESCE(SUM(total),0) AS total FROM ventas
               WHERE cliente_id=$1 AND empresa_id=$2
               AND DATE_TRUNC('month',fecha)=DATE_TRUNC('month',NOW())`,
              [referidor.id, empresa_id]
            );
            const { rows: online } = await pool.query(
              `SELECT COALESCE(SUM(total),0) AS total FROM pedidos_online
               WHERE cliente_id=$1 AND empresa_id=$2
               AND DATE_TRUNC('month',fecha_pedido)=DATE_TRUNC('month',NOW())
               AND estado!='cancelado'`,
              [referidor.id, empresa_id]
            );
            const totalMes = parseFloat(pos[0].total) + parseFloat(online[0].total);
            const { rows: niveles } = await pool.query(
              `SELECT * FROM niveles_lealtad
               WHERE empresa_id=$1 AND activo=true AND monto_minimo<=$2
               ORDER BY monto_minimo DESC LIMIT 1`,
              [empresa_id, totalMes]
            );
            const nivelId = niveles[0]?.id ?? null;

            // Config de descuento para el amigo
            let { rows: [configAmigo] } = await pool.query(
              `SELECT * FROM referidos_config_amigo
               WHERE empresa_id=$1 AND activo=true
               AND nivel_id IS NOT DISTINCT FROM $2 LIMIT 1`,
              [empresa_id, nivelId]
            );
            if (!configAmigo) {
              const { rows: [fallback] } = await pool.query(
                `SELECT * FROM referidos_config_amigo
                 WHERE empresa_id=$1 AND nivel_id IS NULL AND activo=true LIMIT 1`,
                [empresa_id]
              );
              configAmigo = fallback || { descuento_pct: 5, envio_gratis: false };
            }

            await pool.query(
              `INSERT INTO referidos
                 (empresa_id, referidor_id, referido_id, codigo_usado,
                  descuento_amigo_pct, envio_gratis_amigo, ip_registro)
               VALUES ($1,$2,$3,$4,$5,$6,$7)`,
              [
                empresa_id, referidor.id, nuevoCliente.id,
                codigo_referido_invitante,
                configAmigo.descuento_pct, configAmigo.envio_gratis || false, ip,
              ]
            );
          }
        }
      } catch (refErr) {
        console.error("Error procesando referido en registro:", refErr.message);
        // No interrumpe el registro
      }
    }

    res.json({
      message:         "Cliente registrado correctamente",
      usuario:         nuevoCliente.usuario,
      codigo_referido: codigoPropio,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar cliente" });
  }
};

export const loginCliente = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
    }

    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, rol_id, contrasena
       FROM persona WHERE usuario = $1`,
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = result.rows[0];

    // Solo clientes públicos (sin empresa_id, rol 4)
    if (user.rol_id !== 4) {
      return res.status(403).json({ error: "Acceso no permitido" });
    }

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = generarToken(user);

    res.json({
      token,
      cliente_id: user.id,      // ✅ necesario para el payload del pedido
      usuario:    user.usuario,
      nombre:     user.nombre,
      rol_id:     user.rol_id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login de cliente" });
  }
};


// ✅ GET perfil del cliente logueado
export const getPerfilCliente = async (req, res) => {
  try {
    const id = req.user.id;
    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, telefono, direccion,
              tipo_documento, numero_documento
       FROM persona WHERE id = $1 AND rol_id = 4`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

// ✅ PUT actualizar perfil del cliente logueado
export const actualizarPerfilCliente = async (req, res) => {
  try {
    const id = req.user.id;
    const { nombre, apellido, telefono, direccion } = req.body;

    const result = await pool.query(
      `UPDATE persona
       SET nombre=$1, apellido=$2, telefono=$3, direccion=$4
       WHERE id=$5 AND rol_id=4
       RETURNING id, nombre, apellido, usuario, telefono, direccion`,
      [nombre, apellido, telefono, direccion, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

// ✅ PUT cambiar contraseña del cliente
export const cambiarContrasenaCliente = async (req, res) => {
  try {
    const id = req.user.id;
    const { contrasena_actual, contrasena_nueva } = req.body;

    const result = await pool.query(
      "SELECT contrasena FROM persona WHERE id = $1",
      [id]
    );

    const match = await bcrypt.compare(contrasena_actual, result.rows[0].contrasena);
    if (!match) {
      return res.status(400).json({ error: "Contraseña actual incorrecta" });
    }

    const hashedNueva = await bcrypt.hash(contrasena_nueva, 10);
    await pool.query(
      "UPDATE persona SET contrasena=$1 WHERE id=$2",
      [hashedNueva, id]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
};

// ── POST /api/clientes/recuperar-contrasena ───────────────────────────────────
export const solicitarRecuperacion = async (req, res) => {
  try {
    const { usuario } = req.body; // usuario = email del cliente
    if (!usuario) return res.status(400).json({ error: "El correo es obligatorio" });

    const result = await pool.query(
      "SELECT id, nombre FROM persona WHERE usuario = $1 AND rol_id = 4",
      [usuario.trim().toLowerCase()]
    );

    // Siempre responder "ok" aunque no exista (seguridad — no revelar si existe la cuenta)
    if (result.rows.length === 0) {
      return res.json({ ok: true });
    }

    const persona = result.rows[0];
    const token   = crypto.randomBytes(32).toString("hex");
    const expiry  = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      "UPDATE persona SET reset_token=$1, reset_token_expiry=$2 WHERE id=$3",
      [token, expiry, persona.id]
    );

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    await enviarEmailRecuperacion(usuario, persona.nombre, token, baseUrl);

    res.json({ ok: true });
  } catch (error) {
    console.error("Error solicitarRecuperacion:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

// ── POST /api/clientes/resetear-contrasena ────────────────────────────────────
export const resetearContrasena = async (req, res) => {
  try {
    const { token, contrasena_nueva } = req.body;

    if (!token || !contrasena_nueva) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    if (contrasena_nueva.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const result = await pool.query(
      "SELECT id FROM persona WHERE reset_token=$1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "El enlace no es válido o ya expiró" });
    }

    const hashed = await bcrypt.hash(contrasena_nueva, 10);
    await pool.query(
      "UPDATE persona SET contrasena=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2",
      [hashed, result.rows[0].id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error resetearContrasena:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};