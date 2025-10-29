import { getFeaturedProducts,getProductById,getAllProducts,searchProducts ,getCatalogProducts} from "../controllers/product.controller.js";
import { Router } from "express";

const router = Router();
// router.get('/',getAllProducts);
router.get('/featured',getFeaturedProducts);
router.get('/search',searchProducts);
router.get('/catalog',getCatalogProducts);
router.get('/:id',getProductById);
router.get('/',getAllProducts);

export default router;