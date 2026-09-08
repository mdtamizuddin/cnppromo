const services = require("./work.service");
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");
const router = require("express").Router();

// ── Provider Actions ──

// Create task with escrow deduction from provider's balance
router.post("/create", authChecker, async (req, res) => {
  try {
    const result = await services.createWork(req.body, req.user._id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/", authChecker, async (req, res) => {
  try {
    const result = await services.createWork(req.body, req.user._id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get tasks created by the logged-in provider
router.get("/my-tasks", authChecker, async (req, res) => {
  try {
    const result = await services.getMyCreatedTasks(req.user._id, {
      status: req.query.status,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Provider cancels an active or pending task, refunding remaining escrow
router.put("/cancel/:taskId", authChecker, async (req, res) => {
  try {
    const result = await services.cancelWorkByProvider(
      req.params.taskId,
      req.user._id
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get submissions for a specific task (Provider of the task or Admin)
router.get("/task/:taskId/submits", authChecker, async (req, res) => {
  try {
    const result = await services.getTaskSubmissions(
      req.params.taskId,
      req.user
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
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
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ── Worker Actions ──

// Get available active tasks with net reward (hidden commission)
router.get("/all", authChecker, async (req, res) => {
  try {
    const result = await services.getAllWorks(req.user, {
      platform: req.query.platform,
      actionType: req.query.actionType,
      search: req.query.search,
      sortBy: req.query.sortBy,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/", authChecker, async (req, res) => {
  try {
    const result = await services.getAllWorks(req.user, {
      platform: req.query.platform,
      actionType: req.query.actionType,
      search: req.query.search,
      sortBy: req.query.sortBy,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Worker submits task proof
router.post("/submit", authChecker, async (req, res) => {
  try {
    const result = await services.createWorkSubmit(req.body, req.user._id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Worker gets their own submission history
router.get("/my-submissions", authChecker, async (req, res) => {
  try {
    const result = await services.getWorkSubmitById(
      req.user._id,
      req.query.status
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Worker files a dispute/appeal on a rejected submission
router.post("/dispute/:submitId", authChecker, async (req, res) => {
  try {
    const result = await services.fileDispute(
      req.params.submitId,
      req.user._id,
      req.body.reason
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/submit/:id", authChecker, async (req, res) => {
  try {
    // Scoping check: non-admins can only see their own
    const targetUserId =
      req.user.role === "admin" ? req.params.id : req.user._id;
    const result = await services.getWorkSubmitById(
      targetUserId,
      req.query.status
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin Actions ──

// Admin moderates task (APPROVE or REJECT with instant refund)
router.put(
  "/admin/moderate/:taskId",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.adminModerateTask(
        req.params.taskId,
        req.body
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Admin analytics (volume, profits, active escrow)
router.get(
  "/admin/analytics",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.getAdminAnalytics();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Admin: Get all open disputes awaiting resolution
router.get(
  "/admin/disputes",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.getDisputedSubmissions();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Admin: Resolve a dispute (WORKER_WINS or PROVIDER_WINS with 2x penalty)
router.put(
  "/admin/resolve-dispute/:submitId",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.resolveDispute(
        req.params.submitId,
        req.user,
        req.body
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Admin: Clean up S3 proof images for a specific task
router.post(
  "/admin/tasks/:taskId/cleanup-s3",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const force = req.body?.force === true;
      const result = await services.cleanupTaskProofImages(
        req.params.taskId,
        { force }
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// Admin: Batch sweep all completed tasks and purge eligible S3 proof images
router.post(
  "/admin/cleanup-s3-batch",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.adminCleanupAllCompletedTasks();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Admin/Moderator lists all submissions across all tasks
router.get(
  "/all-submits",
  authChecker,
  roleChecker(["admin", "moderator"]),
  async (req, res) => {
    try {
      const result = await services.getAllWorkSubmits(
        req.query.status,
        {
          page: req.query.page,
          limit: req.query.limit,
        },
        req.user
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete task (Admin only)
router.delete(
  "/:id",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.deleteWork(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// ── Shared Single Task Route ──
router.get("/:id", authChecker, async (req, res) => {
  try {
    const result = await services.getWorkById(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// Legacy backward-compatibility routes
router.put(
  "/complete/:id",
  authChecker,
  roleChecker(["admin"]),
  async (req, res) => {
    try {
      const result = await services.providerReviewSubmission(
        req.params.id,
        req.user,
        { status: "APPROVED" }
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;