const Notification = require('../models/Notification');
const User = require('../models/User');
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const Review = require('../models/Review');

/**
 * Create notification for a user
 */
const createNotification = async (userId, type, title, message, data = {}, priority = 'MEDIUM', expiresAt = null) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            data,
            priority,
            expiresAt
        });

        await notification.save();
        console.log(`✅ Created notification for user ${userId}: ${type}`);
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        return null;
    }
};

/**
 * Create notification for multiple users
 */
const createBulkNotifications = async (userIds, type, title, message, data = {}, priority = 'MEDIUM', expiresAt = null) => {
    try {
        const notifications = userIds.map(userId => ({
            userId,
            type,
            title,
            message,
            data,
            priority,
            expiresAt
        }));

        await Notification.insertMany(notifications);
        console.log(`✅ Created ${notifications.length} notifications for type: ${type}`);
        return notifications;
    } catch (error) {
        console.error('❌ Error creating bulk notifications:', error);
        return null;
    }
};

/**
 * Notification triggers for different events
 */

// Loan-related notifications
const notifyLoanApproved = async (loanId) => {
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return;

        // Get book details separately
        const book = await Book.findById(loan.items[0]?.bookId);
        const bookTitle = book ? book.title : 'Livre';

        await createNotification(
            loan.readerUserId,
            'LOAN_APPROVED',
            'Demande de prêt approuvée',
            `La demande de prêt pour le livre "${bookTitle}" a été approuvée. Vous pouvez venir à la bibliothèque le récupérer.`,
            {
                loanId: loan._id,
                bookId: loan.items[0]?.bookId,
                bookTitle: bookTitle,
                approvedAt: new Date()
            },
            'MEDIUM'
        );
    } catch (error) {
        console.error('Error creating loan approved notification:', error);
    }
};

const notifyLoanRejected = async (loanId, reason = 'Non éligible') => {
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return;

        // Get book details separately
        const book = await Book.findById(loan.items[0]?.bookId);
        const bookTitle = book ? book.title : 'Livre';

        await createNotification(
            loan.readerUserId,
            'LOAN_REJECTED',
            'Demande de prêt refusée',
            `La demande de prêt pour le livre "${bookTitle}" a été refusée. Raison : ${reason}`,
            {
                loanId: loan._id,
                bookId: loan.items[0]?.bookId,
                bookTitle: bookTitle,
                reason,
                rejectedAt: new Date()
            },
            'MEDIUM'
        );
    } catch (error) {
        console.error('Error creating loan rejected notification:', error);
    }
};

const notifyLoanOverdue = async (loanId) => {
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return;

        // Get book details separately
        const book = await Book.findById(loan.items[0]?.bookId);
        const bookTitle = book ? book.title : 'Livre';

        await createNotification(
            loan.readerUserId,
            'LOAN_OVERDUE',
            'Livre en retard',
            `Le livre "${bookTitle}" est en retard. Veuillez le retourner rapidement pour éviter une pénalité.`,
            {
                loanId: loan._id,
                bookId: loan.items[0]?.bookId,
                bookTitle: bookTitle,
                dueDate: loan.dueDate,
                overdueDays: Math.ceil((new Date() - loan.dueDate) / (1000 * 60 * 60 * 24))
            },
            'HIGH'
        );
    } catch (error) {
        console.error('Error creating loan overdue notification:', error);
    }
};

const notifyLoanDueSoon = async (loanId) => {
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return;

        // Get book details separately
        const book = await Book.findById(loan.items[0]?.bookId);
        const bookTitle = book ? book.title : 'Livre';

        await createNotification(
            loan.readerUserId,
            'LOAN_DUE_SOON',
            'Échéance proche',
            `Le délai de retour du livre "${bookTitle}" est proche. Veuillez vous préparer à le rendre.`,
            {
                loanId: loan._id,
                bookId: loan.items[0]?.bookId,
                bookTitle: bookTitle,
                dueDate: loan.dueDate,
                daysRemaining: Math.ceil((loan.dueDate - new Date()) / (1000 * 60 * 60 * 24))
            },
            'MEDIUM'
        );
    } catch (error) {
        console.error('Error creating loan due soon notification:', error);
    }
};

// Book-related notifications
const notifyBookAvailable = async (bookId, userIds = []) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) return;

        // If specific users provided, notify them
        if (userIds.length > 0) {
            await createBulkNotifications(
                userIds,
                'BOOK_AVAILABLE',
                'Livre disponible',
                `Le livre "${book.title}" que vous attendiez est disponible. Vous pouvez venir l'emprunter.`,
                {
                    bookId: book._id,
                    bookTitle: book.title,
                    availableAt: new Date()
                },
                'LOW'
            );
        } else {
            // Notify all users who have this book in their favorites
            const favoriteUsers = await User.find({
                favorites: bookId,
                role: 'USER'
            }).select('_id');

            if (favoriteUsers.length > 0) {
                const userIds = favoriteUsers.map(user => user._id);
                await createBulkNotifications(
                    userIds,
                    'BOOK_AVAILABLE',
                    'Livre disponible',
                    `Le livre "${book.title}" de votre liste de souhaits est de nouveau disponible. Vous pouvez venir l'emprunter.`,
                    {
                        bookId: book._id,
                        bookTitle: book.title,
                        availableAt: new Date()
                    },
                    'LOW'
                );
            }
        }
    } catch (error) {
        console.error('Error creating book available notification:', error);
    }
};

// Review-related notifications
const notifyReviewHidden = async (reviewId) => {
    try {
        const review = await Review.findById(reviewId).populate('userId bookId');
        if (!review) return;

        await createNotification(
            review.userId._id,
            'REVIEW_HIDDEN',
            'Avis masqué',
            `Votre avis pour le livre "${review.bookId.title}" a été masqué pour violation du règlement.`,
            {
                reviewId: review._id,
                bookId: review.bookId._id,
                bookTitle: review.bookId.title,
                reason: 'Contenu inapproprié',
                hiddenAt: new Date()
            },
            'MEDIUM'
        );
    } catch (error) {
        console.error('Error creating review hidden notification:', error);
    }
};

const notifyReviewShown = async (reviewId) => {
    try {
        const review = await Review.findById(reviewId).populate('userId bookId');
        if (!review) return;

        await createNotification(
            review.userId._id,
            'REVIEW_SHOWN',
            'Avis réaffiché',
            `Votre avis pour le livre "${review.bookId.title}" a été réaffiché.`,
            {
                reviewId: review._id,
                bookId: review.bookId._id,
                bookTitle: review.bookId.title,
                shownAt: new Date()
            },
            'LOW'
        );
    } catch (error) {
        console.error('Error creating review shown notification:', error);
    }
};

// Payment-related notifications
const notifyPaymentReceived = async (userId, amount, paymentMethod = 'Virement bancaire') => {
    try {
        await createNotification(
            userId,
            'PAYMENT_RECEIVED',
            'Paiement réussi',
            `Le paiement de la pénalité de ${amount.toLocaleString('vi-VN')} VNĐ a été traité avec succès. Merci !`,
            {
                amount,
                paymentMethod,
                transactionId: 'TXN' + Date.now(),
                receivedAt: new Date()
            },
            'LOW'
        );
    } catch (error) {
        console.error('Error creating payment received notification:', error);
    }
};

// Book approval/rejection notifications
const notifyBookApproved = async (bookId) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) return;

        // Notify all users who have this book in their favorites
        const favoriteUsers = await User.find({
            favorites: bookId,
            role: 'USER'
        }).select('_id');

        if (favoriteUsers.length > 0) {
            const userIds = favoriteUsers.map(user => user._id);
            await createBulkNotifications(
                userIds,
                'BOOK_APPROVED',
                'Nouveau livre approuvé',
                `Le livre "${book.title}" a été approuvé et est disponible à l'emprunt.`,
                {
                    bookId: book._id,
                    bookTitle: book.title,
                    approvedAt: new Date()
                },
                'MEDIUM'
            );
        }
    } catch (error) {
        console.error('Error creating book approved notification:', error);
    }
};

// New book added notification
const notifyNewBookAdded = async (bookId) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) return;

        // Get all users to notify about new book
        const allUsers = await User.find({
            role: 'USER'
        }).select('_id');

        if (allUsers.length > 0) {
            const userIds = allUsers.map(user => user._id);
            await createBulkNotifications(
                userIds,
                'BOOK_AVAILABLE',
                'Nouveau livre ajouté',
                `Le nouveau livre "${book.title}" a été ajouté à la bibliothèque. Découvrez-le dès maintenant !`,
                {
                    bookId: book._id,
                    bookTitle: book.title,
                    author: book.author,
                    category: book.category,
                    addedAt: new Date()
                },
                'LOW'
            );
        }
    } catch (error) {
        console.error('Error creating new book notification:', error);
    }
};

const notifyBookRejected = async (bookId, reason = 'Critères non remplis') => {
    try {
        const book = await Book.findById(bookId);
        if (!book) return;

        // Notify all users who have this book in their favorites
        const favoriteUsers = await User.find({
            favorites: bookId,
            role: 'USER'
        }).select('_id');

        if (favoriteUsers.length > 0) {
            const userIds = favoriteUsers.map(user => user._id);
            await createBulkNotifications(
                userIds,
                'BOOK_REJECTED',
                'Livre rejeté',
                `Le livre "${book.title}" a été rejeté. Raison : ${reason}`,
                {
                    bookId: book._id,
                    bookTitle: book.title,
                    reason,
                    rejectedAt: new Date()
                },
                'MEDIUM'
            );
        }
    } catch (error) {
        console.error('Error creating book rejected notification:', error);
    }
};

// Fine-related notifications
const notifyFineIssued = async (fineId) => {
    try {
        const Fine = require('../models/Fine');
        const fine = await Fine.findById(fineId).populate('userId loanId');
        if (!fine) return;

        const fineTypeLabels = {
            'LATE_RETURN': 'Retour tardif',
            'DAMAGE': 'Livre endommagé',
            'LOSS': 'Livre perdu'
        };

        await createNotification(
            fine.userId._id,
            'FINE_ISSUED',
            'Nouvelle pénalité',
            `Vous avez une nouvelle pénalité : ${fineTypeLabels[fine.type] || fine.type} - ${fine.amount.toLocaleString('vi-VN')} ${fine.currency}`,
            {
                fineId: fine._id,
                loanId: fine.loanId?._id,
                type: fine.type,
                amount: fine.amount,
                currency: fine.currency,
                description: fine.description
            },
            'HIGH'
        );
    } catch (error) {
        console.error('Error creating fine issued notification:', error);
    }
};

const notifyFinePaid = async (fineId) => {
    try {
        const Fine = require('../models/Fine');
        const fine = await Fine.findById(fineId).populate('userId');
        if (!fine) return;

        await createNotification(
            fine.userId._id,
            'FINE_PAID',
            'Pénalité payée',
            `La pénalité de ${fine.amount.toLocaleString('vi-VN')} ${fine.currency} a été payée avec succès.`,
            {
                fineId: fine._id,
                amount: fine.amount,
                currency: fine.currency,
                paidAt: new Date()
            },
            'MEDIUM'
        );
    } catch (error) {
        console.error('Error creating fine paid notification:', error);
    }
};

const notifyFineWaived = async (fineId, reason = 'Pénalité annulée') => {
    try {
        const Fine = require('../models/Fine');
        const fine = await Fine.findById(fineId).populate('userId');
        if (!fine) return;

        await createNotification(
            fine.userId._id,
            'FINE_WAIVED',
            'Pénalité annulée',
            `La pénalité de ${fine.amount.toLocaleString('vi-VN')} ${fine.currency} a été annulée. Raison : ${reason}`,
            {
                fineId: fine._id,
                amount: fine.amount,
                currency: fine.currency,
                reason: reason,
                waivedAt: new Date()
            },
            'MEDIUM'
        );
    } catch (error) {
        console.error('Error creating fine waived notification:', error);
    }
};

const notifyFineOverdue = async (fineId) => {
    try {
        const Fine = require('../models/Fine');
        const fine = await Fine.findById(fineId).populate('userId');
        if (!fine) return;

        await createNotification(
            fine.userId._id,
            'FINE_OVERDUE',
            'Pénalité en retard de paiement',
            `Le paiement de la pénalité de ${fine.amount.toLocaleString('vi-VN')} ${fine.currency} est en retard. Veuillez payer rapidement.`,
            {
                fineId: fine._id,
                amount: fine.amount,
                currency: fine.currency,
                overdueAt: new Date()
            },
            'URGENT'
        );
    } catch (error) {
        console.error('Error creating fine overdue notification:', error);
    }
};

module.exports = {
    createNotification,
    createBulkNotifications,
    notifyLoanApproved,
    notifyLoanRejected,
    notifyLoanOverdue,
    notifyLoanDueSoon,
    notifyBookAvailable,
    notifyReviewHidden,
    notifyReviewShown,
    notifyPaymentReceived,
    notifyBookApproved,
    notifyBookRejected,
    notifyNewBookAdded,
    notifyFineIssued,
    notifyFinePaid,
    notifyFineWaived,
    notifyFineOverdue
};
