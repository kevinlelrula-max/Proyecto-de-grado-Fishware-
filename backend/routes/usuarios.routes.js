import { Router } from "express";
import { getUsuarios, crearUsuario } from "../controllers/usuarios.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getUsuarios);
router.post("/", verificarToken, crearUsuario);

export default router;