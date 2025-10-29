import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    name: {
      field: "nombre",
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 100],
          msg: "The category name must be between 3 and 100 characters.",
        },
      },
    },
    status:{
        field:'estado',
        type:DataTypes.BOOLEAN,
         defaultValue: true, // activo
        allowNull: false,
    },
    description: {
      field: "descripcion",
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500], // hasta 500 caracteres si se desea
          msg: "The description must be at most 500 characters.",
        },
      },
    },
  },
  { tableName: "categorias", timestamps: true,underscored:true,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion" }
);

export default Category;
