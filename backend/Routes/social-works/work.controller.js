const services = require('./work.service');
const authChecker = require('../../util/authChecker');
const roleChecker = require('../../util/roleChecker');
const router = require("express").Router();

// ── Provider Actions ──
// Create task with escrow deduction from provider's balance
router.post("/create", authChecker, async (req, res) => {
    try {
        const result = await services.createWork(req.body, req.user._id);
        res.status(201).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Get tasks created by the logged-in provider
router.get("/my-tasks", authChecker, async (req, res) => {
    try {
        const result = await services.getMyCreatedTasks(req.user._id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get submissions for a specific task (Provider of the task or Admin)
router.get("/task/:taskId/submits", authChecker, async (req, res) => {
    try {
        const result = await services.getTaskSubmissions(req.params.taskId, req.user);
        res.status(200).send(result);
    } catch (error) {
        res.status(403).send({ message: error.message });
    }
});

// Provider reviews a worker's submission (APPROVE / REJECT)
router.put("/review/:submitId", authChecker, async (req, res) => {
    try {
        const result = await services.providerReviewSubmission(
            req.params.submitId,
            req.user,
            req.body
        );
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// ── Worker Actions ──
// Get available active tasks with net reward (hidden commission)
router.get("/all", authChecker, async (req, res) => {
    try {
        const result = await services.getAllWorks(req.user);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Worker submits task proof
router.post("/submit", authChecker, async (req, res) => {
    try {
        const result = await services.createWorkSubmit(req.body, req.user._id);
        res.status(201).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Worker gets their own submission history
router.get("/submit/:id", authChecker, async (req, res) => {
    try {
        // Enforce user scoping: regular users can only see their own
        const targetUserId = req.user.role === 'admin' ? req.params.id : req.user._id;
        const result = await services.getWorkSubmitById(targetUserId, req.query.status);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// ── Admin Actions ──
// Admin moderates task (APPROVE or REJECT with instant refund)
router.put("/admin/moderate/:taskId", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const result = await services.adminModerateTask(req.params.taskId, req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Admin analytics (volume, profits, active escrow)
router.get("/admin/analytics", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const result = await services.getAdminAnalytics();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Admin/Moderator lists all submissions across all tasks
router.get("/all-submits", authChecker, roleChecker(['admin', 'moderator']), async (req, res) => {
    try {
        const result = await services.getAllWorkSubmits(req.query.status, {
            page: req.query.page,
            limit: req.query.limit,
        }, req.user);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Delete task (Admin only)
router.delete("/:id", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const result = await services.deleteWork(req.params.id);
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// ── Shared / Details ──
router.get("/:id", authChecker, async (req, res) => {
    try {
        const result = await services.getWorkById(req.params.id, req.user);
        res.status(200).send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Legacy backward-compatibility routes
router.put("/complete/:id", authChecker, roleChecker(['admin']), async (req, res) => {
    try {
        const result = await services.providerReviewSubmission(
            req.params.id,
            req.user,
            { status: "APPROVED" }
        );
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;