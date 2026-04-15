const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Import notification helpers
const {
    notifyLoanApproved,
    notifyLoanRejected,
    notifyLoanOverdue,
    notifyLoanDueSoon,
    notifyBookAvailable,
    notifyReviewHidden,
    notifyReviewShown,
    notifyPaymentReceived,
    notifyBookApproved,
    notifyBookRejected
} = require('../utils/notificationHelper');

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

const testNotificationSystem = async () => {
    try {
        console.log('🧪 Testing notification system...\n');

        // Get test data
        const user = await User.findOne({ role: 'USER' });
        const book = await Book.findOne();
        const loan = await Loan.findOne();
        const review = await Review.findOne();

        if (!user || !book || !loan || !review) {
            console.log('❌ Missing test data. Please run seed scripts first.');
            return;
        }

        console.log('📊 Test Data:');
        console.log(`  User: ${user.fullName} (${user._id})`);
        console.log(`  Book: ${book.title} (${book._id})`);
        console.log(`  Loan: ${loan._id}`);
        console.log(`  Review: ${review._id}\n`);

        // Test 1: Loan approved notification
        console.log('🔔 Test 1: Loan Approved Notification');
        await notifyLoanApproved(loan._id);
        console.log('✅ Loan approved notification created\n');

        // Test 2: Loan rejected notification
        console.log('🔔 Test 2: Loan Rejected Notification');
        await notifyLoanRejected(loan._id, 'Critères non remplis');
        console.log('✅ Loan rejected notification created\n');

        // Test 3: Loan overdue notification
        console.log('🔔 Test 3: Loan Overdue Notification');
        await notifyLoanOverdue(loan._id);
        console.log('✅ Loan overdue notification created\n');

        // Test 4: Loan due soon notification
        console.log('🔔 Test 4: Loan Due Soon Notification');
        await notifyLoanDueSoon(loan._id);
        console.log('✅ Loan due soon notification created\n');

        // Test 5: Book available notification
        console.log('🔔 Test 5: Book Available Notification');
        await notifyBookAvailable(book._id, [user._id]);
        console.log('✅ Book available notification created\n');

        // Test 6: Review hidden notification
        console.log('🔔 Test 6: Review Hidden Notification');
        await notifyReviewHidden(review._id);
        console.log('✅ Review hidden notification created\n');

        // Test 7: Review shown notification
        console.log('🔔 Test 7: Review Shown Notification');
        await notifyReviewShown(review._id);
        console.log('✅ Review shown notification created\n');

        // Test 8: Payment received notification
        console.log('🔔 Test 8: Payment Received Notification');
        await notifyPaymentReceived(user._id, 50000, 'Virement bancaire');
        console.log('✅ Payment received notification created\n');

        // Test 9: Book approved notification
        console.log('🔔 Test 9: Book Approved Notification');
        await notifyBookApproved(book._id);
        console.log('✅ Book approved notification created\n');

        // Test 10: Book rejected notification
        console.log('🔔 Test 10: Book Rejected Notification');
        await notifyBookRejected(book._id, 'Contenu inapproprié');
        console.log('✅ Book rejected notification created\n');

        // Show statistics
        const totalNotifications = await Notification.countDocuments();
        const unreadCount = await Notification.countDocuments({ isRead: false });
        const byType = await Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('📊 Notification Statistics:');
        console.log(`Total notifications: ${totalNotifications}`);
        console.log(`Unread notifications: ${unreadCount}`);
        console.log('\nBy type:');
        byType.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
        });

        console.log('\n✅ All notification tests completed successfully!');

    } catch (error) {
        console.error('❌ Error testing notification system:', error);
    }
};

const main = async () => {
    await connectDB();
    await testNotificationSystem();
    await mongoose.connection.close();
    console.log('✅ Notification system test completed!');
    process.exit(0);
};

main().catch(console.error);
