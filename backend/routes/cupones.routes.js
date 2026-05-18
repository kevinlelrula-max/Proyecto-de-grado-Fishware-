import { Router } from "express";
import {
  getCupones,
  crearCupon,
  actualizarCupon,
  toggleCupon,
  eliminarCupon,
  getUsosCupon,
  validarCupon,
} from "../controllers/cupones.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// 🎫 PÚBLICO — validar un código de cupón en el carrito
router.post("/validar", validarCupon);

// 🔒 EMPRESA — gestión de cupones (requieren autenticación)
router.get("/",           verificarToken, getCupones);
router.post("/",          verificarToken, crearCupon);
router.put("/:id",        verificarToken, actualizarCupon);
router.patch("/:id/toggle", verificarToken, toggleCupon);
router.delete("/:id",     verificarToken, eliminarCupon);
router.get("/:id/usos",   verificarToken, getUsosCupon);

export default router;
