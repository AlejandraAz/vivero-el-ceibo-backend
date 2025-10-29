import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import bcrypt, { genSalt } from 'bcrypt';

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    name: {
      field: "nombre", // nombre de la columna de la DB para respetar el DER
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 100]
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
          args: [5, 100]
        },
      },
    },
    password: {
      field: "contraseña",
      type: DataTypes.STRING,
      allowNull: true,  //para que me funcione la aut con google
      validate:{
        notEmpty:true
      }
    },
    sessionStatus: {
      field: "estado_sesion",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:true
    },
    accountStatus: {
      field: "estado_cuenta",
      type: DataTypes.ENUM("activo", "bloqueado"),
      allowNull: false,
      defaultValue:"activo"
    },
    rol:{
    field:'rol',
    type:DataTypes.ENUM("cliente","admin"),
    defaultValue:'cliente',
    allowNull:false
  },
  photo:{
    field:'imagen_perfil',
    type:DataTypes.STRING,
    allowNull:true
  },
  googleId:{
    field:'id_google',
    type: DataTypes.STRING,  
      allowNull: true,
      unique: true  
  },
  phone: {
  field: 'telefono',
  type: DataTypes.STRING,
  allowNull: true,
  validate: { len: [6, 20] }
  },
  street: {
      field: "calle", 
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        notEmpty: false
      }
    },
    streetNumber: {
      field: "numero_casa", 
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        notEmpty: false
      }
    },
    city: {
      field: "localidad", 
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        notEmpty: false
      }
    },
    neighborhood: {
      field: "barrio", 
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        notEmpty: false
      }
    },
    postalCode: {
      field: "codigo_postal", 
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        notEmpty: false,
        len: [4,5] 
      }
    },
    authMethod: {  
      type: DataTypes.ENUM('local', 'google'),
      allowNull: false,
      defaultValue: 'local', 
    },
  },
  { tableName: "clientes", timestamps: true,underscored:true,createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion" }
);

//Hash para crear ó actualizar antes de guardar en la bd
Customer.addHook("beforeCreate",async(customer)=>{
  if(customer.password && customer.authMethod === 'local'){ //que se usuario logueado local
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(customer.password,salt);
  }
})
// actualizar antes de guardar en la bd
Customer.addHook("beforeUpdate", async (customer) => {
  if (customer.changed("password")  && customer.authMethod === 'local') { //solo actualiza si es local
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(customer.password, salt);
  }
});

// para comparar contraseña
Customer.prototype.checkPassword = function(plain){
  return bcrypt.compare(plain,this.password)
}
// Ocultar password en JSON
Customer.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};
export default Customer;

//Por que hashear aca en el modelo? Porque es una regla de datos: garantizás que cualquier creación/actualización (API, script, test) nunca grabe contraseñas planas. Si lo dejás en un middleware de Express, un insert hecho por otro lado podría saltárselo.