const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');




router.post('/', async (req, res) => {
    try {
        const { eventId, firstName, lastName, email, phone, company, role, motivation, newsletter } = req.body;

        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        
        if (event.registrations >= event.maxCapacity) {
            return res.status(400).json({ message: 'El evento ha alcanzado su capacidad máxima' });
        }

        
        const existingRegistration = await EventRegistration.findOne({ 
            event: eventId, 
            email 
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'Ya estás registrado en este evento' });
        }

        
        const registration = new EventRegistration({
            event: eventId,
            firstName,
            lastName,
            email,
            phone,
            company,
            role,
            motivation,
            newsletter
        });

        await registration.save();

        
        event.registrations += 1;
        await event.save();

        
        

        res.status(201).json({
            message: 'Registro exitoso. Te hemos enviado un email de confirmación.',
            registration
        });
    } catch (error) {
        console.error('Event registration error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Ya estás registrado en este evento' });
        }
        
        res.status(500).json({ message: 'Error al registrar en el evento' });
    }
});




router.get('/event/:eventId', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para ver registros' });
        }

        const registrations = await EventRegistration.find({ 
            event: req.params.eventId 
        }).populate('event');

        res.json(registrations);
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({ message: 'Error al obtener registros' });
    }
});




router.get('/my-registrations', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email es requerido' });
        }

        const registrations = await EventRegistration.find({ email }).populate('event');

        res.json(registrations);
    } catch (error) {
        console.error('Get my registrations error:', error);
        res.status(500).json({ message: 'Error al obtener registros' });
    }
});




router.delete('/:id', async (req, res) => {
    try {
        const registration = await EventRegistration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        
        registration.status = 'cancelled';
        await registration.save();

        
        const event = await Event.findById(registration.event);
        if (event) {
            event.registrations = Math.max(0, event.registrations - 1);
            await event.save();
        }

        res.json({ message: 'Registro cancelado exitosamente' });
    } catch (error) {
        console.error('Cancel registration error:', error);
        res.status(500).json({ message: 'Error al cancelar registro' });
    }
});

module.exports = router;
