const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendContactEmail } = require('../config/email');

// POST /api/contact - Enviar formulario de contacto
router.post('/', [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('message').notEmpty().withMessage('El mensaje es requerido')
], async (req, res) => {
    try {
        // Validar datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, subject, message } = req.body;

        // Enviar correos
        const emailSent = await sendContactEmail({
            name,
            email,
            phone,
            subject,
            message
        });

        if (emailSent) {
            res.json({ 
                success: true, 
                message: 'Tu mensaje ha sido enviado exitosamente. Te contactaremos pronto.' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo.' 
            });
        }
    } catch (error) {
        console.error('Error en endpoint de contacto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor' 
        });
    }
});

module.exports = router;
