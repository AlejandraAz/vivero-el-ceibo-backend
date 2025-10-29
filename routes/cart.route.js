import { Router } from "express";
import { protect,restrictTo } from "../middleware/auth.js";
import { getCartById, createCart,getActiveCartByCustomer ,getMyCartItems} from "../controllers/cart.controller.js";
const router = Router();

// ✅ Crear carrito (solo cliente)
router.post("/", protect,restrictTo('cliente'), createCart);
// ✅ Obtener items de mi carrito (cliente)
router.get("/my-items", protect, restrictTo("cliente"), getMyCartItems);

//  Obtener carrito por ID (admin o propietario)
router.get("/:id", protect, getCartById);

// ✅ Obtener carrito activo de un cliente (admin o usuario)
router.get("/active/:customerId", protect, getActiveCartByCustomer);



export default router;