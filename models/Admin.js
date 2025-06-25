import { DataTypes } from "sequelize";
import sequelize from "../controllers/connection.js";

const Admin = sequelize.define('Admin',{
    id:{
        primaryKey:true,
        type:DataTypes.INTEGER,
        autoIncrement:true
    },
    name:{
        field: 'nombre',  // nombre de la columna de la DB para respetar el DER
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true,
            len: {
            args: [3, 30],
            msg: 'The  name must be between 3 and 30 characters.'
            }
        }
    },
    email:{
        allowNull:false,
        unique:true,
        type:DataTypes.STRING,
        validate:{
            notEmpty:true,
            isEmail:true,
            len: {
            args: [5, 100], 
            msg: 'The email must be between 5 and 100 characters.'
            }
        }
    },
    password:{
        field: 'contraseña',
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty:true,
            len:{
                args:[8,15],
                msg: 'The password  must be between 8 and 15 characters.'
            }
        }
    }
},{tableName:'admins',timestamps:false});

export default Admin;