import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
          args: [0, 1000],
          msg: "Description can be up to 1000 characters.",
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
    image: {
      field: "imagen",
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    featured: {
      field: "destacado",
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      field: "fecha_creacion",
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    id_category: {
      field: "id_categoria",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id",
      },
    },
  },
  { tableName: "productos", timestamps: false }
);

export default Product;
