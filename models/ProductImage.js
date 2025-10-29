import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const ProductImage = sequelize.define(
    "ProductImage",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        url: {
            field: 'url',
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true,
            },
        },
        public_id:{  //p/borrar en cloudinary
            field: "public_id",
            type: DataTypes.STRING,
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
        is_main: {
            field: "es_principal", 
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "imagenes_productos",
        timestamps: true,
        underscored: true,
        createdAt: "fecha_creacion",
        updatedAt: "fecha_actualizacion",
    }
);

export default ProductImage;
