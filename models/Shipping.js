import { DataTypes } from "sequelize";
import sequelize from "../controllers/connection.js";

const Shipping = sequelize.define('Shipping', {
    id: {
        primaryKey: true,
        autoIncrement:true,
        type: DataTypes.INTEGER
    },
    street: {
        field: 'calle',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    number: {
        field: 'nro',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    city: {
        field: 'ciudad',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    province: {
        field: 'provincia',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    postalCode: {
        field: 'codigo_postal',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[A-Za-z]?[0-9]{4,6}$/,// se ajusta a 5800 ó "X5800"
            notEmpty: true
        }
    },
    estimatedDate: {
        field: 'fecha_estimada',
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    shippingStatus: {
        field: 'estado_envio',
        type: DataTypes.ENUM('pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
            isIn: [['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado']]
        }
    },
    phone: {
        field: 'telefono',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[0-9]{7,15}$/, // solo números, mínimo 7, máximo 15
            notEmpty: true
        }
    }

}, { tableName: 'envios', timestamps: false });

export default Shipping;