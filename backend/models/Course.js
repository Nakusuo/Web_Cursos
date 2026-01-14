const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título del curso es requerido'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/400x250'
    },
    category: {
        type: String,
        required: [true, 'La categoría es requerida'],
        enum: ['programacion', 'diseno', 'negocios', 'marketing', 'data', 'otro']
    },
    level: {
        type: String,
        enum: ['principiante', 'intermedio', 'avanzado'],
        default: 'intermedio'
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: 0
    },
    instructor: {
        type: String,
        required: [true, 'El instructor es requerido']
    },
    instructorAvatar: {
        type: String,
        default: 'https://via.placeholder.com/100'
    },
    duration: {
        type: String,
        default: '10h',
        match: [/^\d+h( \d+min)?$/, 'Formato de duración inválido (ej: "2h 30min")']
    },
    totalMinutes: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    students: {
        count: {
            type: Number,
            default: 0
        },
        active: {
            type: Number,
            default: 0
        }
    },
    learningPoints: [{
        type: String,
        maxlength: 200
    }],
    modules: [{
        title: {
            type: String,
            required: true,
            maxlength: 200
        },
        order: {
            type: Number,
            required: true
        },
        lessons: Number,
        duration: String,
        content: String,
        isPreview: {
            type: Boolean,
            default: false
        }
    }],
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    videoUrl: {
        type: String
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    publishedAt: Date
}, {
    timestamps: true
});


courseSchema.pre('save', function(next) {
    if (this.isModified('duration')) {
        const match = this.duration.match(/(\d+)h(?:\s+(\d+)min)?/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            this.totalMinutes = (hours * 60) + minutes;
        }
    }
    next();
});


courseSchema.index({ category: 1, isActive: 1, featured: -1 });
courseSchema.index({ price: 1, 'rating.average': -1 });
courseSchema.index({ isActive: 1, 'students.count': -1 });
courseSchema.index({ category: 1, level: 1, isActive: 1 });
courseSchema.index({ title: 1 });


courseSchema.index({
    title: 'text',
    description: 'text'
}, {
    weights: {
        title: 10,
        description: 1
    },
    name: 'course_text_search'
});

module.exports = mongoose.model('Course', courseSchema);
