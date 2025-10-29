import { Router } from "express";
import { deleteAllImagesByProductId,deleteImageById } from "../controllers/productImage.controller.js";
import { protect,restrictTo } from "../middleware/auth.js";

const router = Router();
router.delete('/:id',protect,restrictTo('admin'),deleteImageById);
router.delete('/all/:productId',protect,restrictTo('admin'),deleteAllImagesByProductId);

export default router;