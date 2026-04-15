const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const createSampleNotifications = async () => {
    try {
        console.log('🗑️ Clearing existing notifications...');
        await Notification.deleteMany({});

        console.log('📝 Creating sample notifications...');

        // Get some users
        const users = await User.find({ role: 'USER' }).limit(5);
        if (users.length === 0) {
            console.log('❌ No users found. Please run seed.js first.');
            return;
        }

        // Get some books
        const books = await Book.find().limit(3);
        if (books.length === 0) {
            console.log('❌ No books found. Please run seed.js first.');
            return;
        }

        // Get some loans
        const loans = await Loan.find().limit(3);

        // Get some reviews
        const reviews = await Review.find().limit(3);

        const notifications = [];

        // Create different types of notifications for each user
        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            // Loan overdue notification
            notifications.push({
                userId: user._id,
                type: 'LOAN_OVERDUE',
                title: 'Livre en retard',
                message: `Vous avez un livre en retard. Veuillez le retourner rapidement pour éviter une pénalité.`,
                data: {
                    bookId: books[0]?._id,
                    bookTitle: books[0]?.title,
                    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
                },
                priority: 'HIGH',
                isRead: false,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            });

            // Loan due soon notification
            notifications.push({
                userId: user._id,
                type: 'LOAN_DUE_SOON',
                title: 'Échéance de prêt proche',
                message: `Le délai de retour du livre "${books[1]?.title || 'Livre modèle'}" est proche. Veuillez vous préparer à le rendre.`,
                data: {
                    bookId: books[1]?._id,
                    bookTitle: books[1]?.title,
                    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
                },
                priority: 'MEDIUM',
                isRead: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            });

            // Book approved notification
            notifications.push({
                userId: user._id,
                type: 'BOOK_APPROVED',
                title: 'Demande de prêt approuvée',
                message: `La demande de prêt pour le livre "${books[2]?.title || 'Livre modèle'}" a été approuvée. Vous pouvez venir à la bibliothèque pour le récupérer.`,
                data: {
                    bookId: books[2]?._id,
                    bookTitle: books[2]?.title,
                    approvedAt: new Date()
                },
                priority: 'MEDIUM',
                isRead: true,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            });

            // Payment received notification
            notifications.push({
                userId: user._id,
                type: 'PAYMENT_RECEIVED',
                title: 'Paiement réussi',
                message: `Le paiement de la pénalité a été traité avec succès. Merci !`,
                data: {
                    amount: 50000,
                    paymentMethod: 'Virement bancaire',
                    transactionId: 'TXN' + Date.now()
                },
                priority: 'LOW',
                isRead: true,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            });

            // Review hidden notification
            notifications.push({
                userId: user._id,
                type: 'REVIEW_HIDDEN',
                title: 'Avis masqué',
                message: `Votre avis pour le livre "${books[0]?.title || 'Livre modèle'}" a été masqué pour violation du règlement.`,
                data: {
                    bookId: books[0]?._id,
                    bookTitle: books[0]?.title,
                    reason: 'Contenu inapproprié'
                },
                priority: 'MEDIUM',
                isRead: false,
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
            });

            // Book available notification
            notifications.push({
                userId: user._id,
                type: 'BOOK_AVAILABLE',
                title: 'Livre disponible',
                message: `Le livre "${books[1]?.title || 'Livre modèle'}" que vous attendiez est disponible. Vous pouvez venir l'emprunter.`,
                data: {
                    bookId: books[1]?._id,
                    bookTitle: books[1]?.title,
                    availableAt: new Date()
                },
                priority: 'LOW',
                isRead: false,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            });
        }

        // Create notifications
        await Notification.insertMany(notifications);

        console.log(`✅ Created ${notifications.length} sample notifications`);

        // Show statistics
        const totalNotifications = await Notification.countDocuments();
        const unreadCount = await Notification.countDocuments({ isRead: false });
        const byType = await Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📊 Notification Statistics:');
        console.log(`Total notifications: ${totalNotifications}`);
        console.log(`Unread notifications: ${unreadCount}`);
        console.log('\nBy type:');
        byType.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
        });

    } catch (error) {
        console.error('❌ Error creating sample notifications:', error);
    }
};

const main = async () => {
    await connectDB();
    await createSampleNotifications();
    await mongoose.connection.close();
    console.log('✅ Sample notifications created successfully!');
    process.exit(0);
};

main().catch(console.error);
