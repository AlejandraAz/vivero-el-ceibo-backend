import { Router } from 'express';
// traer todas las rutas
import adminRoutes from '../routes/admin.route.js';
import authRoutes from '../routes/auth.route.js';
import cartRoutes from '../routes/cart.route.js';
import cartItemRoutes from '../routes/cartItem.route.js';
import categoryRoutes from '../routes/category.route.js';
import customerRoutes from '../routes/customer.route.js';
import orderRoutes from '../routes/order.route.js';
import orderDetailRoutes from '../routes/orderDetail.route.js';
import productsRoutes from '../routes/product.route.js';
import shippingRoutes from '../routes/shipping.route.js';
import ProductImageRoutes from "../routes/productImages.routes.js";
import PublicProductRoutes from '../routes/publicProducts.routes.js';
import PublicCategoryRoutes from "../routes/publicCategory.route.js";
import CustomerProfileRoutes from "../routes/customerProfile.route.js";
import chatBotRoutes from "../routes/chatbot.route.js";
import ReviewsRoutes from "../routes/review.route.js";

const router = Router();

router.use('/chatbot',chatBotRoutes);
router.use('/admin',adminRoutes);
router.use('/reviews',ReviewsRoutes);
router.use('/customers',customerRoutes);
router.use('/customer/profile',CustomerProfileRoutes);
router.use('/admin/products',productsRoutes);
router.use('/products',PublicProductRoutes);
router.use('/admin/product-image',ProductImageRoutes);
router.use('/auth',authRoutes);
router.use('/admin/categories',categoryRoutes);
router.use('/categories',PublicCategoryRoutes);
router.use('/cart',cartRoutes);
router.use('/cart-item',cartItemRoutes);
router.use('/orders',orderRoutes);
router.use('/order-details',orderDetailRoutes);
router.use('/shipping',shippingRoutes);

export default router;


