import { getAllCategories,getCategoryById,updateCategory,createCategory,deleteCategory } from "../controllers/CategoryControllers.js";
import { Router } from "express";

const router = Router();

router.get('/',getAllCategories);
router.get('/:id',getCategoryById);
router.post('/',createCategory);
router.put('/:id',updateCategory);
router.delete('/:id',deleteCategory);
export default router;