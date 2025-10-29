import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      field: "nombre",
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 100],
          msg: "Product name must be between 3 and 100 characters.",
        },
      },
    },
    description: {
      field: "descripcion",
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [0, 6000],
          msg: "Description can be up to 6000 characters.",
        },
      },
    },
    price: {
      field: "precio",
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    featured: {
      field: "destacado",
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status:{
        field:'estado',
        type:DataTypes.BOOLEAN,
         defaultValue: true, // activo
        allowNull: false,
    },
    id_admin: {
      field: "id_admin",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "admins",
        key: "id",
      },
    },
    id_category: {
      field: "id_categoria",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id",
      },
    },
  },
  { tableName: "productos", timestamps: true,underscored:true ,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion"}
);

export default Product;
