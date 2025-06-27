import { Router } from "express";
import { getAllShippings,getShippingById,createShipping,updateShipping,deleteShipping } from "../controllers/ShippingControllers.js";

const router = Router();

router.get('/',getAllShippings);
router.get('/:id',getShippingById);
router.post('/',createShipping);
router.put('/:id',updateShipping);
router.delete('/:id',deleteShipping);

export default router;