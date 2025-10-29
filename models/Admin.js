// Hashear contraseñas en los hooks del modelo es una regla de negocio/seguridad, no solo una función técnica.
import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import bcrypt from 'bcrypt';

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
    },
    name: {
      field: "nombre", // nombre de la columna de la DB para respetar el DER
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 30],
          msg: "The  name must be between 3 and 30 characters.",
        },
      },
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
          msg: "The email must be between 5 and 100 characters.",
        },
      },
    },
    password: {
      field: "contraseña",
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    accountStatus: {
      field: "estado_cuenta",
      type: DataTypes.ENUM("activo", "bloqueado"),
      allowNull: false,
      defaultValue:"activo"
    },
    rol:{
    field:'rol',
    type:DataTypes.ENUM("admin"),
    defaultValue: 'admin',
    allowNull:false
  },
  },
  { tableName: "admins", timestamps: true,underscored:true,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion" }  //underscores para que se creen snake_case, y a createAdt y updateAt los nombro en castellano en la tabla
);

// Hook de sequelize para crear el hash de la contraseña
Admin.addHook("beforeCreate",async(admin)=>{
  if(admin.password){
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password,salt)
  }
});

// Hook para actualizar antes de guardar 
Admin.addHook("beforeUpdate",async(admin)=>{
  if(admin.changed('password')){
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password,salt)
  }
})

// para comparar la contraseña
Admin.prototype.checkPassword = function(plain){
  return bcrypt.compare(plain,this.password)
}

Admin.prototype.toJSON = function(){
  const values = { ...this.get() };
  delete values.password;
  return values;
}

export default Admin;
