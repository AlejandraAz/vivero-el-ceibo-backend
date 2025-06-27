import sequelize from "./config/connection.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import "./models/index.js";
// import seedAdmin from "./seed/seedAdmin.js"; //mi archivo para crear el admin
import CustomerRoutes from "./routes/CustomerRoute.js";
import CategoryRoutes from "./routes/CategoryRoute.js";
import ProductRoutes from "./routes/ProductRoute.js";
import CartRoutes from "./routes/CartRoute.js";
import CartItemRoutes from "./routes/CartItemRoute.js";
import AdminRoutes from "./routes/AdminRoute.js";
import OrderRoutes from "./routes/OrderRoute.js";
import OrderDetailRoutes from "./routes/OrderDetailRoute.js";
import ShippingRoutes from "./routes/ShippingRoute.js";


const app = express();

const PORT = process.env.PORT || 3000;

// Middleware básico para parsear JSON
app.use(express.json());
app.use(cors()); //Habilita CORS para permitir solicitudes del frontend 
app.use(morgan('dev')); //Muestra logs en consola de cada solicitud HTTP

app.use('/api/customers',CustomerRoutes);
app.use('/api/categories',CategoryRoutes);
app.use('/api/products',ProductRoutes);
app.use('/api/carts',CartRoutes);
app.use('/api/cart-items',CartItemRoutes);
app.use('/api/admin',AdminRoutes);
app.use('/api/orders',OrderRoutes);
app.use('/api/order-details',OrderDetailRoutes);
app.use('/api/shippings',ShippingRoutes);

// Iniciar servidor y probar conexión DB
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Conexión a la Bd establecida✨💪");
        // Sincroniza modelos (más sobre esto en el Paso 3)
        await sequelize.sync({ force: false});
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
