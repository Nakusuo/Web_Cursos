const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const authMiddleware = require('../middleware/auth.middleware');




router.put('/:id/verify', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para verificar pagos' });
        }

        const { status } = req.body;

        if (!['completed', 'failed'].includes(status)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        const purchase = await Purchase.findById(req.params.id).populate('course');

        if (!purchase) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        if (purchase.status !== 'pending') {
            return res.status(400).json({ message: 'Esta compra no está pendiente de verificación' });
        }

        purchase.status = status;
        
        if (status === 'completed') {
            purchase.paymentDate = new Date();
            
            
            const User = require('../models/User');
            const user = await User.findById(purchase.user);
            
            const alreadyEnrolled = user.enrolledCourses.some(
                enrollment => enrollment.course.toString() === purchase.course._id.toString()
            );

            if (!alreadyEnrolled) {
                user.enrolledCourses.push({
                    course: purchase.course._id,
                    enrolledAt: new Date(),
                    progress: 0,
                    completed: false
                });
                await user.save();

                
                const Course = require('../models/Course');
                await Course.findByIdAndUpdate(purchase.course._id, {
                    $inc: { students: 1 }
                });
            }
        }

        await purchase.save();

        res.json({
            message: status === 'completed' ? 'Pago verificado exitosamente' : 'Pago rechazado',
            purchase
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Error al verificar pago' });
    }
});




router.get('/pending', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos' });
        }

        const purchases = await Purchase.find({ status: 'pending' })
            .populate('user', 'firstName lastName email')
            .populate('course', 'title price')
            .sort({ createdAt: -1 });

        res.json(purchases);
    } catch (error) {
        console.error('Get pending purchases error:', error);
        res.status(500).json({ message: 'Error al obtener compras pendientes' });
    }
});

module.exports = router;
