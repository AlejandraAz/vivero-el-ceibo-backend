import { getCustomerById,createCustomer,updateCustomer,registerCustomer,deleteCustomer} from "../controllers/customer.controller.js";
import { Router } from "express";


const router = Router();

// router.get('/',getAllCustomers);
router.get('/:id',getCustomerById);
router.post('/',createCustomer);
router.put('/:id',updateCustomer);
router.delete('/:id',deleteCustomer);




export default router;