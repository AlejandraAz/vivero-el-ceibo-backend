import  Customer  from "../models/Customer.js";


const getAllCustomers = async (req,res)=>{
    try {
        const customers = await Customer.findAll();

        if(customers.length === 0){
            return res.status(404).json({
                status:404,
                message:'No customers found in the database.'})
        }
        return res.status(200).json({
            status:200,
            message:'Customers retrieved successfully.',
            customers
        })
    } catch (error) {
        return res.status(500).json({
            status:500,
            message:'Internal server error.',
            error:error.message
        })
    }
};

const getCustomerById = async(req,res)=>{
    const {id} = req.params;
    try {
        const customer = await Customer.findByPk(id);
        if(!customer){
            return res.status(404).json({
                status:404,
                message:`Customer with ID ${id} not found.`})
        }
        return res.status(200).json({
            status:200,
            message:`Customer ${customer.name}  retrieved successfully.`,
            customer
        })
    } catch (error) {
            return res.status(500).json({
            status:500,
            message:'Internal server error.',
            error:error.message
        })
    }
};

const createCustomer = async(req,res)=>{
    const {name,email,password} = req.body;
    try {
        if(!name || !email || !password){
            return res.status(400).json({
                status:400,
                message:'Name, email, and password are required.'
            })
        }
        if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) {
            return res.status(400).json({
                status: 400,
                message: 'Name must be between 3 and 100 characters.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid email format.'
            });
        }

        const existingCustomer = await Customer.findOne({ where: { email } });

        if (existingCustomer) {
        return res.status(409).json({
        status: 409,
        message: 'Email already exists.'
        });
    }

        if (password.length < 8 || password.length > 15) {
            return res.status(400).json({
                status: 400,
                message: 'Password must be between 8 and 15 characters.'
            });
        }

        const customer = await Customer.create({name,email,password});
        return res.status(201).json({
            status:201,
            message:'Customer created',
            customer
        })
    } catch (error) {
        return res.status(500).json({
            status:500,
            message:'error internal server',
            error:error.message
        })
    }
};

const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: 'Customer not found.'
            });
        }

        if (email && email !== customer.email) {
            const existing = await Customer.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    status: 409,
                    message: 'Email is already in use by another customer.'
                });
            }
        }

        if (name && (name.length < 3 || name.length > 100)) {
            return res.status(400).json({
                status: 400,
                message: 'Name must be between 3 and 100 characters.'
            });
        }

        if (password && (password.length < 8 || password.length > 15)) {
            return res.status(400).json({
                status: 400,
                message: 'Password must be between 8 and 15 characters.'
            });
        }

        
        await customer.update({ name, email, password });

        return res.status(200).json({
            status: 200,
            message: 'Customer updated successfully.',
            customer
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: 'Customer not found.'
            });
        }

        await customer.destroy();

        return res.status(200).json({
            status: 200,
            message: 'Customer deleted successfully.'
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};



export {getAllCustomers,getCustomerById,createCustomer,updateCustomer,deleteCustomer}