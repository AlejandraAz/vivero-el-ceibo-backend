import Cart from "../models/Cart.js";
import Customer from "../models/Customer.js";

const getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.findAll();

        if (carts.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No carts found.'
            })
        }
        return res.status(200).json({
            status: 200,
            message: 'Carts retrieved successfully.',
            carts
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        })
    }
};
const getCartById = async (req, res) => {
    const { id } = req.params;
    try {
        if (isNaN(id)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid ID format."
            });
        }
        const cart = await Cart.findByPk(id);
        if (!cart) {
            return res.status(404).json({
                status: 404,
                message: `Cart with ID ${id} not found.`
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Cart retrieved successfully.",
            cart
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        })
    }
}


const createCart = async (req, res) => {
    const { id_customer } = req.body;
    try {
        if (!id_customer) {
            return res.status(400).json({
                status: 400,
                message: "Customer ID is required.",
            });
        }

        if (isNaN(id_customer)) {
        return res.status(400).json({
        status: 400,
        message: "Customer ID must be a valid number.",
        });
    }

        const customer = await Customer.findByPk(id_customer);
        

        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: "Customer not found.",
            });
        }

        const existingCart = await Cart.findOne({
    where: {
        id_customer,
        status: true,
    },
});

if (existingCart) {
    return res.status(409).json({
        status: 409,
        message: "The customer already has an active cart.",
    });
}


        const cart = await Cart.create({
            id_customer,
            status: true,
        });

        return res.status(201).json({
            status: 201,
            message: "Cart created.",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Server error.",
            error: error.message,
        });
    }
};

const updateCart = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const cart = await Cart.findByPk(id);
        if (!cart) {
            return res.status(404).json({
                status: 404,
                message: "Cart not found.",
            });
        }

        cart.status = status ?? cart.status;
        await cart.save();

        return res.status(200).json({
            status: 200,
            message: "Cart updated.",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Server error.",
            error: error.message,
        });
    }
};

const desactivateCart = async (req, res) => {
    const { id } = req.params;

    try {
        const cart = await Cart.findByPk(id);
        if (!cart) {
            return res.status(404).json({
                status: 404,
                message: "Cart not found.",
            });
        }

        cart.status = false;
        await cart.save();

        return res.status(200).json({
            status: 200,
            message: "Cart marked as inactive.",
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Server error.",
            error: error.message,
        });
    }
};

export {getAllCarts,getCartById,createCart,updateCart,desactivateCart};