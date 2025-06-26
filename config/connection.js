import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db_name = process.env.DB_NAME;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASSWORD;
const db_host = process.env.HOST;
const db_dialect = process.env.DIALECT || 'mysql';
const db_port = process.env.PORT || 3306;

const sequelize = new Sequelize(db_name,db_user,db_pass,{
    host:db_host,
    dialect:db_dialect,
    port:db_port,
    logging:false //desactiva los logs mysql
});

export default sequelize;