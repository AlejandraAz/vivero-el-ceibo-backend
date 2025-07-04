import sequelize from "../config/connection.js";
import Admin from "./Admin.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Category from "./Category.js";
import Customer from "./Customer.js";
import Order from "./Order.js";
import OrderDetail from "./OrderDetail.js";
import Product from "./Product.js";
import Shipping from "./Shipping.js";

//relación de  (1:N)
Category.hasMany(Product, {
  foreignKey: "id_category", // FK en la tabla productos
  sourceKey: "id", // PK en la tabla categorías
});

Product.belongsTo(Category, {
  foreignKey: "id_category", // FK en productos
  targetKey: "id", // clave a la que apunta en categorías
});

//relación de (1:1)

Customer.hasOne(Cart, {
  foreignKey: "id_customer",
  sourceKey: "id",
});
Cart.belongsTo(Customer, {
  foreignKey: "id_customer",
  targetKey: "id",
});

// relación de (1:N) con tabla intermedia
Cart.hasMany(CartItem, {
  foreignKey: "id_cart",
  sourceKey: "id",
});
CartItem.belongsTo(Cart, {
  foreignKey: "id_cart",
  targetKey: "id",
});

Product.hasMany(CartItem, {
  foreignKey: "id_product",
  sourceKey: "id",
});
CartItem.belongsTo(Product, {
  foreignKey: "id_product",
  targetKey: "id",
});

// relación de (1:N) con tabla intermedia
Product.hasMany(OrderDetail, {
  foreignKey: "id_product",
  sourceKey: "id",
});
OrderDetail.belongsTo(Product, {
  foreignKey: "id_product",
  targetKey: "id",
});

Order.hasMany(OrderDetail, {
  foreignKey: "id_order",
  sourceKey: "id",
});
OrderDetail.belongsTo(Order, {
  foreignKey: "id_order",
  targetKey: "id",
});

//relación de 1:N
Customer.hasMany(Order, {
  foreignKey: "id_customer",
  sourceKey: "id",
});
Order.belongsTo(Customer, {
  foreignKey: "id_customer",
  targetKey: "id",
});

//relación 1:1
Shipping.hasOne(Order, {
  foreignKey: "id_shipping",
});
Order.belongsTo(Shipping, {
  foreignKey: "id_shipping",
});

//relación de 1:N
Admin.hasMany(Order, {
  foreignKey: "id_admin",
});

Order.belongsTo(Admin, {
  foreignKey: "id_admin",
});

//relación 1:N
Admin.hasMany(Product, {
  foreignKey: "id_admin",
});
Product.belongsTo(Admin, {
  foreignKey: "id_admin",
});

export {
  Admin,
  Cart,
  CartItem,
  Category,
  Customer,
  Order,
  OrderDetail,
  Product,
  Shipping,
  sequelize,
};
// sequelize.sync({ alter: true });
