const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título del evento es requerido'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    date: {
        type: Date,
        required: [true, 'La fecha del evento es requerida']
    },
    speaker: {
        type: String,
        required: [true, 'El nombre del speaker es requerido']
    },
    speakerBio: {
        type: String
    },
    speakerAvatar: {
        type: String,
        default: 'https://via.placeholder.com/100'
    },
    category: {
        type: String,
        required: [true, 'La categoría es requerida'],
        enum: ['tecnologia', 'negocios', 'marketing', 'diseno', 'programacion', 'otro']
    },
    maxCapacity: {
        type: Number,
        required: [true, 'La capacidad máxima es requerida'],
        min: 1
    },
    registrations: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    meetingLink: {
        type: String
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


eventSchema.virtual('isFull').get(function() {
    return this.registrations >= this.maxCapacity;
});


eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
