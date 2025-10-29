import Cart from "../models/Cart.js";
import Customer from "../models/Customer.js";
import CartItem from "../models/CartItem.js";
import calculateCartTotal from "../helpers/cartTotal.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import sequelize from "../config/connection.js";
import sendResponse from "../helpers/sendResponse.js";

const getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.findAll({
            include: [
                { model: Customer, as: "customer", attributes: ["id", "name", "email"] },
            ],
        });

        if (carts.length === 0) {
            return sendResponse(res, 404, "No se encontraron carritos.");
        }
        return sendResponse(res, 200, "Carritos obtenidos correctamente.", carts);
    } catch (error) {
        return sendResponse(res, 500, "Error al obtener los datos", { error: error.message });
    }
};

const getCartById = async (req, res) => {
    const { id } = req.params;
    try {

        const cart = await Cart.findByPk(id, {
            include: [
                {
                    model: CartItem,
                    as: "items",
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "price", "stock"],
                            include: [
                                {
                                    model: ProductImage,
                                    as: "images",
                                    where: { is_main: true },
                                    required: false,
                                    attributes: ["url"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!cart) return sendResponse(res, 404, `Carrito con ID ${id} no encontrado.`);

        return sendResponse(res, 200, "Carrito obtenido correctamente.", cart);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
}

const createCart = async (req, res) => {
    const { id_customer } = req.body;

    try {
        if (!id_customer)
            return sendResponse(res, 400, "El id_cliente es obligatorio.");

        const customer = await Customer.findByPk(id_customer);
        if (!customer)
            return sendResponse(res, 404, "El cliente especificado no existe.");

        const activeCart = await Cart.findOne({ where: { id_customer, status: true } });

        if (activeCart) {
            return sendResponse(res, 200, "El cliente ya tiene un carrito activo.", activeCart);
        }

        const newCart = await Cart.create({ id_customer });
        return sendResponse(res, 201, "Carrito creado exitosamente.", newCart);
    } catch (error) {
        console.error("CREATE CART ERROR:", error);
        return sendResponse(res, 500, "Error interno del servidor.");
    }
};


const updateCart = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const cart = await Cart.findByPk(id);
        if (!cart) return sendResponse(res, 404, "Carrito no encontrado.");


        cart.status = status ?? cart.status;
        await cart.save();

        return sendResponse(res, 200, "Carrito actualizado correctamente.", cart);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

const desactivateCart = async (req, res) => {
    const { cartId } = req.params;
    const t = await sequelize.transaction();

    try {
        const cart = await Cart.findByPk(cartId);
        if (!cart) {
            await t.rollback();
            return sendResponse(res, 404, "Carrito no encontrado.");
        }

        await Promise.all([
            cart.update({ status: false, deactivated_at: new Date() }, { transaction: t }),
            CartItem.update({ status: false }, { where: { id_cart: cart.id }, transaction: t }),
        ]);

        await t.commit();
        return sendResponse(res, 200, "Carrito e ítems desactivados correctamente.");
    } catch (error) {
        await t.rollback();
        return sendResponse(res, 500, error.message);
    }
};

// ✅ Obtener carrito activo por cliente (para panel admin o front)
const getActiveCartByCustomer = async (req, res) => {
    const { customerId } = req.params;

    try {
        const cart = await Cart.findOne({
            where: { id_customer: customerId, status: true },
            include: [
                {
                    model: CartItem,
                    as: "items",
                    where: { status: true },
                    required: false,
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "price", "stock"],
                            include: [
                                {
                                    model: ProductImage,
                                    as: "images",
                                    where: { is_main: true },
                                    required: false,
                                    attributes: ["url"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!cart) return sendResponse(res, 404, "No se encontró un carrito activo para este cliente.");

        await calculateCartTotal(cart.id);
        return sendResponse(res, 200, "Carrito activo obtenido correctamente.", cart);
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
};

const getMyCartItems = async (req, res) => {
    try {
        const userId = req.user.sub;

        // Buscar carrito activo del usuario
        const cart = await Cart.findOne({
            where: { id_customer: userId, status: true },
            attributes: ['id', 'total'],
        });

        if (!cart) {
            return sendResponse(res, 200, "El usuario no tiene un carrito activo.", { items: [] });
        }

        // Traer los items del carrito activo
        const items = await CartItem.findAll({
            where: { id_cart: cart.id, status: true },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "price", "stock"],
                    include: [
                        {
                            model: ProductImage,
                            as: "images",
                            where: { is_main: true },
                            required: false,
                            attributes: ["url"],
                        },
                    ],
                },
            ],
        });

        await calculateCartTotal(cart.id);
        return sendResponse(res, 200, "Items del carrito obtenidos correctamente.", { cartId: cart.id, items });
    } catch (error) {
        console.error("GET MY CART ERROR:", error);
        return sendResponse(res, 500, "Error al obtener los ítems del carrito.");
    }
};


export { getAllCarts, getCartById, createCart, updateCart, desactivateCart, getActiveCartByCustomer, getMyCartItems };