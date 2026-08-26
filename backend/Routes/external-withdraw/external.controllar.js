const express = require("express");
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");
const externalWithdrawServices = require("./external.service");

const router = express.Router();

// User submits external withdrawal
router.post("/", authChecker, async (req, res) => {
    try {
        const data = {
            ...req.body,
            user: req.user._id
        };
        const response = await externalWithdrawServices.createWithdraw(data);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Admin gets all external withdrawals
router.get("/", authChecker, roleChecker(['admin', 'moderator']), async (req, res) => {
    try {
        const response = await externalWithdrawServices.getAll(req.query?.status);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Single withdrawal
router.get("/:id", authChecker, async (req, res) => {
    try {
        const response = await externalWithdrawServices.getSingle(req.params.id);
        if (!response) {
            return res.status(404).send({ message: "Record not found" });
        }
        if (req.user.role !== 'admin' && req.user.role !== 'moderator' && response.user?._id?.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: "Forbidden" });
        }
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Get user specific withdrawals
router.get("/user/:id", authChecker, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        if (req.user.role !== 'admin' && req.user.role !== 'moderator' && targetUserId !== req.user._id.toString()) {
            return res.status(403).send({ message: "Forbidden" });
        }
        const response = await externalWithdrawServices.getAllByUser(targetUserId, req.query?.status);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Update withdrawal status (Admin only)
router.put("/:id", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const response = await externalWithdrawServices.updateData(req.params.id, req.body);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// Delete withdrawal (Admin only)
router.delete("/:id", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const response = await externalWithdrawServices.deleteData(req.params.id);
        res.send(response);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

module.exports = router;