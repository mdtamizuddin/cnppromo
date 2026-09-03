const router = require("express").Router();
const roleChecker = require("../../util/roleChecker");
const service = require("./task.service");
const { TASK_TYPES } = require("./taskTypes");

const send500 = (res, error) => res.status(500).send({ message: error.message });

// ─────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────

router.get("/meta/types", async (req, res) => {
    try {
        res.send(TASK_TYPES);
    } catch (error) { send500(res, error); }
});

// ─────────────────────────────────────────────────────────────────────────
// Worker feed (literal paths first, then /feed/:id)
// ─────────────────────────────────────────────────────────────────────────

router.get("/feed", async (req, res) => {
    try {
        const result = await service.getFeed(req.user._id, req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/feed/:id", async (req, res) => {
    try {
        const result = await service.getFeedTaskById(req.params.id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.post("/feed/:id/watch/start", async (req, res) => {
    try {
        const result = await service.startWatchSession(req.user._id, req.params.id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.post("/feed/:id/watch/ping", async (req, res) => {
    try {
        const result = await service.pingWatchSession(req.user._id, req.params.id, { reset: !!req.body.reset });
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.post("/feed/:id/submit", async (req, res) => {
    try {
        // Duration is NEVER taken from the client — the server's own
        // WatchSession.creditedSeconds is the only trusted figure.
        const result = await service.submitProof(req.user._id, req.params.id, req.body);
        res.status(201).send(result);
    } catch (error) { send500(res, error); }
});

// ─────────────────────────────────────────────────────────────────────────
// Worker's own submissions
// ─────────────────────────────────────────────────────────────────────────

router.get("/my-submissions", async (req, res) => {
    try {
        const result = await service.getMySubmissions(req.user._id, req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.post("/my-submissions/:id/report", async (req, res) => {
    try {
        const result = await service.reportSubmission(req.user._id, req.params.id, req.body.reportReason);
        res.send(result);
    } catch (error) { send500(res, error); }
});

// ─────────────────────────────────────────────────────────────────────────
// Provider — create + own tasks (literal /mine/... paths before /mine/:id)
// ─────────────────────────────────────────────────────────────────────────

router.post("/", async (req, res) => {
    try {
        const task = await service.createTask(req.user._id, req.body);
        res.status(201).send(service.toProviderTaskView(task));
    } catch (error) { send500(res, error); }
});

router.get("/mine/summary", async (req, res) => {
    try {
        const result = await service.getMyTasksSummary(req.user._id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/mine", async (req, res) => {
    try {
        const result = await service.getMyTasks(req.user._id, req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/mine/:id/submissions", async (req, res) => {
    try {
        const result = await service.getMyTaskSubmissions(req.user._id, req.params.id, req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/mine/submissions/:id/approve", async (req, res) => {
    try {
        const result = await service.providerApproveSubmission(req.params.id, req.user._id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/mine/submissions/:id/reject", async (req, res) => {
    try {
        const result = await service.rejectSubmission(req.params.id, req.user._id, req.body.reason);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/mine/:id/cancel", async (req, res) => {
    try {
        const result = await service.cancelTask(req.user._id, req.params.id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/mine/:id", async (req, res) => {
    try {
        const result = await service.getMyTaskById(req.user._id, req.params.id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

// ─────────────────────────────────────────────────────────────────────────
// Admin (every literal segment MUST be registered above /admin/:id — see
// plan §4: this namespace has seven literal segments at the same depth)
// ─────────────────────────────────────────────────────────────────────────

router.get("/admin/all", roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        const result = await service.getAllTasksAdmin(req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/submissions", roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        const result = await service.getAllSubmissionsAdmin(req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/reports", roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        const result = await service.getReportsQueue(req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/admin/reports/:id/resolve", roleChecker(["admin"]), async (req, res) => {
    try {
        const { resolution, fineAmount } = req.body;
        const result = resolution === "DISMISSED"
            ? await service.resolveReportDismiss(req.params.id, req.user._id)
            : await service.resolveReportForceApprove(req.params.id, req.user._id, fineAmount);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/revenue", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.getRevenue();
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/ledger", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.getLedger(req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/reconcile", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.getReconcile();
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/config", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.getConfig();
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/admin/config", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.updateConfig(req.body);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/admin/submissions/:id/approve", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.adminApproveSubmission(req.params.id, req.user._id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/admin/submissions/:id/reject", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.adminRejectSubmission(req.params.id, req.user._id, req.body.reason);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.post("/admin/:id/purge-media", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.purgeTaskMediaNow(req.params.id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/admin/:id/approve", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.approveTaskModeration(req.params.id, req.user._id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.put("/admin/:id/reject", roleChecker(["admin"]), async (req, res) => {
    try {
        const result = await service.rejectTaskModeration(req.params.id, req.user._id, req.body.reason);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/:id/submissions", roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        const result = await service.getTaskSubmissionsAdmin(req.params.id, req.query);
        res.send(result);
    } catch (error) { send500(res, error); }
});

router.get("/admin/:id", roleChecker(["admin", "moderator"]), async (req, res) => {
    try {
        const result = await service.getTaskByIdAdmin(req.params.id);
        res.send(result);
    } catch (error) { send500(res, error); }
});

module.exports = router;
