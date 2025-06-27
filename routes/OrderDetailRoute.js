import { Router } from "express";
import { getAllOrderDetails,getOrderDetailById,createOrderDetail,updateOrderDetail,deleteOrderDetail } from "../controllers/OrderDetailControllers.js";

const router = Router();

router.get('/',getAllOrderDetails);
router.get('/:id',getOrderDetailById);
router.post('/',createOrderDetail);
router.put('/:id',updateOrderDetail);
router.delete('/:id',deleteOrderDetail);

export default router;