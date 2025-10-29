import { Router } from "express";
import { getShippingById,createShipping } from "../controllers/shipping.controller.js";
import {protect,restrictTo} from "../middleware/auth.js";
const router = Router();

// ruta para cliente
router.post('/',protect, restrictTo("cliente"),createShipping);
router.get('/:id',protect, restrictTo("cliente"),getShippingById);
// Para testear si el archivo se carga
// console.log("Shipping routes loaded");

export default router;