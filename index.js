import sequelize from "./controllers/connection.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";


const app = express();

const PORT = process.env.PORT || 3000;

// Middleware básico para parsear JSON
app.use(express.json());
app.use(cors()); //Habilita CORS para permitir solicitudes del frontend 
app.use(morgan('dev')); //Muestra logs en consola de cada solicitud HTTP



// Iniciar servidor y probar conexión DB
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Conexión a la Bd establecida✨💪");
        // Sincroniza modelos (más sobre esto en el Paso 3)
        await sequelize.sync({ force: false });
        // await sequelize.sync({ alter: true });  //para sincronizar mis cambios de validacion en los modelos
        console.log("🔄 Modelos sincronizados con la base de datos.");

        // Inicia el servidor Express
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error de conexión ❌", error);
    }
}

startServer();
