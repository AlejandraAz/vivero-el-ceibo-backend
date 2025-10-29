import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    number_order: {
      field: "numero_pedido",
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
    },
    id_shipping: {
      field: "id_envio",
      type: DataTypes.UUID,
      allowNull: true, // porque no todos los pedidos tienen envio
      references: {
        model: "envios",
        key: "id",
      },
    },
    id_admin: {
      field: "id_admin",
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "admins",
        key: "id",
      },
    },
    id_customer: {
      field: "id_cliente",
      type: DataTypes.UUID,
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
      type: DataTypes.ENUM("envio", "retiro en tienda"),
      allowNull: false,
      validate: {
        isIn: [["envio", "retiro en tienda"]],
      },
    },
    payment_method: {
      field: "metodo_pago",
      type: DataTypes.ENUM("transferencia", "tarjeta", "contra entrega"),
      allowNull: false,
      validate: {
        isIn: [["transferencia", "tarjeta", "contra entrega"]],
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
  {
    tableName: "pedidos",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

export default Order;
