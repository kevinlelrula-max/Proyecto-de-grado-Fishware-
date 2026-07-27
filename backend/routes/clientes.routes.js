import { Router } from "express";
import {
  getClientes,
  buscarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  registrarClientePublico,
  loginCliente,
  getPerfilCliente,
  actualizarPerfilCliente,
  cambiarContrasenaCliente,
  solicitarRecuperacion,
  resetearContrasena,
  getVista360,
} from "../controllers/clientes.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// 🛒 PÚBLICO — sin token
router.post("/registro",              registrarClientePublico);
router.post("/recuperar-contrasena",  solicitarRecuperacion);
router.post("/resetear-contrasena",   resetearContrasena);

// 🔐 PRIVADAS (EMPRESA)
router.get("/buscar", verificarToken, buscarClientes);
router.get("/",       verificarToken, getClientes);
router.post("/",      verificarToken, crearCliente);
router.post("/login", loginCliente); // ← pública, sin middleware // 👈 NUEVO
router.get("/:id/vista360", verificarToken, getVista360);
router.put("/:id",          verificarToken, actualizarCliente);
router.delete("/:id",       verificarToken, eliminarCliente);
router.get("/perfil",            verificarToken, getPerfilCliente);
router.put("/perfil",            verificarToken, actualizarPerfilCliente);
router.put("/perfil/contrasena", verificarToken, cambiarContrasenaCliente);

export default router;