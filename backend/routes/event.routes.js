const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth.middleware');




router.get('/', async (req, res) => {
    try {
        const { category, status } = req.query;
        
        let query = { isActive: true };

        if (category) query.category = category;
        if (status) query.status = status;

        const events = await Event.find(query).sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Error al obtener eventos' });
    }
});




router.get('/upcoming', async (req, res) => {
    try {
        const events = await Event.find({
            isActive: true,
            status: 'upcoming',
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({ message: 'Error al obtener eventos' });
    }
});




router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Error al obtener evento' });
    }
});




router.post('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para crear eventos' });
        }

        const event = new Event(req.body);
        await event.save();

        res.status(201).json({
            message: 'Evento creado exitosamente',
            event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Error al crear evento' });
    }
});




router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para actualizar eventos' });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        res.json({
            message: 'Evento actualizado exitosamente',
            event
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Error al actualizar evento' });
    }
});




router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para eliminar eventos' });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Error al eliminar evento' });
    }
});

module.exports = router;
