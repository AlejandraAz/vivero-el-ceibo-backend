import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
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
      defaultValue:0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status:{
        field:'estado',
        type:DataTypes.BOOLEAN,
         defaultValue: true, // activo
        allowNull: false,
    },
    id_cart: {
      field: "id_carrito",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "carritos",
        key: "id",
      },
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
  },
  { tableName: "item_carrito", timestamps: true,underscored:true,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion" }
);

export default CartItem;
