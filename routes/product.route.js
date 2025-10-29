import { Router } from "express";
import authorize from "../middleware/authorizeRol.js";
import { protect,restrictTo } from "../middleware/auth.js";
import validateProduct from "../middleware/validateProduct.js";
import upload from "../middleware/upload.js";
import {getAllProducts,getProductById,createProduct,updateProduct,toggleFeatured,restoreProduct,deleteProduct,getStockByCategory,getProductsCountByCategory} from "../controllers/product.controller.js";
const router = Router();

// p/los graficos
router.get('/stock-by-category', protect, getStockByCategory);
router.get('/count-by-category', protect, getProductsCountByCategory);


router.get('/',getAllProducts);
router.get('/:id',getProductById);
router.post('/',protect,authorize("admin"),upload.array("images",5),validateProduct,createProduct);
router.put('/:id',protect,authorize("admin"),upload.array("images",5),updateProduct);
router.patch('/:id/featured',protect,authorize('admin'),toggleFeatured);
router.put('/:id/restore',protect,authorize("admin"),restoreProduct);
router.delete('/:id',protect,authorize("admin", "productos"),deleteProduct);

export default router;