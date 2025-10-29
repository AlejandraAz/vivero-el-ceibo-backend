//para verificar los permisos según el rol, en casos de crear,actualizar y eliminar productos,usuarios o pedidos

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const rol = req.user?.rol;

        if (!rol || !allowedRoles.includes(rol)) {
            return res.status(403).json({ message: "Not authorized." });
        }
        next();
    }
}
export default authorize;