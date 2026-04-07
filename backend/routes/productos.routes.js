import express from "express";
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productos.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verificarToken, getProductos);
router.post("/", verificarToken, crearProducto);
router.put("/:id", verificarToken, actualizarProducto);
router.delete("/:id", verificarToken, eliminarProducto);

export default router;