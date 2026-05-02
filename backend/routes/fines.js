const express = require('express');
const Fine = require('../models/Fine');
const { authenticate, authorize } = require('../middleware/auth');
const { commonValidations, handleValidationErrors } = require('../middleware/validation');
const { notifyFinePaid, notifyFineWaived } = require('../utils/notificationHelper');

const router = express.Router();

// GET /api/fines - Get fines
router.get('/', [
    authenticate,
    handleValidationErrors
], async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'PENDING' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.user.role === 'USER') {
            query.userId = req.user.id;
        }
        if (status) {
            query.status = status;
        }

        console.log('Fines query:', query);
        console.log('User role:', req.user.role);

        const fines = await Fine.find(query)
            .populate('userId', 'fullName email')
            .populate('loanId', 'code status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        console.log('Fines with populated data:', JSON.stringify(fines, null, 2));

        const total = await Fine.countDocuments(query);

        res.json({
            success: true,
            data: fines,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get fines error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to get fines'
            }
        });
    }
});

// PUT /api/fines/:id/pay - Pay fine
router.put('/:id/pay', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;

        const fine = await Fine.findById(id);
        if (!fine) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Fine not found'
                }
            });
        }

        if (fine.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Fine is not pending'
                }
            });
        }

        fine.status = 'PAID';
        fine.paidAt = new Date();
        fine.paidBy = req.user.id;
        await fine.save();

        // Send notification to user
        await notifyFinePaid(fine._id);

        res.json({
            success: true,
            data: fine,
            message: 'Fine paid successfully'
        });
    } catch (error) {
        console.error('Pay fine error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to pay fine'
            }
        });
    }
});

// PUT /api/fines/:id/waive - Waive fine
router.put('/:id/waive', [
    authenticate,
    authorize(['ADMIN', 'LIBRARIAN']),
    commonValidations.objectId('id'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const fine = await Fine.findById(id);
        if (!fine) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND_404',
                    message: 'Fine not found'
                }
            });
        }

        if (fine.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_400',
                    message: 'Fine is not pending'
                }
            });
        }

        fine.status = 'WAIVED';
        fine.waivedAt = new Date();
        fine.waivedBy = req.user.id;
        if (reason) fine.waivedReason = reason;
        await fine.save();

        // Send notification to user
        await notifyFineWaived(fine._id, reason);

        res.json({
            success: true,
            data: fine,
            message: 'Fine waived successfully'
        });
    } catch (error) {
        console.error('Waive fine error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_500',
                message: 'Failed to waive fine'
            }
        });
    }
});

module.exports = router;