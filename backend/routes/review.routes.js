const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Course = require('../models/Course');
const authMiddleware = require('../middleware/auth.middleware');
const logger = require('../config/logger');

// Obtener reviews de un curso con paginación
router.get('/course/:courseId', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('rating').optional().isInt({ min: 1, max: 5 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { courseId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const rating = req.query.rating ? parseInt(req.query.rating) : null;
        const skip = (page - 1) * limit;

        // Filtros
        const filter = {
            course: courseId,
            isApproved: true
        };

        if (rating) {
            filter.rating = rating;
        }

        // Obtener reviews con paginación
        const reviews = await Review.find(filter)
            .populate('user', 'firstName lastName')
            .sort({ helpfulCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Review.countDocuments(filter);

        res.json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error obteniendo reviews:', error);
        res.status(500).json({ message: 'Error al obtener reviews' });
    }
});

// Obtener reviews de un usuario
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verificar que el usuario está consultando sus propias reviews o es admin
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const reviews = await Review.find({ user: userId })
            .populate('course', 'title thumbnail')
            .sort({ createdAt: -1 })
            .lean();

        res.json(reviews);
    } catch (error) {
        logger.error('Error obteniendo reviews del usuario:', error);
        res.status(500).json({ message: 'Error al obtener reviews' });
    }
});

// Crear una review
router.post('/', authMiddleware, [
    body('courseId').isMongoId().withMessage('ID de curso inválido'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('El comentario no puede exceder 1000 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { courseId, rating, comment } = req.body;
        const userId = req.user._id;

        // Verificar que el curso existe
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // Verificar que el usuario no haya revisado este curso antes
        const existingReview = await Review.findOne({ course: courseId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'Ya has revisado este curso' });
        }

        // Crear review
        const review = new Review({
            course: courseId,
            user: userId,
            rating,
            comment
        });

        await review.save();
        await review.populate('user', 'firstName lastName');

        logger.info(`Nueva review creada para curso ${courseId} por usuario ${userId}`);

        res.status(201).json({
            message: 'Review creada exitosamente',
            review
        });
    } catch (error) {
        logger.error('Error creando review:', error);
        res.status(500).json({ message: 'Error al crear review' });
    }
});

// Actualizar una review
router.put('/:reviewId', authMiddleware, [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('El comentario no puede exceder 1000 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review no encontrada' });
        }

        // Verificar que el usuario es el dueño de la review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();
        await review.populate('user', 'firstName lastName');

        res.json({
            message: 'Review actualizada exitosamente',
            review
        });
    } catch (error) {
        logger.error('Error actualizando review:', error);
        res.status(500).json({ message: 'Error al actualizar review' });
    }
});

// Eliminar una review
router.delete('/:reviewId', authMiddleware, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review no encontrada' });
        }

        // Verificar que el usuario es el dueño de la review o es admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        await review.remove();

        res.json({ message: 'Review eliminada exitosamente' });
    } catch (error) {
        logger.error('Error eliminando review:', error);
        res.status(500).json({ message: 'Error al eliminar review' });
    }
});

// Marcar review como útil
router.post('/:reviewId/helpful', authMiddleware, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review no encontrada' });
        }

        await review.markAsHelpful(req.user._id);

        res.json({
            message: 'Review marcada',
            helpfulCount: review.helpfulCount,
            isHelpful: review.helpfulBy.includes(req.user._id)
        });
    } catch (error) {
        logger.error('Error marcando review como útil:', error);
        res.status(500).json({ message: 'Error al procesar solicitud' });
    }
});

module.exports = router;
