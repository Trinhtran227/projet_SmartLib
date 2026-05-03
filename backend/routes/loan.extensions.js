const express = require('express');
const Loan = require('../models/Loan');
const LoanExtension = require('../models/LoanExtension');
const { authenticate, authorize } = require('../middleware/auth');
const { commonValidations, handleValidationErrors } = require('../middleware/validation');
const router = express.Router();

// POST /api/loans/:id/extend - Request loan extension
router.post('/:id/extend', [
    authenticate,
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { extensionDays, reason } = req.body;

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

        // Check if user already has a pending extension
        const existingExtension = await LoanExtension.findOne({
            loanId: loan._id,
            status: 'PENDING'
        });

        if (existingExtension) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DUPLICATE_EXTENSION_400',
                    message: 'Extension request already pending'
                }
            });
        }

        const newDueDate = new Date(loan.dueDate);
        newDueDate.setDate(newDueDate.getDate() + extensionDays);

        const extension = await LoanExtension.create({
            loanId: loan._id,
            userId: loan.readerUserId,
            requestedBy: req.user.id,
            currentDueDate: loan.dueDate,
            newDueDate,
            extensionDays,
            reason
        });

        res.json({
            success: true,
            data: extension,
            message: 'Extension request submitted successfully'
        });
    } catch (error) {
        console.error('Request extension error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to request extension'
            }
        });
    }
});

// GET /api/loans/extensions - Get extension requests (for admin/librarian)
router.get('/extensions', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    handleValidationErrors
], async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'PENDING' } = req.query;
        const skip = (page - 1) * limit;

        const extensions = await LoanExtension.find({ status })
            .populate('loanId', 'code dueDate status')
            .populate('userId', 'fullName email studentId')
            .populate('requestedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await LoanExtension.countDocuments({ status });

        res.json({
            success: true,
            data: extensions,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get extensions error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to get extension requests'
            }
        });
    }
});

// PUT /api/loans/extensions/:id/approve - Approve extension request
router.put('/extensions/:id/approve', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewNotes } = req.body;

        const extension = await LoanExtension.findById(id);
        if (!extension) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Extension request not found'
                }
            });
        }

        if (extension.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Extension request is not pending'
                }
            });
        }

        // Update loan due date
        await Loan.findByIdAndUpdate(extension.loanId, {
            dueDate: extension.newDueDate
        });

        // Update extension status
        extension.status = 'APPROVED';
        extension.reviewedBy = req.user.id;
        extension.reviewedAt = new Date();
        if (reviewNotes) extension.reviewNotes = reviewNotes;
        await extension.save();

        res.json({
            success: true,
            data: extension,
            message: 'Extension approved successfully'
        });
    } catch (error) {
        console.error('Approve extension error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to approve extension'
            }
        });
    }
});

// PUT /api/loans/extensions/:id/reject - Reject extension request
router.put('/extensions/:id/reject', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewNotes } = req.body;

        const extension = await LoanExtension.findById(id);
        if (!extension) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Extension request not found'
                }
            });
        }

        if (extension.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Extension request is not pending'
                }
            });
        }

        extension.status = 'REJECTED';
        extension.reviewedBy = req.user.id;
        extension.reviewedAt = new Date();
        if (reviewNotes) extension.reviewNotes = reviewNotes;
        await extension.save();

        res.json({
            success: true,
            data: extension,
            message: 'Extension rejected successfully'
        });
    } catch (error) {
        console.error('Reject extension error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to reject extension'
            }
        });
    }
});

module.exports = router;
