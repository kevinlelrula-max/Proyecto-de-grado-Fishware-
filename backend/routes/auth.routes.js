import express from "express";
import { login, misEmpresas, seleccionarEmpresa } from "../controllers/auth.controller.js";
import { registrarEmpresa } from "../controllers/empresa.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login",               login);
router.post("/registro",            registrarEmpresa);
router.get("/mis-empresas",         verificarToken, misEmpresas);
router.post("/seleccionar-empresa", verificarToken, seleccionarEmpresa);

export default router;