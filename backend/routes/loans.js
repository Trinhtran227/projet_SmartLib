const express = require('express');
const { body } = require('express-validator');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
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
                        code: 'STOCK_409',
                        message: `Book ${item.bookId} not found`
                    }
                });
            }

            if (book.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_409',
                        message: `Book ${book.title} is not available`
                    }
                });
            }

            if (book.quantityAvailable < item.qty) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_409',
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

        // 2. Prevent double approval
        if (loan.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Loan already processed'
                }
            });
        }

        // 3. Load books
        const bookIds = loan.items.map(i => i.bookId);

        const books = await Book.find({
            _id: { $in: bookIds }
        });

        const bookMap = new Map(
            books.map(b => [b._id.toString(), b])
        );

        // 4. Validate stock BEFORE updating
        for (const item of loan.items) {
            const book = bookMap.get(item.bookId.toString());

            if (!book) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND_404',
                        message: 'Book not found' }
                });
            }

            if (book.quantityAvailable < item.qty) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_STOCK_400',
                        message: `Insufficient stock for book: ${book?.title || 'Unknown'}`
                    }
                });
            }
        }

        // 5. Update stock safely
        for (const item of loan.items) {
            const updated = await Book.findOneAndUpdate(
                {
                    _id: item.bookId,
                    quantityAvailable: { $gte: item.qty } // safety check
                },
                {
                    $inc: { quantityAvailable: -item.qty }
                },
                { new: true }
            );

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'STOCK_CONFLICT',
                        message: 'Stock conflict detected'
                    }
                });
            }
        }

        // 6. Update loan
        loan.status = 'BORROWED';
        loan.loanDate = new Date();
        loan.librarianId = req.user._id;
        if (notes) loan.notes = notes;

        await loan.save();

        // 7. Notification (safe failure isolation)
        try {
            await notifyLoanApproved(loan._id);
        } catch (err) {
            console.warn("Notification failed but loan is valid:", err.message);
        }

        return res.json({
            success: true,
            message: 'Loan approved successfully',
            data: loan
        });

    } catch (error) {
        console.error('Approve loan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: error.message || 'Failed to approve loan'
            }
        });
    }
});

// PUT /api/loans/:id/reject - Reject loan request
router.put('/:id/reject', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

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

        if (loan.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Loan is not in pending status'
                }
            });
        }

        loan.status = 'CANCELLED';
        loan.librarianId = req.user.id;
        if (reason) loan.notes = reason;
        await loan.save();

        // Create notification for user
        await notifyLoanRejected(loan._id, reason);

        res.json({
            success: true,
            data: loan,
            message: 'Loan rejected successfully'
        });
    } catch (error) {
        console.error('Reject loan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to reject loan'
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
        const { returnedItems, condition = 'GOOD' } = req.body;

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

        if (!['BORROWED', 'PARTIAL_RETURN'].includes(loan.status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Loan is not in borrowed status'
                }
            });
        }

        // Update book quantities
        for (const item of returnedItems) {
            const book = await Book.findById(item.bookId);
            if (book) {
                await Book.findByIdAndUpdate(
                    item.bookId,
                    { $inc: { quantityAvailable: item.qty } }
                );
            }
        }

        // Check if all items are returned
        const totalReturned = returnedItems.reduce((sum, item) => sum + item.qty, 0);
        const totalItems = loan.items.reduce((sum, item) => sum + item.qty, 0);

        if (totalReturned >= totalItems) {
            loan.status = 'RETURNED';
        } else {
            loan.status = 'PARTIAL_RETURN';
        }

        await loan.save();

        // Check for fines if overdue
        if (new Date() > loan.dueDate) {
            const policy = await FinePolicy.getCurrent();
            const overdueDays = Math.ceil((new Date() - loan.dueDate) / (1000 * 60 * 60 * 24));
            const fineAmount = overdueDays * policy.lateFeePerDay;

            await Fine.create({
                loanId: loan._id,
                userId: loan.readerUserId,
                type: 'LATE_RETURN',
                amount: fineAmount,
                currency: policy.currency,
                description: `Late return fine for ${overdueDays} days`
            });
        }

        // Check for damage/lost book fines
        const policy = await FinePolicy.getCurrent();
        console.log('Fine policy:', policy);

        for (const item of returnedItems) {
            console.log('Processing item:', item);

            if (item.condition === 'DAMAGED' && item.damageLevel > 0) {
                // Get book price (assuming book has a price field)
                const book = await Book.findById(item.bookId);
                console.log('Book for damage fine:', book);

                if (!book) {
                    console.warn(`Book ${item.bookId} not found for damage fine calculation`);
                    continue;
                }

                if (!book.price || book.price <= 0) {
                    console.warn(`Book ${book.title} has no valid price for damage fine calculation`);
                    continue;
                }

                const damagePercentage = item.damageLevel / 100;
                const fineAmount = Math.round(book.price * policy.damageFeeRate * damagePercentage);
                console.log('Creating damage fine:', fineAmount);

                const fine = await Fine.create({
                    loanId: loan._id,
                    userId: loan.readerUserId,
                    type: 'DAMAGE',
                    amount: fineAmount,
                    currency: policy.currency,
                    description: `Book damage fine: ${item.damageLevel}% damage - ${book.title} (${fineAmount.toLocaleString('fr-FR')} ${policy.currency})`
                });
                console.log('Damage fine created:', fine);

                // Send notification to user
                await notifyFineIssued(fine._id);
            } else if (item.condition === 'LOST') {
                // Get book price for lost book
                const book = await Book.findById(item.bookId);
                console.log('Book for lost fine:', book);

                if (!book) {
                    console.warn(`Book ${item.bookId} not found for lost book fine calculation`);
                    continue;
                }

                if (!book.price || book.price <= 0) {
                    console.warn(`Book ${book.title} has no valid price for lost book fine calculation`);
                    continue;
                }

                const fineAmount = Math.round(book.price * policy.lostBookFeeRate);
                console.log('Creating lost book fine:', fineAmount);

                const fine = await Fine.create({
                    loanId: loan._id,
                    userId: loan.readerUserId,
                    type: 'LOSS',
                    amount: fineAmount,
                    currency: policy.currency,
                    description: `Lost book fine: ${book.title} (${fineAmount.toLocaleString('fr-FR')} ${policy.currency})`
                });
                console.log('Lost book fine created:', fine);

                // Send notification to user
                await notifyFineIssued(fine._id);
            }
        }

        res.json({
            success: true,
            data: loan,
            message: 'Books returned successfully'
        });
    } catch (error) {
        console.error('Return books error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to return books'
            }
        });
    }
});

module.exports = router;
