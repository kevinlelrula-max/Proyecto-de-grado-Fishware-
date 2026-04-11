import { Router } from "express";
import { getUsuarios, crearUsuario,getPerfil, actualizarPerfil} from "../controllers/usuarios.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getUsuarios);
router.post("/", verificarToken, crearUsuario);
router.get("/perfil", verificarToken, getPerfil);
router.put("/perfil", verificarToken, actualizarPerfil);

export default router;