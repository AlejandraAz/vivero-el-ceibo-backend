import {createReview,getMyReviews,getProductReviews,deleteReview } from "../controllers/review.controller.js"
import { Router } from "express";
import {protect,restrictTo} from "../middleware/auth.js";
const router = Router();

// Crear reseña (solo cliente)
router.post("/", protect, restrictTo("cliente"), createReview);

router.get('/my-reviews',protect, restrictTo("cliente"),getMyReviews);
// Eliminar reseña propia (cliente) o cualquier reseña si es admin
router.delete("/:id", protect, deleteReview);

// Obtener reseñas aprobadas de un producto (visible para todos)
router.get("/product/:id", getProductReviews);

export default router;