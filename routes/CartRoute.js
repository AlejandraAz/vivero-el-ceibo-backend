import { Router } from "express";
import { getAllCarts,getCartById,createCart,updateCart,desactivateCart } from "../controllers/CartControllers.js";
const router = Router();

router.get('/',getAllCarts);
router.get('/:id',getCartById);
router.post('/',createCart);
router.put('/:id',updateCart);
router.delete('/:id',desactivateCart);

export default router;