import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    status:{
        field:'estado',
        type:DataTypes.BOOLEAN,
         defaultValue: true, // activo
        allowNull: false,
    },
    id_product: {
      field: "id_producto",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "productos",
        key: "id",
      },
    },
    id_order: {
      field: "id_pedido",
      type: DataTypes.UUID,
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
    product_name: {
      field: "nombre_producto",
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    product_image: {
      field: "imagen_producto",
      type: DataTypes.STRING, // o TEXT si usás URLs largas
      allowNull: true,
    },
    product_desc: {
      field: "descripcion_producto",
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { tableName: "detalles_de_pedidos", timestamps: true,underscored:true,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion" }
);

export default OrderDetail;
