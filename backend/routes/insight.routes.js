import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { getInsight, generarDescripcion } from "../controllers/insight.controller.js";

const router = Router();

router.get("/", verificarToken, getInsight);
router.post("/generar-descripcion", verificarToken, generarDescripcion);

export default router;
