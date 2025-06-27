import { getAllCustomers,getCustomerById,createCustomer,updateCustomer,deleteCustomer } from "../controllers/CustomerControllers.js";
import { Router } from "express";

const router = Router();

router.get('/',getAllCustomers);
router.get('/:id',getCustomerById);
router.post('/',createCustomer);
router.put('/:id',updateCustomer);
router.delete('/:id',deleteCustomer);
export default router;