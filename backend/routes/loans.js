const express = require('express');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Fine = require('../models/Fine');
const FinePolicy = require('../models/FinePolicy');
const { authenticate, authorize } = require('../middleware/auth');
const { commonValidations, loanValidations, handleValidationErrors } = require('../middleware/validation');
const { notifyLoanApproved, notifyLoanRejected, notifyFineIssued } = require('../utils/notificationHelper');

const router = express.Router();

// GET /api/loans (LIBRARIAN/ADMIN only)
router.get('/', authenticate, authorize('LIBRARIAN', 'ADMIN'), [
    commonValidations.pagination,
    handleValidationErrors
], async (req, res) => {
    try {
        const {
            status,
            readerUserId,
            overdueOnly,
            from,
            to,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        if (status) query.status = status;
        if (readerUserId) query.readerUserId = readerUserId;

        if (overdueOnly === 'true') {
            query.status = { $in: ['BORROWED', 'PARTIAL_RETURN'] };
            query.dueDate = { $lt: new Date() };
        }

        if (from || to) {
            query.loanDate = {};
            if (from) query.loanDate.$gte = new Date(from);
            if (to) query.loanDate.$lte = new Date(to);
        }

        // Get loans with pagination
        const [loans, total] = await Promise.all([
            Loan.find(query)
                .populate('readerUserId', 'fullName email')
                .populate('librarianId', 'fullName email')
                .populate('items.bookId', 'title isbn authors')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Loan.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: loans,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to get loans'
            }
        });
    }
});

// GET /api/loans/overdues (LIBRARIAN/ADMIN only)
router.get('/overdues', authenticate, authorize('LIBRARIAN', 'ADMIN'), [
    commonValidations.pagination,
    handleValidationErrors
], async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Find overdue loans
        const query = {
            status: { $in: ['BORROWED', 'PARTIAL_RETURN'] },
            dueDate: { $lt: new Date() }
        };

        // Get overdue loans with pagination
        const [overdueLoans, total] = await Promise.all([
            Loan.find(query)
                .populate('readerUserId', 'fullName email')
                .populate('librarianId', 'fullName email')
                .populate('items.bookId', 'title isbn authors')
                .sort({ dueDate: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Loan.countDocuments(query)
        ]);

        // Calculate overdue days for each loan
        const overdueLoansWithDays = overdueLoans.map(loan => {
            const today = new Date();
            const dueDate = new Date(loan.dueDate);
            const overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

            return {
                ...loan.toObject(),
                overdueDays
            };
        });

        res.json({
            success: true,
            data: overdueLoansWithDays,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get overdues error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to get overdue loans'
            }
        });
    }
});

// GET /api/loans/:id (LIBRARIAN/ADMIN only)
router.get('/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), [
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;

        const loan = await Loan.findById(id)
            .populate('readerUserId', 'fullName email')
            .populate('librarianId', 'fullName email')
            .populate('items.bookId', 'title isbn authors coverImageUrl');

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Loan not found'
                }
            });
        }

        res.json({
            success: true,
            data: loan
        });
    } catch (error) {
        console.error('Get loan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to get loan'
            }
        });
    }
});

// POST /api/loans/self (USER only - self loan)
router.post('/self', authenticate, authorize('USER'), loanValidations.createForUser, async (req, res) => {
    try {
        const { dueDate, items } = req.body;
        const readerUserId = req.user._id;

        // Validate due date is in the future
        if (new Date(dueDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'STOCK_409',
                    message: 'Due date must be in the future'
                }
            });
        }

        // Check stock availability for all books
        const bookIds = items.map(item => item.bookId);
        const books = await Book.find({ _id: { $in: bookIds } });

        if (books.length !== bookIds.length) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'STOCK_409',
                    message: 'One or more books not found'
                }
            });
        }

        // Check stock and validate quantities
        for (const item of items) {
            const book = books.find(b => b._id.toString() === item.bookId);
            if (!book) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_400',
                        message: `Book ${item.bookId} not found`
                    }
                });
            }

            if (book.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_400',
                        message: `Book ${book.title} is not available`
                    }
                });
            }

            if (book.quantityAvailable < item.qty) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_400',
                        message: `Insufficient stock for book ${book.title}. Available: ${book.quantityAvailable}, Requested: ${item.qty}`
                    }
                });
            }
        }

        // Generate loan code
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const loanCode = `LOAN-${timestamp}-${random}`;

        // Create loan with PENDING status
        const loan = new Loan({
            code: loanCode,
            readerUserId,
            createdByRole: 'USER',
            dueDate: new Date(dueDate),
            items,
            status: 'PENDING',
            notes: 'Demande de prêt en attente'
        });

        await loan.save();

        // Don't update book quantities yet - wait for approval

        // Populate loan data
        await loan.populate([
            { path: 'readerUserId', select: 'fullName email' },
            { path: 'items.bookId', select: 'title isbn authors' }
        ]);

        res.status(201).json({
            success: true,
            data: loan
        });
    } catch (error) {
        console.error('Create self loan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to create loan'
            }
        });
    }
});

// PUT /api/loans/:id/approve - Approve loan request
router.put('/:id/approve', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        console.log('Starting loan approval process for loan:', id);

        // 1. Get loan
        const loan = await Loan.findById(id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Loan not found'
                }
            });
        }

        // 2. Ensure loan is pending
        if (loan.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Loan already processed'
                }
            });
        }

        // 3. Load all books at once
        const bookIds = loan.items.map(i => i.bookId);

        const books = await Book.find({
            _id: { $in: bookIds }
        });

        const bookMap = new Map(
            books.map(b => [b._id.toString(), b])
        );

        // 4. Validate stock availability (in-memory check)
        for (const item of loan.items) {
            const book = bookMap.get(item.bookId.toString());

            if (!book) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'BOOK_NOT_FOUND_400',
                        message: 'One or more books not found'
                    }
                });
            }

            if (book.quantityAvailable < item.qty) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_STOCK_400',
                        message: `Insufficient stock for: ${book.title}`
                    }
                });
            }
        }

        // 5. Deduct stock safely (with rollback buffer)
        const updatedItems = [];

        for (const item of loan.items) {
            const updated = await Book.findOneAndUpdate(
                {
                    _id: item.bookId,
                    quantityAvailable: { $gte: item.qty }
                },
                {
                    $inc: { quantityAvailable: -item.qty }
                },
                { new: true }
            );

            if (!updated) {
                // rollback previous updates
                for (const u of updatedItems) {
                    await Book.findByIdAndUpdate(u.bookId, {
                        $inc: { quantityAvailable: u.qty }
                    });
                }

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_CONFLICT_400',
                        message: 'Stock conflict occurred. Operation rolled back.'
                    }
                });
            }

            updatedItems.push(item);
        }

        // 6. Update loan
        loan.status = 'BORROWED';
        loan.loanDate = new Date();
        loan.librarianId = req.user._id;
        if (notes) loan.notes = notes;

        await loan.save();

        // 7. Notification
        notifyLoanApproved(loan._id)
            .catch(err => {
                console.warn(
                    "Notification failed but loan is valid:",
                    err.message
                );
            });

        // 8. Response
        return res.json({
            success: true,
            message: 'Loan approved successfully',
            data: loan
        });

    } catch (error) {
        console.error('Approve loan error:', error);

        return res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: error.message || 'Failed to approve loan'
            }
        });
    }
});

/// PUT /api/loans/:id/reject - Reject loan request
router.put('/:id/reject', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        console.log('Rejecting loan request:', id);

        // 1. Get loan
        const loan = await Loan.findById(id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Loan not found'
                }
            });
        }

        // 2. Ensure loan is still pending
        if (loan.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Loan is not in pending status'
                }
            });
        }

        // 3. Update loan
        loan.status = 'CANCELLED';
        loan.librarianId = req.user._id;
        if (reason) loan.notes = reason;

        await loan.save();

        // 4. Notification
        notifyLoanRejected(loan._id, reason)
            .catch(err => {
                console.warn(
                    "Notification failed but loan is valid:",
                    err.message
                );
            });

        // 5. Response
        return res.json({
            success: true,
            message: 'Loan rejected successfully',
            data: loan
        });

    } catch (error) {
        console.error('Reject loan error:', error);

        return res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: error.message || 'Failed to reject loan'
            }
        });
    }
});

// PUT /api/loans/:id/return - Return books
router.put('/:id/return', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { returnedItems = [] } = req.body;

        console.log('Processing return for loan:', id);

        // 1. Get loan
        const loan = await Loan.findById(id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Loan not found'
                }
            });
        }

        // 2. Validate status
        if (!['BORROWED', 'PARTIAL_RETURN'].includes(loan.status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Loan is not in a returnable state'
                }
            });
        }

        // 3. Basic validation of input
        if (!Array.isArray(returnedItems) || returnedItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT_400',
                    message: 'Returned items are required'
                }
            });
        }

        // 4. Load fine policy once
        const policy = await FinePolicy.getCurrent();

        // 5. Restore stock (simple + safe per-item update)
        for (const item of returnedItems) {
            if (!item.bookId || !item.qty) continue;

            await Book.findByIdAndUpdate(item.bookId, {
                $inc: { quantityAvailable: item.qty }
            });
        }

        // 6. Compute return status (simple & stable for demo)
        const totalReturned = returnedItems.reduce(
            (sum, item) => sum + (item.qty || 0),
            0
        );

        const totalBorrowed = loan.items.reduce(
            (sum, item) => sum + item.qty,
            0
        );

        loan.status = totalReturned >= totalBorrowed
            ? 'RETURNED'
            : 'PARTIAL_RETURN';

        loan.returnDate = new Date();

        await loan.save();

        // 7. Late return fine (if overdue)
        if (new Date() > loan.dueDate) {
            const overdueDays = Math.ceil(
                (new Date() - loan.dueDate) / (1000 * 60 * 60 * 24)
            );

            const fineAmount = overdueDays * policy.lateFeePerDay;

            await Fine.create({
                loanId: loan._id,
                userId: loan.readerUserId,
                type: 'LATE_RETURN',
                amount: fineAmount,
                currency: policy.currency,
                description: `Late return fine: ${overdueDays} day(s)`
            });
        }

        // 8. Damage / loss fines
        for (const item of returnedItems) {
            const book = await Book.findById(item.bookId);
            if (!book) continue;

            // DAMAGE
            if (item.condition === 'DAMAGED' && item.damageLevel > 0) {
                const fineAmount = Math.round(
                    book.price *
                    policy.damageFeeRate *
                    (item.damageLevel / 100)
                );

                const fine = await Fine.create({
                    loanId: loan._id,
                    userId: loan.readerUserId,
                    type: 'DAMAGE',
                    amount: fineAmount,
                    currency: policy.currency,
                    description: `Damage fine - ${book.title}`
                });

                notifyFineIssued(fine._id).catch(err =>
                    console.warn("Fine notification failed:", err.message)
                );
            }

            // LOST
            if (item.condition === 'LOST') {
                const fineAmount = Math.round(
                    book.price * policy.lostBookFeeRate
                );

                const fine = await Fine.create({
                    loanId: loan._id,
                    userId: loan.readerUserId,
                    type: 'LOSS',
                    amount: fineAmount,
                    currency: policy.currency,
                    description: `Lost book fine - ${book.title}`
                });

                notifyFineIssued(fine._id).catch(err =>
                    console.warn("Fine notification failed:", err.message)
                );
            }
        }

        // 9. Response
        return res.json({
            success: true,
            message: 'Books returned successfully',
            data: loan
        });

    } catch (error) {
        console.error('Return books error:', error);

        return res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR_500',
                message: error.message || 'Failed to process return'
            }
        });
    }
});

module.exports = router;
