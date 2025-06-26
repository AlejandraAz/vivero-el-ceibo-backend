import Product from "../models/Product.js";

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();

        if (products.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No products found."
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Products retrieved successfully.",
            products
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: `Product with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Product retrieved successfully.",
            product
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const createProduct = async (req, res) => {
    const { name, description, price, stock, image, featured, id_admin, id_category } = req.body;

    try {
        if (!name || name.trim().length < 3 || name.trim().length > 100) {
            return res.status(400).json({
                status: 400,
                message: "Product name must be between 3 and 100 characters."
            });
        }

        if (!description || description.trim().length > 1000) {
            return res.status(400).json({
                status: 400,
                message: "Description must be at most 1000 characters."
            });
        }

        if (!price || isNaN(price) || parseFloat(price) < 0) {
            return res.status(400).json({
                status: 400,
                message: "Price must be a valid number greater than or equal to 0."
            });
        }

        if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
            return res.status(400).json({
                status: 400,
                message: "Stock must be a non-negative integer."
            });
        }

        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (!image || !urlRegex.test(image)) {
            return res.status(400).json({
                status: 400,
                message: "Image must be a valid URL."
            });
        }

        if (!id_admin || !id_category) {
            return res.status(400).json({
                status: 400,
                message: "Admin ID and Category ID are required."
            });
        }

        const existing = await Product.findOne({ where: { name } });
        if (existing) {
            return res.status(409).json({
                status: 409,
                message: "A product with that name already exists."
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            image,
            featured: !!featured,
            id_admin,
            id_category
        });

        return res.status(201).json({
            status: 201,
            message: "Product created successfully.",
            product
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, image, featured, id_category } = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Product not found."
            });
        }

        if (name && (name.length < 3 || name.length > 100)) {
            return res.status(400).json({
                status: 400,
                message: "Product name must be between 3 and 100 characters."
            });
        }

        if (description && description.length > 1000) {
            return res.status(400).json({
                status: 400,
                message: "Description must be at most 1000 characters."
            });
        }

        if (price !== undefined && (isNaN(price) || price < 0)) {
            return res.status(400).json({
                status: 400,
                message: "Price must be a valid number."
            });
        }

        if (stock !== undefined && (isNaN(stock) || stock < 0)) {
            return res.status(400).json({
                status: 400,
                message: "Stock must be a non-negative integer."
            });
        }

        if (image) {
            const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
            if (!urlRegex.test(image)) {
                return res.status(400).json({
                    status: 400,
                    message: "Image must be a valid URL."
                });
            }
        }

        await product.update({
            name,
            description,
            price,
            stock,
            image,
            featured,
            id_category
        });

        return res.status(200).json({
            status: 200,
            message: "Product updated successfully.",
            product
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Product not found."
            });
        }

        await product.destroy();

        return res.status(200).json({
            status: 200,
            message: "Product deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};

export { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };