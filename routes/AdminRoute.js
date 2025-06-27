import { Router } from "express";
import { getAllAdmins,getAllOrdersAdmin,getOrderDetailAdminById,updateCustomerStatus,updateOrderStatus,createAdmin } from "../controllers/AdminControllers.js";

const router = Router();

 // gestionar admins
router.get('/',getAllAdmins); //en caso de tener mas de uno
router.post("/", createAdmin);

// Gestión de usuarios (clientes)
router.put("/customers/:id/status", updateCustomerStatus); // cambiar estado

// Gestión de pedidos
router.get("/orders", getAllOrdersAdmin); // listar pedidos con detalle
router.get("/orders/:id", getOrderDetailAdminById); // ver detalle específico
router.put("/orders/:id/status", updateOrderStatus); // cambiar estado del pedido

export default router;