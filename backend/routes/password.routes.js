const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { forgotPassword, resetPassword } = require('../controllers/password.controller');
const { authLimiter } = require('../middleware/security.middleware');

// Solicitar recuperación de contraseña
router.post('/forgot-password', 
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Email inválido')
    ], 
    forgotPassword
);

// Restablecer contraseña con token
router.post('/reset-password',
    [
        body('token').notEmpty().withMessage('Token requerido'),
        body('password')
            .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener mayúsculas, minúsculas y números')
    ],
    resetPassword
);

module.exports = router;
