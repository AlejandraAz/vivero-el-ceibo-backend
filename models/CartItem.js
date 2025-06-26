import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    quantity: {
      field: "cantidad",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    subtotal: {
      field: "subtotal",
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    id_cart: {
      field: "id_carrito",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "carritos",
        key: "id",
      },
    },
    id_product: {
      field: "id_producto",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "id",
      },
    },
  },
  { tableName: "item_carrito", timestamps: false }
);

export default CartItem;
