const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    firstName: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    phone: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    motivation: {
        type: String
    },
    newsletter: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['registered', 'attended', 'cancelled', 'no-show'],
        default: 'registered'
    },
    attended: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});


eventRegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
