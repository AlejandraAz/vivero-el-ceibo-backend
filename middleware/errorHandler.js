// Middleware para manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
    console.error('Error capturado por middleware:', err);

    
    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(error => ({
            field: error.path,
            message: error.message
        }));
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            details: errors
        });
    }

    // Error de clave única de Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            error: 'Conflicto de datos',
            message: 'Ya existe un registro con estos datos'         
        });
    }

    // Error de clave foránea de Sequelize
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            error: 'Error de referencia',
            message: 'Referencia a datos inexistentes'
        });
    }

    // Error de conexión a la base de datos
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            success: false,
            error: 'Error de conexión',
            message: 'No se pudo conectar a la base de datos'
        });
    }

    // Error por defecto
    res.status(err.status || 500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
    res.status(404).json(
        {
            success: false,
            error: 'Ruta no encontrada',
            message: `La ruta ${req.originalUrl} no existe`
        }
);
};
export {
    errorHandler,
    notFound
};
