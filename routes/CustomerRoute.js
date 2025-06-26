import { getAllCustomers,getCustomerById,createCustomer,updateCustomer,deleteCustomer } from "../controllers/CustomerControllers.js";
import { Router } from "express";

const route = Router();

route.get('/',getAllCustomers);
route.get('/:id',getCustomerById);
route.post('/',createCustomer);
route.put('/:id',updateCustomer);
route.delete('/:id',deleteCustomer);
export default route;