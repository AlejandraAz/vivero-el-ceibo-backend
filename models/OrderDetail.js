import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
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
    id_order: {
      field: "id_pedido",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pedidos",
        key: "id",
      },
    },
    quantity: {
      field: "cantidad",
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      field: "precio_unitario",
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
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
  },
  { tableName: "detalles_de_pedidos", timestamps: false }
);

export default OrderDetail;
