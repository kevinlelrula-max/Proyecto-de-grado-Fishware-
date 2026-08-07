import { Router } from "express";
import {
  abrirCaja,
  cerrarCaja,
  getSesionActiva,
  getHistorialCaja,
} from "../controllers/caja.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/activa",   verificarToken, getSesionActiva);
router.get("/historial",verificarToken, getHistorialCaja);
router.post("/abrir",   verificarToken, abrirCaja);
router.post("/cerrar",  verificarToken, cerrarCaja);

export default router;
