const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: [true, 'La calificación es requerida'],
        min: [1, 'La calificación mínima es 1'],
        max: [5, 'La calificación máxima es 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    isReported: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    helpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

reviewSchema.index({ course: 1, user: 1 }, { unique: true });
reviewSchema.index({ course: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

reviewSchema.index({
    comment: 'text'
}, {
    weights: {
        comment: 1
    },
    name: 'review_text_search'
});

reviewSchema.post('save', async function() {
    try {
        const Review = this.constructor;
        const Course = mongoose.model('Course');
        
        // Calcular nuevo rating promedio
        const stats = await Review.aggregate([
            {
                $match: {
                    course: this.course,
                    isApproved: true
                }
            },
            {
                $group: {
                    _id: '$course',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        
        if (stats.length > 0) {
            await Course.findByIdAndUpdate(this.course, {
                'rating.average': Math.round(stats[0].averageRating * 10) / 10,
                'rating.count': stats[0].totalReviews
            });
        }
    } catch (error) {
        console.error('Error actualizando rating del curso:', error);
    }
});

// Middleware para actualizar el rating del curso después de eliminar una review
reviewSchema.post('remove', async function() {
    try {
        const Review = this.constructor;
        const Course = mongoose.model('Course');
        
        const stats = await Review.aggregate([
            {
                $match: {
                    course: this.course,
                    isApproved: true
                }
            },
            {
                $group: {
                    _id: '$course',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        
        if (stats.length > 0) {
            await Course.findByIdAndUpdate(this.course, {
                'rating.average': Math.round(stats[0].averageRating * 10) / 10,
                'rating.count': stats[0].totalReviews
            });
        } else {
            await Course.findByIdAndUpdate(this.course, {
                'rating.average': 0,
                'rating.count': 0
            });
        }
    } catch (error) {
        console.error('Error actualizando rating del curso:', error);
    }
});

reviewSchema.methods.markAsHelpful = async function(userId) {
    if (this.helpfulBy.includes(userId)) {
        // Si ya marcó como útil, removerlo
        this.helpfulBy = this.helpfulBy.filter(id => !id.equals(userId));
        this.helpfulCount = Math.max(0, this.helpfulCount - 1);
    } else {
        // Agregar como útil
        this.helpfulBy.push(userId);
        this.helpfulCount += 1;
    }
    return await this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
