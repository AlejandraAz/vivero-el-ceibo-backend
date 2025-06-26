import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      field: "estado",
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    created_at: {
      field: "fecha_creacion",
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    id_customer: {
      field: "id_cliente",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clientes",
        key: "id",
      },
    },
  },
  { tableName: "carritos", timestamps: false }
);

export default Cart;
