const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No hay token, autorización denegada' });
        }

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        
        
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Usuario inactivo' });
        }

        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
