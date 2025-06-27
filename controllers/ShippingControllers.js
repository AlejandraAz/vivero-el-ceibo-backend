import Shipping from "../models/Shipping.js";

const getAllShippings = async (req, res) => {
    try {
        const shippings = await Shipping.findAll();
        if (!shippings.length === 0) {
            return res.status(404).json({ status: 404, message: "No shipping records found." });
        }
        return res.status(200).json({ status: 200, message: "Shipping records retrieved.", shippings });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const getShippingById = async (req, res) => {
    const { id } = req.params;
    try {
        const shipping = await Shipping.findByPk(id);
        if (!shipping) {
            return res.status(404).json({ status: 404, message: "Shipping not found." });
        }
        return res.status(200).json({ status: 200, shipping });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const createShipping = async (req, res) => {
    const { street, number, city, province, postalCode, estimatedDate, shippingStatus, phone } = req.body;
    try {
        if (!street || !number || !city || !province || !postalCode || !estimatedDate || !phone) {
            return res.status(400).json({ status: 400, message: "All fields are required." });
        }

        const shipping = await Shipping.create({
            street,
            number,
            city,
            province,
            postalCode,
            estimatedDate,
            shippingStatus: shippingStatus || 'pendiente',
            phone
        });

        return  res.status(201).json({ status: 201, message: "Shipping created successfully.", shipping });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const updateShipping = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const shipping = await Shipping.findByPk(id);
        if (!shipping) {
            return res.status(404).json({ status: 404, message: "Shipping not found." });
        }

        await shipping.update(data);
        res.status(200).json({ status: 200, message: "Shipping updated successfully.", shipping });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const deleteShipping = async (req, res) => {
    const { id } = req.params;
    try {
        const shipping = await Shipping.findByPk(id);
        if (!shipping) {
            return res.status(404).json({ status: 404, message: "Shipping not found." });
        }
        await shipping.destroy();
        return res.status(200).json({ status: 200, message: "Shipping deleted successfully." });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

export {getAllShippings,getShippingById,createShipping,updateShipping,deleteShipping};