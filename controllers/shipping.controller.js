import Shipping from "../models/Shipping.js";

const getAllShippings = async (req, res) => {
    try {
        const shippings = await Shipping.findAll({ where: { active: true } });
        if (!shippings.length === 0) {
            return res.status(404).json({ status: 404, message: "No shipping records found." });
        }
        return res.status(200).json({ status: 200, message: "Shipping records retrieved.", shippings });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const getAllShippingsAdmin = async (req, res) => {
    try {
        const shippings = await Shipping.findAll();
        if (!shippings.length)
            return res.status(404).json({ status: 404, message: "No shipping records found." });

        return res.status(200).json({ status: 200, shippings });
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
    const { street, number, city, province, postalCode, shippingStatus, phone } = req.body;
    try {
        if (!street || !number || !city || !province || !postalCode || !phone) {
            return res.status(400).json({ status: 400, message: "All fields are required." });
        }

        // calcular fecha estimada (por ejemplo, 2 días después)
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + 2);

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

        return res.status(201).json({ status: 201, message: "Shipping created successfully.", shipping });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};


const deleteShipping = async (req, res) => {
    const { id } = req.params;
    try {
        const shipping = await Shipping.findByPk(id);
        if (!shipping) {
            return res.status(404).json({ status: 404, message: "Shipping not found." });
        }
        await shipping.update({ active: false })
        return res.status(200).json({ status: 200, message: "Shipping marked as inactive." });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};
const getShippingByIdAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const shipping = await Shipping.findByPk(id);
        if (!shipping) {
            return res.status(404).json({ status: 404, message: "Shipping not found." });
        }
        return res.status(200).json({ status: 200, message: "Shipping retrieved successfully.", shipping });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

export { getAllShippingsAdmin, getShippingByIdAdmin, getShippingById, createShipping, deleteShipping };