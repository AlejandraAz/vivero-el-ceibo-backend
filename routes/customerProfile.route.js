import upload from "../middleware/upload.js";
import { validateProfileUpdate } from "../middleware/validateProfile.js";
import {protect,restrictTo} from "../middleware/auth.js";
import { Router } from "express";
import { getOrdersByCustomer } from "../controllers/order.controller.js";
import { getMyProfile,updateMyProfile,changePassword,getUserOrders } from "../controllers/customer.controller.js";
const router = Router();

router.use(protect, restrictTo('cliente'));
router.get('/', getMyProfile); // GET /api/customer/profile
router.put('/', upload.single('photo'), validateProfileUpdate, updateMyProfile); // PUT /api/customer/profile
router.put('/change-password', changePassword); // PUT /api/customer/profile/change-password
// router.get('/my-orders',getUserOrders); //para traer mis compras no se esta usando
router.get('/my-orders',getOrdersByCustomer);

export default router;