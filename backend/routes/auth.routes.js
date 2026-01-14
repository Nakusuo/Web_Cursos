const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');


const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'tu_clave_secreta',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};




router.post('/register', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('firstName').notEmpty().withMessage('El nombre es requerido'),
    body('lastName').notEmpty().withMessage('El apellido es requerido')
], async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, phone, newsletter } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            newsletter
        });

        await user.save();

        
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});




router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        
        if (!user.isActive) {
            return res.status(401).json({ message: 'Usuario inactivo' });
        }

        
        user.lastLogin = new Date();
        await user.save();

        
        const token = generateToken(user._id);

        res.json({
            message: 'Login exitoso',
            token,
            user: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

module.exports = router;
