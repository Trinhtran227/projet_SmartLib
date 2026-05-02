const cron = require('node-cron');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const { notifyLoanOverdue, notifyLoanDueSoon } = require('./notificationHelper');

const ACTIVE_LOAN_STATUSES = ['BORROWED', 'PARTIAL_RETURN'];
const DUE_SOON_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

const hasRecentLoanNotification = async (loan, type, since) => {
    const existingNotification = await Notification.exists({
        userId: loan.readerUserId,
        type,
        'data.loanId': loan._id,
        createdAt: { $gte: since }
    });

    return Boolean(existingNotification);
};

// Send overdue reminders once per due-date cycle
const sendOverdueLoanNotifications = async () => {
    try {
        const today = new Date();

        // Find active loans that are now overdue
        const overdueLoans = await Loan.find({
            status: { $in: ACTIVE_LOAN_STATUSES },
            dueDate: { $lt: today }
        });

        if (overdueLoans.length > 0) {
            for (const loan of overdueLoans) {
                const alreadyNotified = await hasRecentLoanNotification(
                    loan,
                    'LOAN_OVERDUE',
                    new Date(loan.dueDate)
                );

                if (alreadyNotified) {
                    continue;
                }

                await notifyLoanOverdue(loan._id);
            }

            console.log(`🕐 Processed ${overdueLoans.length} overdue loan(s) for reminder notifications`);
        }
    } catch (error) {
        console.error('❌ Error sending overdue loan notifications:', error);
    }
};

// Check for loans due soon (within 2 days) and notify once per due-date cycle
const checkLoansDueSoon = async () => {
    try {
        const today = new Date();
        const twoDaysFromNow = new Date(today.getTime() + DUE_SOON_WINDOW_MS);

        // Find loans that are due within 2 days
        const loansDueSoon = await Loan.find({
            status: { $in: ACTIVE_LOAN_STATUSES },
            dueDate: {
                $gte: today,
                $lte: twoDaysFromNow
            }
        });

        if (loansDueSoon.length > 0) {
            for (const loan of loansDueSoon) {
                const dueSoonWindowStart = new Date(new Date(loan.dueDate).getTime() - DUE_SOON_WINDOW_MS);
                const alreadyNotified = await hasRecentLoanNotification(
                    loan,
                    'LOAN_DUE_SOON',
                    dueSoonWindowStart
                );

                if (alreadyNotified) {
                    continue;
                }

                await notifyLoanDueSoon(loan._id);
            }

            console.log(`⏰ Processed ${loansDueSoon.length} due-soon loan(s) for reminder notifications`);
        }
    } catch (error) {
        console.error('Error checking loans due soon:', error);
    }
};

// Schedule cron job to run daily at 00:05
const startCronJobs = () => {
    // Send overdue reminders every day at 00:05
    cron.schedule('5 0 * * *', () => {
        console.log('🕐 Running daily overdue loan reminder check...');
        sendOverdueLoanNotifications();
    }, {
        scheduled: true,
        timezone: 'Europe/Paris'
    });

    // Check loans due soon every day at 09:00
    cron.schedule('0 9 * * *', () => {
        console.log('Running daily due soon loans check...');
        checkLoansDueSoon();
    }, {
        scheduled: true,
        timezone: 'Europe/Paris'
    });

    console.log('Cron jobs started');
};

module.exports = {
    startCronJobs
};
