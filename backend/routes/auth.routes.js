import express from "express";
import { login } from "../controllers/auth.controller.js";
import { registrarEmpresa } from "../controllers/empresaController.js";

const router = express.Router();

// 🔹 Login empresa/admin
router.post("/login", login);

// 🔹 Registro de empresa + admin
router.post("/register-empresa", registrarEmpresa);

export default router;