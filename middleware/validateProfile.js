export const validateProfileUpdate = (req, res, next) => {
    const { name, email, password } = req.body;

    if (name && (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100)) {
        return res.status(400).json({ message: 'El nombre debe tener entre 3 y 100 caracteres.' });
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido.' });
        }
    }

    if (password && (typeof password !== 'string' || password.length < 8 || password.length > 15)) {
        return res.status(400).json({ message: 'La contraseña debe tener entre 8 y 15 caracteres.' });
    }

    next();
};
