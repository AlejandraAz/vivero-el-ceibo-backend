import { DataTypes } from "sequelize";
import sequelize from "../controllers/connection.js";

const Client = sequelize.define('Client', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    name: {
        field: 'nombre',  // nombre de la columna de la DB para respetar el DER
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: {
                args: [3, 100],
                msg: 'The  name must be between 3 and 100 characters.'
            }
        }
    },
    email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
            notEmpty: true,
            isEmail: true,
            len: {
                args: [5, 100],
                msg: 'The email must be between 5 and 100 characters.'
            }
        }
    },
    password: {
        field: 'contraseña',
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: {
                args: [8, 15],
                msg: 'The password  must be between 8 and 15 characters.'
            }
        }
    },
    sessionStatus: {
        field: 'estado_sesion',
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    accountStatus: {
        field: 'estado_cuenta',
        type: DataTypes.ENUM('activo', 'bloqueado'),
        allowNull: false
    }
}, { tableName: 'clientes', timestamps: false });

export default Client;