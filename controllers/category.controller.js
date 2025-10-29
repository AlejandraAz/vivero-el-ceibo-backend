import Category from "../models/Category.js";
import { Op } from "sequelize";

const getAllCategories = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};
        
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        if (status !== undefined) {
            whereClause.status = status === "true" ? 1 : 0;
        }


        const { rows: categories, count } = await Category.findAndCountAll({
            where:whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["fecha_creacion", "DESC"]],
        });

        return res.status(200).json({
            status: 200,
            message: "Categories retrieved successfully.",
            categories,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
        });
    }
};

// este es para la publica
const getAllCategoriesPublic = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: true },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error al obtener categorías públicas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }

        return res.status(200).json({
            status: 200,
            message: "Category retrieved successfully.",
            category
        });

    } catch (error) {
        next(error)
    }
};
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });

        return res.status(201).json({
            status: 201,
            message: "Category created successfully.",
            category
        });

    } catch (error) {
        next(error)
    }
};
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await Category.findByPk(id);

        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }


        await category.update({ name, description });

        return res.status(200).json({
            status: 200,
            message: "Category updated successfully.",
            category
        });

    } catch (error) {
        next(error)
    }
};
const toggleCategoryStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }

        category.status = !category.status;
        await category.save();

        return res.status(200).json({
            status: 200,
            message: category.status
                ? "Category activated successfully."
                : "Category deactivated successfully."
        });

    } catch (error) {
        next(error)
    }
};

export { getAllCategories,getAllCategoriesPublic, getCategoryById, updateCategory, createCategory, toggleCategoryStatus };
