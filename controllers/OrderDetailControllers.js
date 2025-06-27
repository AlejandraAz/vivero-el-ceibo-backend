import OrderDetail from "../models/OrderDetail.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getAllOrderDetails = async (req, res) => {
    try {
        const details = await OrderDetail.findAll();
        if (details.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No order details found.'
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Order details retrieved successfully.',
            details
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getOrderDetailById = async (req, res) => {
    const { id } = req.params;
    try {
        const detail = await OrderDetail.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                status: 404,
                message: 'Order detail not found.'
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Order detail retrieved successfully.',
            detail
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const createOrderDetail = async (req, res) => {
    const { id_product, id_order, quantity, unit_price, subtotal } = req.body;
    try {
        if (!id_product || !id_order || !quantity || !unit_price || !subtotal) {
            return res.status(400).json({
                status: 400,
                message: 'All fields are required.'
            });
        }

        const product = await Product.findByPk(id_product);
        const order = await Order.findByPk(id_order);
        if (!product || !order) {
            return res.status(404).json({
                status: 404,
                message: 'Associated product or order not found.'
            });
        }

        const detail = await OrderDetail.create({
            id_product,
            id_order,
            quantity,
            unit_price,
            subtotal
        });
        return res.status(201).json({
            status: 201,
            message: 'Order detail created successfully.',
            detail
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};
const updateOrderDetail = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const detail = await OrderDetail.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                status: 404,
                message: 'Order detail not found.'
            });
        }
        await detail.update(data);
        return res.status(200).json({
            status: 200,
            message: 'Order detail updated successfully.',
            detail
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};
const deleteOrderDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const detail = await OrderDetail.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                status: 404,
                message: 'Order detail not found.'
            });
        }
        await detail.destroy();
        return res.status(200).json({
            status: 200,
            message: 'Order detail deleted successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

export {getAllOrderDetails,getOrderDetailById,createOrderDetail,updateOrderDetail,deleteOrderDetail};
