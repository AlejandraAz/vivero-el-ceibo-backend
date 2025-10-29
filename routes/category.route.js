import { getAllCategories,getCategoryById,updateCategory,createCategory,toggleCategoryStatus } from "../controllers/category.controller.js";
import { Router } from "express";
import authorize from "../middleware/authorizeRol.js";
import { protect } from "../middleware/auth.js";
import validateCategory from "../middleware/validateCategory.js";

const router = Router();

router.get('/',protect,authorize("admin" ),getAllCategories);
router.get('/:id',protect,authorize("admin" ),getCategoryById);
router.post('/',protect,authorize("admin" ),validateCategory,createCategory);
router.put('/:id',protect,authorize("admin" ),validateCategory,updateCategory);
router.patch('/:id/toggle',protect,authorize('admin'),toggleCategoryStatus)

export default router;