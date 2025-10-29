import { Router } from "express";
import { getAllCategoriesPublic } from "../controllers/category.controller.js";

const router = Router();

// Ruta pública para obtener todas las categorías activas siendo usuario o no
router.get("/", getAllCategoriesPublic);

export default router;
