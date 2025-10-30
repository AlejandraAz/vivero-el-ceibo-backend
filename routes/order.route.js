import { Router } from "express";
import { getOrderById,createOrder,getOrdersByCustomer } from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();
// gestion ordenes por parte de cliente
router.post('/',protect, restrictTo("cliente"),createOrder);
router.get('/',protect,restrictTo('cliente'),getOrdersByCustomer);  //p/ que el cliente vea sus compras
router.get('/:id',protect, restrictTo("cliente"),getOrderById);


export default router;