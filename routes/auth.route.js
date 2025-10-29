import { Router } from 'express';
import { protect,restrictTo } from '../middleware/auth.js';
import { login, logout,refreshAccessToken,googleLogin } from '../controllers/auth.controller.js';
import { registerCustomer } from '../controllers/customer.controller.js';
import validateRegisterInput from "../middleware/validateRegisterInput.js";

const router = Router();

router.post('/login',login)
router.post('/logout',protect,logout)
router.post('/refresh', refreshAccessToken)
router.post('/google',googleLogin)  //recibe el token del front
router.post('/register',validateRegisterInput,registerCustomer);
// Ejemplo d ruta protegida ej en caso de cliente
router.get('/protegida', protect, (req, res) => {
    const { iat, exp, ...userData } = req.user;
    res.json({
        message: "Accediste a una ruta protegida correctamente 🚀",
        user: {
            ...userData,
            iat: new Date(iat * 1000).toLocaleString(), //para que me devuelva el formato de la fecha
            exp: new Date(exp * 1000).toLocaleString()
        } 
    });
})


// Ruta protegida solo para admins
router.get('/admin/solo', protect, restrictTo('admin'), (req, res) => {
    res.json({
        message: "Ruta exclusiva para administradores 👑",
        admin: req.currentUser
    });
});
export default router;