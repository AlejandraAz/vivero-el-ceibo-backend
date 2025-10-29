import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import CartItem from "../models/CartItem.js";

async function calculateCartTotal(cartId, transaction = null) {

// Traemos todos los items del carrito con su producto asociado
    const items = await CartItem.findAll({
        where: { id_cart: cartId },
        include: [{ model: Product, as:"product", attributes: ['price'] }],
        transaction
    });

    let total = 0;
    for (const item of items) {
        // const productPrice = item.Product ? Number(item.Product.price) : 0;
        const productPrice = item.product?.price ?? 0;
        const quantity = item.quantity || 0;

         total += quantity * productPrice;
    }

    // Actualizamos el Cart (dentro de la misma transacción si fue pasada)
    await Cart.update({ total }, { where: { id: cartId }, transaction });

    return total;
}

export default calculateCartTotal;