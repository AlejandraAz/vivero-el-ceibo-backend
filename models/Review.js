import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Review = sequelize.define("Review", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    ratings: {
        field: "calificacion",
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        field: "comentario",
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
    field:"estado",
    type: DataTypes.ENUM("pendiente", "aprobada", "rechazada"),
    defaultValue: "pendiente",
    allowNull:false
    },
    admin_response: {
    type: DataTypes.TEXT,
    allowNull: true
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
    id_customer: {
        field: "id_cliente",
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "clientes",
            key: "id",
        },
    },
}, { tableName: "reseñas", timestamps: true,underscored:true ,createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion"});

export default Review;