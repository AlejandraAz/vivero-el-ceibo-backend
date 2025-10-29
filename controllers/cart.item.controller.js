import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import calculateCartTotal from "../helpers/cartTotal.js";
import  sendResponse from "../helpers/sendResponse.js";
import sequelize from "../config/connection.js";

const getAllCartItems = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { status: true },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "stock"],
          include: [
            {
              model: ProductImage,
              as: "images",
              attributes: ["url", "is_main"],
            },
          ],
        },
      ],
    });

    if (!items.length) {
      return sendResponse(res, 404, "No se encontraron items en el carrito");
    }

    return sendResponse(res, 200, "Items obtenidos correctamente", items);
  } catch (error) {
    return sendResponse(res, 500, "Error interno del servidor", { error: error.message });
  }
};
const addCartItem = async (req, res) => {
  const { id_cart, id_product, quantity } = req.body;

  if (!id_cart || !id_product || !quantity) {
    return sendResponse(res, 400, "Faltan campos obligatorios");
  }

  try {
    const cart = await Cart.findByPk(id_cart);
    if (!cart || !cart.status) {
      return sendResponse(res, 404, "Carrito no encontrado o inactivo");
    }

    const product = await Product.findByPk(id_product);
    if (!product) {
      return sendResponse(res, 404, "Producto no encontrado");
    }

    if (product.stock < quantity) {
      return sendResponse(res, 400, "Stock insuficiente");
    }

    let item = await CartItem.findOne({
      where: { id_cart, id_product, status: true },
    });

    // Si ya existe el item, actualiza la cantidad
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        id_cart,
        id_product,
        quantity,
        price: product.price,
      });
    }

    await calculateCartTotal(id_cart);
    return sendResponse(res, 201, "Producto agregado al carrito", item);
  } catch (error) {
    return sendResponse(res, 500, "Error al agregar producto", { error: error.message });
  }
};

/**
 *  Actualizar cantidad de un producto del carrito
 */
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return sendResponse(res, 400, "Cantidad inválida");
  }

  try {
    const item = await CartItem.findByPk(id);
    if (!item) {
      return sendResponse(res, 404, "Item no encontrado");
    }

    const product = await Product.findByPk(item.id_product);
    if (product.stock < quantity) {
      return sendResponse(res, 400, "Stock insuficiente");
    }

    item.quantity = quantity;
    await item.save();

    await calculateCartTotal(item.id_cart);

    return sendResponse(res, 200, "Cantidad actualizada", item);
  } catch (error) {
    return sendResponse(res, 500, "Error al actualizar el item", { error: error.message });
  }
};

/**
 *  Eliminar (inactivar) un item del carrito
 */
 const deleteCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await CartItem.findByPk(id);
    if (!item) {
      return sendResponse(res, 404, "Item no encontrado");
    }

    await sequelize.transaction(async (t) => {
      await item.update({ status: false }, { transaction: t });
      await calculateCartTotal(item.id_cart, t);
    });

    return sendResponse(res, 200, "Item eliminado del carrito");
  } catch (error) {
    return sendResponse(res, 500, "Error al eliminar el item", { error: error.message });
  }
};

/**
 *  Vaciar carrito completo (sin borrar registros)
 */
const clearCart = async (req, res) => {
  const { id_cart } = req.params;

  try {
    const cart = await Cart.findByPk(id_cart);
    if (!cart) return sendResponse(res, 404, "Carrito no encontrado");

    await sequelize.transaction(async (t) => {
      await CartItem.update({ status: false }, { where: { id_cart }, transaction: t });
      await cart.update({ total: 0 }, { transaction: t });
    });

    return sendResponse(res, 200, "Carrito vaciado correctamente");
  } catch (error) {
    return sendResponse(res, 500, "Error al vaciar el carrito", { error: error.message });
  }
};

export {getAllCartItems,addCartItem,clearCart,deleteCartItem,updateCartItem};