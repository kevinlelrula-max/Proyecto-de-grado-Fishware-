import { Router } from "express";
import {
  getreporteEmpresa,
  getResumenInicio,
  getRentabilidad,
  getComparativa,
} from "../controllers/reporteEmpresa.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/inicio",       verificarToken, getResumenInicio);
router.get("/resumen",      verificarToken, getreporteEmpresa);
router.get("/rentabilidad", verificarToken, getRentabilidad);
router.get("/comparativa",  verificarToken, getComparativa);

export default router;
