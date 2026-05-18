import { Router } from "express";
import {
  getIntegraciones,
  guardarIntegracion,
  toggleIntegracion,
  eliminarIntegracion,
  getIntegracionesPublicas,
} from "../controllers/integraciones.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// 🌐 PÚBLICA — pasarelas activas de una empresa (para el checkout del cliente)
router.get("/publicas/:empresa_id", getIntegracionesPublicas);

// 🔐 PRIVADAS — solo el admin/cajero de la empresa
router.get("/",                       verificarToken, getIntegraciones);
router.post("/",                      verificarToken, guardarIntegracion);
router.patch("/:proveedor/toggle",    verificarToken, toggleIntegracion);
router.delete("/:proveedor",          verificarToken, eliminarIntegracion);

export default router;