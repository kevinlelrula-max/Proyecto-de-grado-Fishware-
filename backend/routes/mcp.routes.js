import { Router } from "express";
import { generarTokenMcp } from "../controllers/mcp.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/generar-token", verificarToken, generarTokenMcp);

export default router;
