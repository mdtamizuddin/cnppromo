const router = require('express').Router();
const authChecker = require('../../util/authChecker');
const roleChecker = require('../../util/roleChecker');
const workService = require('./withdraw.service');

// User creates a Withdraw request
router.post('/', authChecker, async (req, res) => {
    try {
        const data = {
            ...req.body,
            user: req.user._id
        };
        const response = await workService.createWithDraw(data);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Get all withdrawals (Admin/Mod gets all or filtered, regular user gets only their own)
router.get('/', authChecker, async (req, res) => {
    try {
        const query = { ...req.query };
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            query.user = req.user._id.toString();
        }
        const response = await workService.getAllData(query);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Get Single Withdrawal
router.get('/:id', authChecker, async (req, res) => {
    try {
        const response = await workService.getSingle(req.params.id);
        if (!response) {
            return res.status(404).send({ message: "Withdrawal record not found" });
        }
        if (req.user.role !== 'admin' && req.user.role !== 'moderator' && response.user?._id?.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: "Forbidden: Not your record" });
        }
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Update data (Admin only - complete / attach receipt)
router.put('/:id', authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const response = await workService.updateData(req.params.id, req.body);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Reject withdrawal & refund balance (Admin only)
router.put('/reject/:id', authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const response = await workService.rejectWithdraw(req.params.id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Delete data (Admin only)
router.delete('/:id', authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const response = await workService.deleteData(req.params.id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

module.exports = router;