import { Router } from "express";
import {getClientes,crearCliente,actualizarCliente,eliminarCliente} from "../controllers/clientes.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔹 Todas protegidas
router.get("/", verificarToken, getClientes);
router.post("/", verificarToken, crearCliente);
router.put("/:id", verificarToken, actualizarCliente);
router.delete("/:id", verificarToken, eliminarCliente);

export default router;