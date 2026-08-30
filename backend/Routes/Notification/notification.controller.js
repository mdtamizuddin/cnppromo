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

// Broadcast notification to users (Admin only)
router.post("/broadcast", authChecker, async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "moderator") {
            return res.status(403).send({ message: "Forbidden" });
        }
        const { title, message, category, target } = req.body;
        if (!title || !message) {
            return res.status(400).send({ message: "Title and message are required" });
        }

        const User = require("../User/user.model");
        let query = {};
        if (target === "active") query.status = "active";
        if (target === "non-active") query.status = { $ne: "active" };

        const targetUsers = await User.find(query).select("_id");
        const userIds = targetUsers.map((u) => u._id);

        const result = await service.notifyMany(userIds, {
            title,
            message,
            category: category || "announcement",
        });

        res.send({
            message: `Notification broadcasted to ${result.length} users`,
            count: result.length,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;