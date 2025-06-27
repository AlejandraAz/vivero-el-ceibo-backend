import { Router } from "express";
import { getAllOrders,getOrderById,createOrder,updateOrder,deleteOrder } from "../controllers/OrderControllers.js";

const router = Router();

router.get('/',getAllOrders);
router.get('/:id',getOrderById);
router.post('/',createOrder);
router.put('/:id',updateOrder);
router.delete('/:id',deleteOrder);

export default router;