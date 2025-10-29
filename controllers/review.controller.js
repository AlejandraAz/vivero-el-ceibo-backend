import Review from "../models/Review.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import { Op } from "sequelize";
import { notifyAdminNewReview } from "../config/mailer.js";

// para mostrarla en productDeatil
const getProductReviews = async (req, res) => {
    const { id } = req.params;
    const reviews = await Review.findAll({
        where: { id_product: id, status: "aprobada" },
        include: [
            {
                model: Customer,
                as: "customer",
                attributes: ["id", "name", "photo"],
            },
        ],
        order: [["fecha_creacion", "DESC"]],
    });
    return res.status(200).json(reviews);
};

const createReview = async (req, res) => {
    try {
        const { id: customerId } = req.currentUser;
        const { id_product, ratings, comment } = req.body;

        if (!id_product || !ratings || !comment) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const product = await Product.findByPk(id_product);
        if (!product) return res.status(404).json({ message: "Producto no encontrado." });

        const review = await Review.create({
            id_product,
            id_customer: customerId,
            ratings,
            comment,
            status: "pendiente", // todas las nuevas reseñas quedan pendientes
        });

        // Traer datos del cliente y producto para el correo
        const customer = await Customer.findByPk(customerId);
        const productData = await Product.findByPk(id_product);

        await notifyAdminNewReview(review, customer, productData);
        return res.status(201).json({ message: "Reseña enviada y pendiente de aprobación.", review });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

/**
 * Eliminar reseña propia (cliente)
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) return res.status(404).json({ message: "Reseña no encontrada." });

        const isOwner = req.currentUser.id === review.id_customer;
        const isAdmin = req.user.rol === "admin";

        if (!isOwner && !isAdmin)
            return res.status(403).json({ message: "No tienes permiso para eliminar esta reseña." });

        await review.destroy();
        return res.status(200).json({ message: "Reseña eliminada correctamente." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// para que manipule admin:
// const getAllReviews = async (req, res) => {
//     try {
//         const reviews = await Review.findAll({
//             include: [
//                 { model: Customer, as: "customer", attributes: ["name", "photo"] },
//                 { model: Product, as: "product", attributes: ["name"] },
//             ],
//             order: [["fecha_creacion", "DESC"]],
//         });
//         return res.status(200).json(reviews);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Error interno del servidor." });
//     }
// };
// no filtra
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 5, status, search } = req.query;

        const offset = (page - 1) * limit;

        const where = {};

        // 🟢 Filtro por estado
        if (status && status.trim() !== "") {
            where.status = status;
        }

        // 🔍 Filtro por búsqueda en comentario o cliente
        if (search && search.trim() !== "") {
            where[Op.or] = [
                { comment: { [Op.like]: `%${search}%` } },
                { "$customer.nombre$": { [Op.like]: `%${search}%` } },
                { '$product.nombre$': { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Review.findAndCountAll({
            where,
            include: [
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["name", "email"],
                },
                {
                    model: Product,
                    as: "product",
                    attributes: ["name"],
                },
            ],
            order: [["fecha_creacion", "DESC"]],
            offset: parseInt(offset),
            limit: parseInt(limit),
        });

        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({
            data: rows,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: parseInt(page),
            },
        });

    } catch (error) {
        console.error("Error al obtener reseñas:", error);
        return res.status(500).json({
            message: "Error interno del servidor.",
            error: error.message,
        });
    }
};

/**
 * Obtener solo reseñas pendientes (para moderación admin)
 */
const getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { status: "pendiente" },
            include: [
                { model: Customer, as: "customer", attributes: ["name", "photo"] },
                { model: Product, as: "products", attributes: ["name"] },
            ],
            order: [["fecha_creacion", "DESC"]],
        });
        return res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

/**
 * Aprobar o rechazar reseña y/o agregar respuesta del admin
 */
const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;

        const review = await Review.findByPk(id);
        if (!review) return res.status(404).json({ message: "Reseña no encontrada." });

        review.status = status || review.status;
        review.admin_response = admin_response || review.admin_response;

        await review.save();
        return res.status(200).json({ message: "Reseña actualizada.", review });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};
const getMyReviews = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user);
        // El id del usuario autenticado viene desde el middleware de auth
        const customerId = req.user.sub;

        const reviews = await Review.findAll({
            where: { id_customer: customerId },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: ProductImage,
                            as: "images",
                            attributes: ["url", "is_main"],
                            where: { is_main: true }, // solo la imagen principal
                            required: false,
                        },
                    ],
                },
            ],
            order: [["fecha_creacion", "DESC"]],
        });

        // Formateamos un poco para que sea más fácil en el front
        const formattedReviews = reviews.map((r) => ({
            id: r.id,
            comment: r.comment,
            ratings: r.ratings,
            fecha_creacion: r.fecha_creacion,
            product: {
                id: r.product?.id,
                name: r.product?.name,
                mainImage:
                    r.product?.images?.length > 0 ? r.product.images[0].url : null,
            },
        }));

        return res.status(200).json({ reviews: formattedReviews });
    } catch (error) {
        console.error("Error al obtener reseñas del usuario:", error);
        return res
            .status(500)
            .json({ message: "Error al obtener tus reseñas" });
    }
};
export { getAllReviews, getMyReviews, getProductReviews, createReview, deleteReview, getPendingReviews, updateReviewStatus }