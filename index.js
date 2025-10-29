import sequelize from "./config/connection.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import "./models/index.js";
// import seedAdmin from "./scripts/seedAdmin.js"; //mi archivo para crear el admin
import routes from './routes/index.route.js';
import { errorHandler,notFound } from "./middleware/errorHandler.js";
import cookieParser from 'cookie-parser';
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://mi-dominio.com']
        : ['http://localhost:5173','http://localhost:5174'],
    credentials: true
})); //Habilita CORS para permitir solicitudes del frontend y no filtrar niguna IP
// Middleware básico para parsear JSON
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); //Muestra logs en consola de cada solicitud HTTP
app.use(cookieParser());
app.use('/api',routes);
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Middleware para rutas no encontradas
app.use(notFound);
// Middleware de manejo de errores 
app.use(errorHandler);




// Iniciar servidor y probar conexión DB
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Conexión a la Bd establecida✨💪");
        
        // Inicia el servidor Express
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT} ⭐✨`);
        });
    } catch (error) {
        console.error("Error de conexión ❌", error);
    }
}

startServer();
