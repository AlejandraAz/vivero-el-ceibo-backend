import { getAllCategories,getCategoryById,updateCategory,createCategory,deleteCategory } from "../controllers/CategoryControllers.js";
import { Router } from "express";

const route = Router();

route.get('/',getAllCategories);
route.get('/:id',getCategoryById);
route.post('/',createCategory);
route.put('/:id',updateCategory);
route.delete('/:id',deleteCategory);
export default route;