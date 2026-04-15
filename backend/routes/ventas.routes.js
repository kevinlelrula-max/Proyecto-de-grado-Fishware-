import { Router } from "express";
import { crearVenta, listarVentasEmpresa } from "../controllers/ventas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { reporteProductos } from "../controllers/ventas.controller.js";

const router = Router();

// Crear venta (cliente o POS)
router.post("/", verificarToken, crearVenta);

// 👇 NUEVO: ventas de la empresa logueada
router.get("/empresa", verificarToken, listarVentasEmpresa);

router.get("/reportes/productos", verificarToken, reporteProductos);

export default router;