import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";
//para vrificar que el usuario cliente y admin este autenticado a la hora  de iniciar sesión,guardo en cookies,no en localstorage

const protect = async (req, res, next) => {
    try {
        let token;

        // Caso 1: viene por header (Bearer)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1]; // toma la segunda parte
        }

        // Caso 2: viene por cookie
        if (!token && req.cookies?.access_token) {
            token = req.cookies.access_token;
        }

        if (!token) {
            return res.status(401).json({ status: 401, message: "Unauthorized. No token provided." });
        }

        // verificar token y firma
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { sub, rol, iat, exp }

        if (decoded.rol === 'cliente') {
            // Cargar usuario y verificar estados
            const customer = await Customer.findByPk(decoded.sub);
            // console.log("✅ Cliente encontrado:", customer?.name, customer?.accountStatus);
            if (!customer || customer.accountStatus !== "activo" || !customer.sessionStatus) {
                return res.status(401).json({ status: 401, message: "Unauthorized. User not found." });
            }
            req.currentUser = customer;
        }
        else if (decoded.rol === 'admin') {
            const admin = await Admin.findByPk(decoded.sub);
            if (!admin) {
                return res.status(401).json({ status: 401, message: 'Unauthorized (admin).' });
            }
            req.currentUser = admin;
        } else {
            return res.status(403).json({ status: 403, message: 'Invalid role.' });
        }
        next();
    } catch {
        return res.status(401).json({ status: 401, message: "Invalid or expired token." });
    }
};

// Middleware adicional para restringir rol
const restrictTo = (role) => {
    return (req, res, next) => {
        // console.log("restrictTo → rol recibido:", req.user?.rol, "rol requerido:", role);
        if (req.user?.rol !== role) {
            return res.status(403).json({ status: 403, message: "Forbidden. Insufficient permissions." });
        }
        next();
    };
};
export { protect, restrictTo };