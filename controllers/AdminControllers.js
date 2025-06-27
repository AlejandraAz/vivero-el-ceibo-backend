import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderDetail from "../models/OrderDetail.js";
import Customer from "../models/Customer.js";
import Shipping from "../models/Shipping.js";


// GET all admins (en caso de ser necesario por ahora hay uno)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        if (admins.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No admins found.'
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Admins retrieved successfully.',
            admins
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

// Para crear un nuevo admin  de manera manual ademas del que tengo en el seed
const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Name, email, and password are required.'
            });
        }

        const existingAdmin = await Admin.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(409).json({
                status: 409,
                message: 'Email already registered.'
            });
        }

        const admin = await Admin.create({ name, email, password });
        return res.status(201).json({
            status: 201,
            message: 'Admin created successfully.',
            admin
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Server error.',
            error: error.message
        });
    }
};

// controllador para actualizar el estado de cliente en caso de ser necesario
const updateCustomerStatus = async (req, res) => {
    const { id } = req.params;
    const { accountStatus } = req.body;
    try {
        if (!['activo', 'bloqueado'].includes(accountStatus)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid account status value.'
            });
        }

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: 'Customer not found.'
            });
        }

        customer.accountStatus = accountStatus;
        await customer.save();

        return res.status(200).json({
            status: 200,
            message: `Customer account status updated to ${accountStatus}.`,
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





// Controlador exclusivo para ADMIN - Obtener todos los pedidos con detalle del cliente
const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: Customer,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Shipping,
                    attributes: ['street', 'number', 'city', 'province', 'postalCode'],
                },
                {
                    model: OrderDetail,
                    include: [
                        {
                            model: Product,
                            attributes: ['name', 'price'],
                        },
                    ],
                },
            ],
        });

        if (!orders.length) {
            return res.status(404).json({ status: 404, message: 'No orders found.' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Orders retrieved successfully.',
            orders,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

// Controlador exclusivo para ADMIN - Obtener detalle de un pedido por ID
const getOrderDetailAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: Customer,
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: Shipping,
                    attributes: ['street', 'number', 'city', 'province', 'postalCode'],
                },
                {
                    model: OrderDetail,
                    include: [
                        {
                            model: Product,
                            attributes: ['name', 'price'],
                        },
                    ],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found.',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Order detail retrieved.',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

//Controlador exclusivo para ADMIN - Actualizar estado del pedido
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pendiente', 'procesando', 'completado', 'cancelado'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid status. Allowed values: pendiente, procesando, completado, cancelado.',
        });
    }

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found.',
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            status: 200,
            message: `Order status updated to '${status}'.`,
            order,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

export { getAllAdmins,createAdmin,updateCustomerStatus,getAllOrdersAdmin, getOrderDetailAdminById, updateOrderStatus };
