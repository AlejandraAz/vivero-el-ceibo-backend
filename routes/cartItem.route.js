import { Router } from "express";
import {  addCartItem, updateCartItem,clearCart, deleteCartItem } from "../controllers/cart.item.controller.js";
import {protect,restrictTo} from "../middleware/auth.js";
const router = Router();



//  Agregar item al carrito
router.post("/", protect,restrictTo('cliente'), addCartItem);

// Actualizar cantidad de un item
router.put("/:id", protect,restrictTo('cliente'), updateCartItem);

// Eliminar (inactivar) un item
router.delete("/:id", protect,restrictTo('cliente'), deleteCartItem);

// Vaciar carrito completo
router.delete("/clear/:id_cart", protect, restrictTo('cliente'),clearCart);


export default router;