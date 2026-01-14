const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');




router.post('/', authMiddleware, async (req, res) => {
    try {
        const { courseId, amount, paymentMethod } = req.body;

        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        
        const existingPurchase = await Purchase.findOne({
            user: req.user._id,
            course: courseId,
            status: 'completed'
        });

        if (existingPurchase) {
            return res.status(400).json({ message: 'Ya has comprado este curso' });
        }

        
        const { yapePhone, yapeTransactionCode, paymentProofUrl } = req.body;
        
        
        const purchase = new Purchase({
            user: req.user._id,
            course: courseId,
            amount: amount || course.price,
            paymentMethod: paymentMethod || 'credit_card',
            status: (paymentMethod === 'yape' || paymentMethod === 'plin') ? 'pending' : 'completed',
            paymentDate: new Date(),
            yapePhone,
            yapeTransactionCode,
            paymentProofUrl
        });

        await purchase.save();

        
        const user = await User.findById(req.user._id);
        user.enrolledCourses.push({
            course: courseId,
            enrolledAt: new Date(),
            progress: 0,
            completed: false
        });
        await user.save();

        
        course.students += 1;
        await course.save();

        res.status(201).json({
            message: 'Compra realizada exitosamente',
            purchase,
            course
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
});




router.get('/my-purchases', authMiddleware, async (req, res) => {
    try {
        const purchases = await Purchase.find({ 
            user: req.user._id 
        })
        .populate('course')
        .sort({ createdAt: -1 });

        res.json(purchases);
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ message: 'Error al obtener historial de compras' });
    }
});




router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate('course')
            .populate('user', '-password');

        if (!purchase) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        
        if (purchase.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permiso para ver esta compra' });
        }

        res.json(purchase);
    } catch (error) {
        console.error('Get purchase error:', error);
        res.status(500).json({ message: 'Error al obtener detalles de compra' });
    }
});




router.post('/:id/refund', authMiddleware, async (req, res) => {
    try {
        const { reason } = req.body;

        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        
        if (purchase.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para reembolsar esta compra' });
        }

        if (purchase.status !== 'completed') {
            return res.status(400).json({ message: 'Esta compra no puede ser reembolsada' });
        }

        
        purchase.status = 'refunded';
        purchase.refundDate = new Date();
        purchase.refundReason = reason;
        await purchase.save();

        
        const user = await User.findById(req.user._id);
        user.enrolledCourses = user.enrolledCourses.filter(
            enrollment => enrollment.course.toString() !== purchase.course.toString()
        );
        await user.save();

        res.json({
            message: 'Reembolso procesado exitosamente',
            purchase
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Error al procesar reembolso' });
    }
});

module.exports = router;
