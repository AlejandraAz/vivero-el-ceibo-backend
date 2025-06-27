import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import OrderDetail from "../models/OrderDetail.js";

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        if (!orders.length) {
            return res.status(404).json({ status: 404, message: "No orders found." });
        }
        return res.status(200).json({ status: 200, message: "Orders retrieved.", orders });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ status: 404, message: "Order not found." });
        }
        return res.status(200).json({ status: 200, message: "Shipping retrieved successfully.", order });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

// En este controller inactivo el carrito en cuanto se realiza el pedido
const createOrder = async (req, res) => {
  const { id_cart, id_shipping, id_admin, id_customer, delivery_type, payment_method, total } = req.body;

  try {
    // Validar campos
    if (!id_cart || !id_admin || !id_customer || !delivery_type || !payment_method || total === undefined) {
      return res.status(400).json({
        status: 400,
        message: "Required fields are missing."
      });
    }

    // Verificar que el carrito exista y esté activo
    const cart = await Cart.findByPk(id_cart);
    if (!cart || cart.status === false) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found or already inactive."
      });
    }

    // Obtener los productos del carrito
    const cartItems = await CartItem.findAll({
      where: { id_cart },
      include: [ Product ] // para acceder al precio
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Cannot create order with empty cart."
      });
    }

    // Crear pedido
    const order = await Order.create({
      id_shipping,
      id_admin,
      id_customer,
      status: "pendiente",
      delivery_type,
      payment_method,
      total
    });

    // Crear detalles del pedido
    for (const item of cartItems) {
      const unit_price = item.Product.price;
      const subtotal = unit_price * item.quantity;

      await OrderDetail.create({
        id_order: order.id,
        id_product: item.id_product,
        quantity: item.quantity,
        unit_price,
        subtotal
      });
    }

    // Marcar carrito como inactivo
    await Cart.update({ status: false }, { where: { id: id_cart } });

    return res.status(201).json({
      status: 201,
      message: "Order and details created successfully.",
      orderId: order.id
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message
    });
  }
};

const updateOrder = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ status: 404, message: "Order not found." });
        }

        await order.update(data);
        return res.status(200).json({ status: 200, message: "Order updated successfully.", order });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ status: 404, message: "Order not found." });
        }
        await order.destroy();
        return res.status(200).json({ status: 200, message: "Order deleted successfully." });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error.", error: error.message });
    }
};

export { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder };