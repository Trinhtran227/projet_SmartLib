const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'BOOK_APPROVED',      // Livre approuvé
            'BOOK_REJECTED',      // Livre refusé
            'LOAN_OVERDUE',       // Prêt en retard
            'LOAN_DUE_SOON',      // Échéance de retour proche
            'PAYMENT_RECEIVED',    // Paiement reçu
            'REVIEW_HIDDEN',      // Avis masqué
            'REVIEW_SHOWN',       // Avis réaffiché
            'LOAN_APPROVED',      // Prêt approuvé
            'LOAN_REJECTED',      // Prêt refusé
            'BOOK_AVAILABLE',     // Livre disponible
            'FINE_ISSUED',        // Nouvelle amende
            'FINE_OVERDUE',       // Amende en retard
            'FINE_PAID',          // Amende payée
            'FINE_WAIVED'         // Amende annulée
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
