import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import OrderDetail from "../models/OrderDetail.js";
import sendResponse from "../helpers/sendResponse.js";
import calculateCartTotal from "../helpers/cartTotal.js";
import sequelize from "../config/connection.js";
import Shipping from "../models/Shipping.js";
import Customer from "../models/Customer.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { notifyAdminNewOrder,sendOrderConfirmation } from "../config/mailer.js";

// CLIENTE - Obtener todos los pedidos de un cliente
const getOrdersByCustomer = async (req, res) => {
  const customerId = req.user.sub;
  const page = parseInt(req.query.page) || 1;       // página actual (default 1)
  const limit = parseInt(req.query.limit) || 6;     // cantidad de pedidos por página (default 5)
  const offset = (page - 1) * limit;

  try {
    // Traer total de pedidos para calcular totalPages
    const totalOrders = await Order.count({
      where: { id_customer: customerId, status: { [Op.ne]: "cancelado" } },
    });

    const orders = await Order.findAll({
      where: { id_customer: customerId, status: { [Op.ne]: "cancelado" } },
      order: [["date", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: Shipping,
          as: "shipping",
          attributes: ["city", "province", "street", "number", "postalCode", "shippingStatus"],
        },
        {
          model: OrderDetail,
          as: "details",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "price"],
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

    return res.status(200).json({
      status: 200,
      message: "Orders retrieved successfully.",
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in getOrdersByCustomer:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
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

const createOrder = async (req, res) => {
  // console.log(" [BACK] createOrder iniciado...");
  // console.log(" Body recibido:", req.body);

  const {
    id_cart,
    id_shipping,
    id_customer,
    payment_method,
    delivery_type,
    subtotal,
    impuestos,
    total,
    items,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    // Validar cliente
    const customer = await Customer.findByPk(id_customer, { transaction: t });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ status: 404, message: "Cliente no encontrado." });
    }

    // Validar campos requeridos
    if (!id_cart || !id_customer || !payment_method || !delivery_type || total == null || !items || !items.length) {
      await t.rollback();
      return res.status(400).json({ status: 400, message: "Faltan campos requeridos." });
    }

    if (delivery_type === "envio" && !id_shipping) {
      await t.rollback();
      return res.status(400).json({ status: 400, message: "Falta id_shipping para el envío." });
    }

    // Verificar carrito
    const cart = await Cart.findByPk(id_cart, { transaction: t });
    if (!cart) {
      await t.rollback();
      return res.status(404).json({ status: 404, message: "Carrito no encontrado." });
    }

    // Verificar shipping si aplica
    if (delivery_type === "envio") {
      const shipping = await Shipping.findByPk(id_shipping, { transaction: t });
      if (!shipping) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: "Envío no encontrado." });
      }
    }

    // Crear la orden
    const newOrder = await Order.create(
      {
        id_cart,
        id_shipping,
        id_customer,
        payment_method,
        delivery_type,
        subtotal,
        impuestos,
        total,
        order_status: "pendiente",
        id_admin: null,
      },
      { transaction: t }
    );

    await newOrder.reload({ transaction: t });

    // Validar stock y preparar detalles de la orden
    const detailsToCreate = [];
    for (const item of items) {
      const product = await Product.findByPk(item.id_producto, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ status: 404, message: `Producto no encontrado: ${item.nombre}` });
      }

      if (product.stock < item.cantidad) {
        await t.rollback();
        return res.status(400).json({ status: 400, message: `Stock insuficiente para ${product.name}` });
      }

      // Reducir stock
      product.stock -= item.cantidad;
      await product.save({ transaction: t });

      // Preparar detalle de orden
      detailsToCreate.push({
        id: uuidv4(),
        id_order: newOrder.id,
        id_product: item.id_producto,
        quantity: item.cantidad,
        unit_price: item.subtotal / item.cantidad,
        subtotal: item.subtotal,
        product_name: item.nombre || "Producto",
        product_image: item.imagen || null,
        product_desc: item.descripcion || null,
        status: true,
      });
    }

    // Crear detalles de la orden
    await OrderDetail.bulkCreate(detailsToCreate, { transaction: t });

    // Marcar carrito como inactivo
    cart.status = false;
    await cart.save({ transaction: t });

    //  Crear nuevo carrito
    const newCart = await Cart.create({ id_customer, status: true }, { transaction: t });

    // Commit de toda la transacción
    await t.commit();

    // Envío de correo y notificación (fuera de la transacción)
    await sendOrderConfirmation(customer.email, customer.name, newOrder);
    await notifyAdminNewOrder(newOrder, customer);

    console.log("Orden creada exitosamente:", newOrder.id);

    return res.status(201).json({
      status: 201,
      message: "Orden creada exitosamente.",
      order: newOrder,
      newCartId: newCart.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("💥 Error en createOrder:", error.message);
    return res.status(500).json({ status: 500, message: "Error interno del servidor.", error: error.message });
  }
};

// ******Controller de graficos de dasbhoard
export const getOrdersByStatus = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: [
        ['estado', 'status'],
        [sequelize.fn('COUNT', sequelize.col('estado')), 'count']
      ],
      group: ['estado']
    });

    res.json({ data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos por estado" });
  }
};
//  Para ver cual metodo de pago se prefiere
export const getPaymentMethodStats = async (req, res) => {
  try {
    const result = await Order.findAll({
      attributes: [
         ['metodo_pago', 'payment_method'],
        [sequelize.fn('COUNT', sequelize.col('metodo_pago')), 'count']
      ],
      group: ['metodo_pago']
    });

    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener métodos de pago" });
  }
};

// productos mas vendidos
export const getTopSellingProducts = async (req, res) => {
  try {
    const products = await OrderDetail.findAll({
      attributes: [
        [sequelize.col("Product.nombre"), "product_name"],
        [sequelize.fn("SUM", sequelize.col("OrderDetail.cantidad")), "totalSold"]
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: []
        }
      ],
      where: { status: true },
      group: ["product.nombre"],
      order: [[sequelize.fn("SUM", sequelize.col("OrderDetail.cantidad")), "DESC"]],
      limit: 10,
      raw: true
    });

    res.json({ data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo productos más vendidos" });
  }
};

export {getOrdersByCustomer, getOrderById, createOrder, };
