const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authMiddleware = require('../middleware/auth.middleware');




router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, level, search, limit, featured } = req.query;
        
        let query = { isActive: true };

        if (category) query.category = category;
        if (level) query.level = level;
        if (featured) query.featured = featured === 'true';
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            query.$text = { $search: search };
        }

        let coursesQuery = Course.find(query);

        if (limit) {
            coursesQuery = coursesQuery.limit(parseInt(limit));
        }

        const courses = await coursesQuery.sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Error al obtener cursos' });
    }
});




router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Error al obtener curso' });
    }
});




router.post('/', authMiddleware, async (req, res) => {
    try {
        
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'No tienes permisos para crear cursos' });
        }

        const course = new Course(req.body);
        await course.save();

        res.status(201).json({
            message: 'Curso creado exitosamente',
            course
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Error al crear curso' });
    }
});




router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'No tienes permisos para actualizar cursos' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        res.json({
            message: 'Curso actualizado exitosamente',
            course
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'Error al actualizar curso' });
    }
});




router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para eliminar cursos' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        res.json({ message: 'Curso eliminado exitosamente' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Error al eliminar curso' });
    }
});

module.exports = router;
