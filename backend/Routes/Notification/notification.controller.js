const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const service = require("./notification.service");

// Get the logged-in user's notifications (optional ?category= & ?page= & ?limit=)
router.get("/", authChecker, async (req, res) => {
    try {
        const response = await service.getNotifications(req.user._id, req.query);
        res.send(response);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Mark a single notification as read
router.put("/read/:id", authChecker, async (req, res) => {
    try {
        res.send(await service.markAsRead(req.user._id, req.params.id));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Mark all notifications as read
router.put("/read-all", authChecker, async (req, res) => {
    try {
        res.send(await service.markAllAsRead(req.user._id));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Delete a single notification
router.delete("/:id", authChecker, async (req, res) => {
    try {
        res.send(await service.deleteNotification(req.user._id, req.params.id));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Clear the whole notification list
router.delete("/", authChecker, async (req, res) => {
    try {
        res.send(await service.clearAll(req.user._id));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;