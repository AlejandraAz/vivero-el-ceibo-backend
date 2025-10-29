import { Router } from "express";
// import { getAllProducts } from "../controllers/product.controller.js";
import { getUsersByWeek } from "../controllers/customer.controller.js";
import { getAllCustomers,toggleCustomerStatus,getAllAdmins,updateAdminStatus,getAllOrdersAdmin,getOrderDetailAdminById,updateOrderStatus,createAdmin,updateShippingStatus } from "../controllers/admin.controller.js";
import { protect,restrictTo } from "../middleware/auth.js";
import { deleteShipping, getAllShippingsAdmin, getShippingByIdAdmin } from "../controllers/shipping.controller.js";
import { getAllCarts,getCartById,updateCart,desactivateCart,getActiveCartByCustomer } from "../controllers/cart.controller.js";
import { getAllReviews,getPendingReviews,updateReviewStatus,deleteReview } from "../controllers/review.controller.js";

const router = Router();

// router.get('/',protect,restrictTo('admin'),getAllProducts);
 // gestionar admins
router.get('/admins',protect,restrictTo('admin'),getAllAdmins); //en caso de tener mas de uno
router.post("/", protect,restrictTo('admin'),createAdmin);
router.patch("/:id/status", protect,restrictTo('admin'),updateAdminStatus);

// Gestión de usuarios (clientes)
router.get("/customers",protect,restrictTo('admin'),getAllCustomers);
router.patch("/customers/:id/status",protect,restrictTo('admin'), toggleCustomerStatus); // cambiar estado
// router.patch("/customers/:id/role",protect,restrictTo('admin'),updateCustomerRole); capaz que lo elimine porque no tiene esa funcioanlidad

// gestióon de imagenes de producto
router.delete('/product-image/:id',protect,restrictTo('admin'),);
router.delete('/product-image/all/:productId',protect,restrictTo('admin'),);

// para el carrito


// Obtener todos los carritos (solo admin)
router.get("/cart", protect,restrictTo('admin'), getAllCarts);

//  Obtener carrito activo de un cliente (admin o usuario)
router.get("/cart/active/:customerId", protect,restrictTo('admin'), getActiveCartByCustomer);
//  Obtener carrito por ID (admin o propietario)
router.get("/cart/:id", protect, restrictTo("admin"), getCartById);
// Actualizar carrito (estado)
router.put("/cart/:id", protect,restrictTo('admin'), updateCart);

// Desactivar carrito y sus items
router.put("/cart/desactivate/:cartId", protect,restrictTo('admin'), desactivateCart);

// Gestión de pedidos
router.get("/orders",protect,restrictTo('admin'), getAllOrdersAdmin); // listar pedidos con detalle
router.get("/orders/:id",protect,restrictTo('admin'), getOrderDetailAdminById); // ver detalle específico
router.put("/orders/:id/status",protect,restrictTo('admin'), updateOrderStatus); // cambiar estado del pedido

// Para gestionar reseñas:
// Listar todas las reseñas (admin)
router.get("/reviews", protect, restrictTo("admin"), getAllReviews);


// Listar solo reseñas pendientes (admin)
router.get("/reviews/pending", protect, restrictTo("admin"), getPendingReviews);

// Aprobar/rechazar reseña y opcionalmente agregar respuesta del admin
router.patch("/reviews/:id/status", protect, restrictTo("admin"), updateReviewStatus);

// Eliminar reseña propia (cliente) o cualquier reseña si es admin
router.delete("reviews/:id", protect,restrictTo('admin'), deleteReview);

// Para los envios
router.get('/shipping',protect, restrictTo("admin"),getAllShippingsAdmin)
router.get("/shipping/:id", protect, restrictTo("admin"), getShippingByIdAdmin);
// router.get("/shipping/:id", protect, restrictTo("admin"), getShippingById);
router.put("/shipping/:id/status", protect, restrictTo("admin"), updateShippingStatus);
router.delete("/shipping/:id/active", protect, restrictTo("admin"), deleteShipping);
// ***para el grafico de usuarios:
router.get('/customers/user-by-week',protect,restrictTo('admin'),getUsersByWeek);


export default router;