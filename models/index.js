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
import ProductImage from "./ProductImage.js";
import Review from "./Review.js";



//relación de  (1:N)
Category.hasMany(Product, {
  foreignKey: "id_category", // FK en la tabla productos
  as:"products",
  sourceKey: "id", // PK en la tabla categorías
});

Product.belongsTo(Category, {
  foreignKey: "id_category", // FK en productos
  as: 'category',
  targetKey: "id", // clave a la que apunta en categorías
});

Product.hasMany(ProductImage,{
  foreignKey:'id_product',as: "images",onDelete: "CASCADE",  // si borro el producto,borra sus imágenes en DB
})
ProductImage.belongsTo(Product,{
  foreignKey:'id_product',as:"product"
})
//relación de (1:1)

Customer.hasMany(Cart, {
  foreignKey: "id_customer",
  sourceKey: "id",
  as:"carts"
});
Cart.belongsTo(Customer, {
  foreignKey: "id_customer",
  targetKey: "id",
  as:"customer"
});

Customer.hasMany(Review,{
  foreignKey:"id_customer",
  as:"reviews"
});
Review.belongsTo(Customer,{
  foreignKey:"id_customer",
  as:"customer"
});
Product.hasMany(Review,{
  foreignKey:"id_product",
  as:"reviews"
});
Review.belongsTo(Product,{
  foreignKey:"id_product",
  as:"product"
})

// relación de (1:N) con tabla intermedia
Cart.hasMany(CartItem, {
  foreignKey: "id_cart",
  sourceKey: "id",
  as:"items",
});
CartItem.belongsTo(Cart, {
  foreignKey: "id_cart",
  targetKey: "id",
});

Product.hasMany(CartItem, {
  foreignKey: "id_product",
  sourceKey: "id",
  as:"cartItems"
});
CartItem.belongsTo(Product, {
  foreignKey: "id_product",
  targetKey: "id",
  as: "product" 
});

// relación de (1:N) con tabla intermedia
Product.hasMany(OrderDetail, {
  foreignKey: "id_product",
  sourceKey: "id",
  as: "orderDetails",
});
OrderDetail.belongsTo(Product, {
  foreignKey: "id_product",
  targetKey: "id",
   as: "product",
});

Order.hasMany(OrderDetail, {
  foreignKey:  { name: "id_order", field: "id_pedido" },
  as: "details",
});
OrderDetail.belongsTo(Order, {
  foreignKey:  { name: "id_order", field: "id_pedido" },
  as: "order",
});

//relación de 1:N
Customer.hasMany(Order, {
  foreignKey: "id_customer",
  sourceKey: "id",
  as: "orders", 
});
Order.belongsTo(Customer, {
  foreignKey: "id_customer",
  targetKey: "id",
  as: "customer",
});

//relación 1:1
Shipping.hasOne(Order, {
  foreignKey: "id_shipping",
  as:"order"
});
Order.belongsTo(Shipping, {
  foreignKey: "id_shipping",
  as:"shipping"
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
  ProductImage,
  Shipping,
  Review,
  sequelize,
};
// sequelize.sync({ alter: true });
