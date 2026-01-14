const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const EventRegistration = require('../models/EventRegistration');




router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('enrolledCourses.course')
            .populate('registeredEvents');
        
        res.json(user.toPublicProfile());
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
});




router.get('/me/courses', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('enrolledCourses.course');
        
        const courses = user.enrolledCourses.map(enrollment => ({
            ...enrollment.course.toObject(),
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
            completed: enrollment.completed
        }));

        res.json(courses);
    } catch (error) {
        console.error('Get user courses error:', error);
        res.status(500).json({ message: 'Error al obtener cursos' });
    }
});




router.get('/me/events', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('registeredEvents');
        res.json(user.registeredEvents);
    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({ message: 'Error al obtener eventos' });
    }
});




router.get('/me/profile-complete', authMiddleware, async (req, res) => {
    try {
        
        const user = await User.findById(req.user._id)
            .populate('enrolledCourses.course')
            .populate('registeredEvents');
        
        
        const purchases = await Purchase.find({ 
            user: req.user._id 
        })
        .populate('course')
        .sort({ createdAt: -1 });

        
        const eventRegistrations = await EventRegistration.find({ 
            user: req.user._id 
        })
        .populate('event')
        .sort({ registeredAt: -1 });

        
        const now = new Date();
        const pastEvents = eventRegistrations.filter(reg => 
            reg.event && new Date(reg.event.date) < now
        );
        const upcomingEvents = eventRegistrations.filter(reg => 
            reg.event && new Date(reg.event.date) >= now
        );

        res.json({
            user: user.toPublicProfile(),
            purchases: purchases.map(p => ({
                _id: p._id,
                course: p.course,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                paymentMethod: p.paymentMethod,
                paymentDate: p.paymentDate,
                createdAt: p.createdAt
            })),
            events: {
                past: pastEvents.map(reg => ({
                    _id: reg._id,
                    event: reg.event,
                    registeredAt: reg.registeredAt,
                    status: reg.status,
                    attended: reg.attended
                })),
                upcoming: upcomingEvents.map(reg => ({
                    _id: reg._id,
                    event: reg.event,
                    registeredAt: reg.registeredAt,
                    status: reg.status
                }))
            },
            stats: {
                totalPurchases: purchases.filter(p => p.status === 'completed').length,
                totalSpent: purchases
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0),
                totalCourses: user.enrolledCourses.length,
                completedCourses: user.enrolledCourses.filter(c => c.completed).length,
                totalEvents: eventRegistrations.length,
                attendedEvents: pastEvents.filter(e => e.attended).length
            }
        });
    } catch (error) {
        console.error('Get complete profile error:', error);
        res.status(500).json({ message: 'Error al obtener perfil completo' });
    }
});




router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, phone, newsletter } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (newsletter !== undefined) user.newsletter = newsletter;

        await user.save();

        res.json({ 
            message: 'Perfil actualizado exitosamente',
            user: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
});

module.exports = router;
