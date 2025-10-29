import Category from "../models/Category.js";

const validateCategory = async (req, res, next) => {
    const { name, description } = req.body;
    const { id } = req.params;

    try {
        // --- Validar nombre si viene en el body ---
        if (name !== undefined) {
            if (name.trim().length < 3 || name.trim().length > 100) {
                return res.status(400).json({
                    status: 400,
                    message: "Category name must be between 3 and 100 characters.",
                });
            }
        }

        // Normalizamos nombre (para evitar duplicados con mayúsculas/minúsculas)
        const normalizedName = name ? name.trim().toLowerCase() : null;

        // --- Crear categoría ---
        if (!id && normalizedName) {
            const existing = await Category.findOne({
                where: { name: normalizedName },
            });
            if (existing) {
                return res.status(409).json({
                    status: 409,
                    message: "A category with that name already exists.",
                });
            }
        }

        // --- Actualizar categoría ---
        if (id) {
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    status: 404,
                    message: "Category not found.",
                });
            }

            if (normalizedName && normalizedName !== category.name.toLowerCase()) {
                const exists = await Category.findOne({
                    where: { name: normalizedName },
                });
                if (exists) {
                    return res.status(409).json({
                        status: 409,
                        message: "A category with that name already exists.",
                    });
                }
            }
        }

        // --- Validar descripción ---
        if (description && description.length > 500) {
            return res.status(400).json({
                status: 400,
                message: "The description must be at most 500 characters.",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

export default validateCategory;
