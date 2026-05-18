import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// =========================
// CONFIGURACIÓN DE MULTER (logo)
// =========================
const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/logos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo_empresa_${req.user.empresa_id}${ext}`);
  },
});

// =========================
// CONFIGURACIÓN DE MULTER (banner)
// =========================
const storageBanner = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/banners";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `banner_empresa_${req.user.empresa_id}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

export const uploadLogo = multer({
  storage: storageLogo,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const uploadBanner = multer({
  storage: storageBanner,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =========================
// GET CONFIGURACIÓN COMPLETA
// =========================
export const getConfiguracion = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const empresaResult = await pool.query(
      `SELECT id, nombre, nit, email, telefono, direccion, logo_url, slug,
              descripcion, color_primario, banner_url,
              instagram, whatsapp, facebook, horario,
              hero_titulo, hero_subtitulo, hero_btn_texto,
              nosotros_titulo, nosotros_contenido
       FROM empresas WHERE id = $1`,
      [empresa_id]
    );

    if (empresaResult.rows.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const empresa = empresaResult.rows[0];

    const metodosResult = await pool.query(
      `SELECT
         mp.id,
         mp.metodo AS key,
         COALESCE(emp.activo, true) AS activo
       FROM metodo_pago mp
       LEFT JOIN empresa_metodo_pago emp
         ON emp.metodo_id = mp.id AND emp.empresa_id = $1
       ORDER BY mp.id`,
      [empresa_id]
    );

    res.json({
      nombre:             empresa.nombre             || "",
      nit:                empresa.nit                || "",
      email:              empresa.email              || "",
      telefono:           empresa.telefono           || "",
      direccion:          empresa.direccion          || "",
      logoUrl:            empresa.logo_url           || null,
      slug:               empresa.slug               || "",
      descripcion:        empresa.descripcion        || "",
      color_primario:     empresa.color_primario     || "#0F6E56",
      banner_url:         empresa.banner_url         || null,
      instagram:          empresa.instagram          || "",
      whatsapp:           empresa.whatsapp           || "",
      facebook:           empresa.facebook           || "",
      horario:            empresa.horario            || "",
      // ✅ Campos del hero y nosotros
      hero_titulo:        empresa.hero_titulo        || "",
      hero_subtitulo:     empresa.hero_subtitulo     || "",
      hero_btn_texto:     empresa.hero_btn_texto     || "",
      nosotros_titulo:    empresa.nosotros_titulo    || "",
      nosotros_contenido: empresa.nosotros_contenido || "",
      metodosPago:        metodosResult.rows,
    });
  } catch (error) {
    console.error("Error en getConfiguracion:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
};

// =========================
// PUT DATOS DE EMPRESA
// =========================
export const updateDatosEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const {
      nombre, nit, email, telefono, direccion,
      descripcion, color_primario,
      instagram, whatsapp, facebook, horario,
      hero_titulo, hero_subtitulo, hero_btn_texto,
      nosotros_titulo, nosotros_contenido,
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre de la empresa es obligatorio" });
    }

    const result = await pool.query(
      `UPDATE empresas
       SET nombre=$1, nit=$2, email=$3, telefono=$4, direccion=$5,
           descripcion=$6, color_primario=$7,
           instagram=$8, whatsapp=$9, facebook=$10, horario=$11,
           hero_titulo=$12, hero_subtitulo=$13, hero_btn_texto=$14,
           nosotros_titulo=$15, nosotros_contenido=$16
       WHERE id=$17
       RETURNING id, nombre, nit, email, telefono, direccion, logo_url,
                 slug, descripcion, color_primario, banner_url,
                 instagram, whatsapp, facebook, horario,
                 hero_titulo, hero_subtitulo, hero_btn_texto,
                 nosotros_titulo, nosotros_contenido`,
      [
        nombre, nit, email, telefono, direccion,
        descripcion       || null,
        color_primario    || "#0F6E56",
        instagram         || null,
        whatsapp          || null,
        facebook          || null,
        horario           || null,
        hero_titulo       || null,
        hero_subtitulo    || null,
        hero_btn_texto    || null,
        nosotros_titulo   || null,
        nosotros_contenido || null,
        empresa_id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error en updateDatosEmpresa:", error);
    res.status(500).json({ error: "Error al actualizar datos de empresa" });
  }
};

// =========================
// PUT MÉTODOS DE PAGO
// =========================
export const updateMetodosPago = async (req, res) => {
  const client = await pool.connect();
  try {
    const empresa_id = req.user.empresa_id;
    const { metodos } = req.body;

    if (!Array.isArray(metodos) || metodos.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de métodos" });
    }

    await client.query("BEGIN");

    for (const { key, activo } of metodos) {
      const mp = await client.query(
        "SELECT id FROM metodo_pago WHERE metodo = $1", [key]
      );
      if (mp.rows.length === 0) continue;

      await client.query(
        `INSERT INTO empresa_metodo_pago (empresa_id, metodo_id, activo)
         VALUES ($1, $2, $3)
         ON CONFLICT (empresa_id, metodo_id)
         DO UPDATE SET activo = EXCLUDED.activo`,
        [empresa_id, mp.rows[0].id, activo]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Métodos de pago actualizados correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en updateMetodosPago:", error);
    res.status(500).json({ error: "Error al actualizar métodos de pago" });
  } finally {
    client.release();
  }
};

// =========================
// POST LOGO
// =========================
export const subirLogo = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const logo_url = `/uploads/logos/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE empresas SET logo_url=$1 WHERE id=$2 RETURNING logo_url`,
      [logo_url, empresa_id]
    );

    res.json({ logoUrl: result.rows[0].logo_url });
  } catch (error) {
    console.error("Error en subirLogo:", error);
    res.status(500).json({ error: "Error al subir el logo" });
  }
};

// =========================
// POST BANNER
// =========================
export const subirBanner = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const banner_url = `/uploads/banners/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE empresas SET banner_url=$1 WHERE id=$2 RETURNING banner_url`,
      [banner_url, empresa_id]
    );

    res.json({ bannerUrl: result.rows[0].banner_url });
  } catch (error) {
    console.error("Error en subirBanner:", error);
    res.status(500).json({ error: "Error al subir el banner" });
  }
};
// =========================
// GET LAYOUT
// =========================
export const getLayout = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      "SELECT layout_json FROM empresas WHERE id = $1",
      [empresa_id]
    );

    if (result.rows.length === 0) {
      return res.json([]); // nunca null
    }

    const raw = result.rows[0].layout_json;

    // 🔥 solución real
    if (!raw) {
      return res.json([]);
    }

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

      // 🔥 asegurar array
      if (!Array.isArray(parsed)) {
        return res.json([]);
      }

      res.json(parsed);
    } catch (e) {
      console.error("JSON inválido en layout:", raw);
      return res.json([]); // fallback seguro
    }

  } catch (error) {
    console.error("Error en getLayout:", error);
    res.status(500).json({ error: "Error al obtener layout" });
  }
};

// =========================
// PUT LAYOUT
// =========================
export const updateLayout = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { layout } = req.body;
    if (!Array.isArray(layout)) {
      return res.status(400).json({ error: "Layout inválido" });
    }
    await pool.query(
      "UPDATE empresas SET layout_json = $1 WHERE id = $2",
      [JSON.stringify(layout), empresa_id]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en updateLayout:", error);
    res.status(500).json({ error: "Error al guardar layout" });
  }
};
