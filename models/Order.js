import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    id_shipping: {
      field: "id_envio",
      type: DataTypes.INTEGER,
      allowNull: true, // porque no todos los pedidos tienen envio
      references: {
        model: "envios",
        key: "id",
      },
    },
    id_admin: {
      field: "id_admin",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admins",
        key: "id",
      },
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
    date: {
      field: "fecha",
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
    },
    status: {
      field: "estado",
      type: DataTypes.ENUM(
        "pendiente",
        "procesando",
        "completado",
        "cancelado"
      ),
      allowNull: false,
      defaultValue: "pendiente",
      validate: {
        isIn: [["pendiente", "procesando", "completado", "cancelado"]],
      },
    },
    delivery_type: {
      field: "tipo_entrega",
      type: DataTypes.ENUM("envio", "retiro en el local"),
      allowNull: false,
      validate: {
        isIn: [["envio", "retiro en el local"]],
      },
    },
    payment_method: {
      field: "metodo_pago",
      type: DataTypes.ENUM("transferencia", "tarjeta", "en contra entrega"),
      allowNull: false,
      validate: {
        isIn: [["transferencia", "tarjeta", "en contra entrega"]],
      },
    },
    total: {
      field: "total",
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  { tableName: "pedidos", timestamps: false }
);

export default Order;
