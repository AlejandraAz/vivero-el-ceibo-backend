import { Router } from "express";
import { createCartItem,updateCartItem,getCartItemsByCartId,deleteCartItem } from "../controllers/CartItemControllers.js";

const router = Router();


router.get('/cart/:id',getCartItemsByCartId);
router.post('/',createCartItem);
router.put('/:id',updateCartItem);
router.delete('/:id',deleteCartItem);

export default router;