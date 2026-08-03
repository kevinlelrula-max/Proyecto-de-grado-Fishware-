import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { getInsight, generarDescripcion, analizarReseñas } from "../controllers/insight.controller.js";

const router = Router();

router.get("/", verificarToken, getInsight);
router.post("/generar-descripcion", verificarToken, generarDescripcion);
router.get("/resenas", verificarToken, analizarReseñas);

export default router;
