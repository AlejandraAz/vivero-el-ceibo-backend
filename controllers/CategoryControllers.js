import  Category  from "../models/Category.js";

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();

        if (categories.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No categories found."
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Categories retrieved successfully.",
            categories
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: `Category with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Category retrieved successfully.",
            category
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        if (!name || name.trim().length < 3 || name.trim().length > 100) {
            return res.status(400).json({
                status: 400,
                message: "Category name must be between 3 and 100 characters."
            });
        }

        const existing = await Category.findOne({ where: { name } });

        if (existing) {
            return res.status(409).json({
                status: 409,
                message: "A category with that name already exists."
            });
        }

        const category = await Category.create({ name, description });

        return res.status(201).json({
            status: 201,
            message: "Category created successfully.",
            category
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: "Category not found."
            });
        }

        if (name && (name.length < 3 || name.length > 100)) {
            return res.status(400).json({
                status: 400,
                message: "Category name must be between 3 and 100 characters."
            });
        }

        if (name && name !== category.name) {
            const exists = await Category.findOne({ where: { name } });
            if (exists) {
                return res.status(409).json({
                    status: 409,
                    message: "A category with that name already exists."
                });
            }
        }

        await category.update({ name, description });

        return res.status(200).json({
            status: 200,
            message: "Category updated successfully.",
            category
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: "Category not found."
            });
        }

        await category.destroy();

        return res.status(200).json({
            status: 200,
            message: "Category deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};

export {getAllCategories,getCategoryById,updateCategory,createCategory,deleteCategory};
