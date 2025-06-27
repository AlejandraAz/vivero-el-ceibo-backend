import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const createCartItem = async (req, res) => {
    const { id_cart, id_product, quantity } = req.body;

    try {
        if (!id_cart || !id_product || !quantity) {
            return res.status(400).json({
                status: 400,
                message: "Cart ID, product ID, and quantity are required.",
            });
        }

        if (isNaN(id_cart) || isNaN(id_product) || isNaN(quantity)) {
            return res.status(400).json({
                status: 400,
                message: "IDs and quantity must be numbers.",
            });
        }

        // Buscar carrito
        const cart = await Cart.findByPk(id_cart);
        if (!cart || !cart.status) {
            return res.status(404).json({
                status: 404,
                message: "Cart not found or inactive.",
            });
        }

        // Buscar producto
        const product = await Product.findByPk(id_product);
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Product not found.",
            });
        }

        // Verificar stock suficiente
        if (quantity > product.stock) {
            return res.status(400).json({
                status: 400,
                message: "Insufficient stock.",
            });
        }

        // Si el producto ya está en el carrito, se puede evitar o actualizar
        const existingItem = await CartItem.findOne({
            where: { id_cart, id_product },
        });

        if (existingItem) {
            return res.status(409).json({
                status: 409,
                message: "Item already exists in cart. Use update instead.",
            });
        }

        // Calcular subtotal
        const subtotal = (product.price * quantity).toFixed(2);

        // Crear ítem
        const newItem = await CartItem.create({
            id_cart,
            id_product,
            quantity,
            subtotal,
        });

        return res.status(201).json({
            status: 201,
            message: "Item added to cart.",
            item: newItem,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

const updateCartItem = async (req, res) => {
    const { id } = req.params; // ID del CartItem
    const { quantity } = req.body;

    try {
        // Validaciones
        if (!quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                status: 400,
                message: "Quantity must be a valid number greater than 0.",
            });
        }

        const cartItem = await CartItem.findByPk(id);
        if (!cartItem) {
            return res.status(404).json({
                status: 404,
                message: "Cart item not found.",
            });
        }

        const product = await Product.findByPk(cartItem.id_product);
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Associated product not found.",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                status: 400,
                message: "Insufficient stock to update quantity.",
            });
        }

        const newSubtotal = (product.price * quantity).toFixed(2);

        await cartItem.update({
            quantity,
            subtotal: newSubtotal,
        });

        return res.status(200).json({
            status: 200,
            message: "Cart item updated successfully.",
            cartItem,
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

const getCartItemsByCartId = async (req, res) => {
    const { id } = req.params;
    const cartId = parseInt(id, 10);

    try {
        if (isNaN(cartId)) {
            return res.status(400).json({
                status: 400,
                message: "Cart ID must be a valid number.",
            });
        }

        const cart = await Cart.findByPk(cartId);
        if (!cart) {
            return res.status(404).json({
                status: 404,
                message: "Cart not found.",
            });
        }

        const cartItems = await CartItem.findAll({
            where: { id_cart: cartId },
            include: {
                model: Product,
                attributes: ['id', 'name', 'price', 'image'],
            }
        });

        if (cartItems.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No items found in this cart.",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Cart items retrieved successfully.",
            items: cartItems,
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

const deleteCartItem = async (req, res) => {
    const { id } = req.params;

    try {
        if (isNaN(id)) {
            return res.status(400).json({
                status: 400,
                message: "Cart item ID must be a valid number.",
            });
        }

        const cartItem = await CartItem.findByPk(id);
        if (!cartItem) {
            return res.status(404).json({
                status: 404,
                message: "Cart item not found.",
            });
        }

        await cartItem.destroy();

        return res.status(200).json({
            status: 200,
            message: "Cart item deleted successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message,
        });
    }
};


export {createCartItem,updateCartItem,getCartItemsByCartId,deleteCartItem};