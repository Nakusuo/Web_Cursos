const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'El monto es requerido'],
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'yape', 'plin', 'other'],
        default: 'credit_card'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    refundDate: {
        type: Date
    },
    refundReason: {
        type: String
    },
    yapePhone: {
        type: String,
        match: [/^\d{9}$/, 'Formato de teléfono Yape inválido']
    },
    yapeTransactionCode: {
        type: String,
        match: [/^\d{6}$/, 'Código de operación debe tener 6 dígitos']
    },
    paymentProofUrl: {
        type: String
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    completedAt: Date
}, {
    timestamps: true
});


purchaseSchema.index(
    { user: 1, course: 1, status: 1 },
    { 
        unique: true,
        partialFilterExpression: { 
            status: { $in: ['completed', 'pending'] }
        }
    }
);


purchaseSchema.index({ status: 1, createdAt: -1 });
purchaseSchema.index({ paymentMethod: 1, status: 1 });
purchaseSchema.index({ verifiedBy: 1, verifiedAt: -1 }, { sparse: true });
purchaseSchema.index({ yapeTransactionCode: 1 }, { sparse: true });
purchaseSchema.index({ transactionId: 1 }, { unique: true });


purchaseSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
