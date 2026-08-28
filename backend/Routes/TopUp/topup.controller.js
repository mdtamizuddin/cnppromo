const router = require('express').Router();
const authChecker = require('../../util/authChecker');
const roleChecker = require('../../util/roleChecker');
const workService = require('./topup.service');

// User creates a TopUp request
router.post('/', authChecker, async (req, res) => {
    try {
        // Enforce user ID to match logged-in user
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

// Get all topups (Admin/Mod gets all or filtered, regular user gets only their own)
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

// Get Single TopUp
router.get('/:id', authChecker, async (req, res) => {
    try {
        const response = await workService.getSingle(req.params.id);
        if (!response) {
            return res.status(404).send({ message: "Topup record not found" });
        }
        // Verify authorization
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

// Update data (Admin only)
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

// Accept TopUp (Admin only)
router.put('/accept/:id', authChecker, roleChecker(['admin']), async (req, res) => {
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