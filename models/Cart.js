import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue:DataTypes.UUIDV4
    },
    total:{
      field:"total",
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      defaultValue:0,
    },
    status: {
      field: "estado",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:true
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
    // Podés agregar opcionalmente fecha de inactivación:
  deactivated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  },
  { tableName: "carritos", timestamps: true,underscored:true,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion" }
);

export default Cart;
