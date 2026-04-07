import { Router } from "express";
import { crearVenta, listarVentas } from "../controllers/ventas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verificarToken, crearVenta);
router.get("/", verificarToken, listarVentas); 

export default router;