import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { getInsight } from "../controllers/insight.controller.js";

const router = Router();

router.get("/", verificarToken, getInsight);

export default router;
