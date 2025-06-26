import { Router } from "express";
import {getAllProducts,getProductById,createProduct,updateProduct,deleteProduct} from "../controllers/ProductController.js";
const route = Router();

route.get('/',getAllProducts);
route.get('/:id',getProductById);
route.post('/',createProduct);
route.put('/:id',updateProduct);
route.delete('/:id',deleteProduct);
export default route;