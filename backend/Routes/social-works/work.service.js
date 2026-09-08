const { Work, WorkSubmit } = require("./work.model");
const ProfitLedger = require("./profitLedger.model");
const User = require("../User/user.model");
const Setting = require("../Settings/setting.model");
const {
  notifyUser,
  notifyMany,
} = require("../Notification/notification.service");

/**
 * Standard utility: Fetch active platform commission percentage from Setting
 */
const getCommissionRate = async () => {
  try {
    const setting = await Setting.findOne();
    const percent =
      typeof setting?.taskCommissionPercentage === "number"
        ? setting.taskCommissionPercentage
        : 10;
    return percent / 100;
  } catch {
    return 0.1; // Default 10%
  }
};

/**
 * Provider creates a task and funds it via Escrow
 */
const createWork = async (workData, userId) => {
  try {
    const targetQuantity = parseInt(workData.targetQuantity, 10);
    const costPerUnit = parseFloat(workData.costPerUnit || workData.price);

    if (!costPerUnit || costPerUnit <= 0) {
      throw new Error("Cost per unit must be greater than 0");
    }
    if (!targetQuantity || targetQuantity <= 0) {
      throw new Error("Target quantity must be at least 1");
    }

    const totalBudget = Math.round(targetQuantity * costPerUnit * 100) / 100;

    // Atomically check and deduct escrow from provider's balance
    const provider = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: totalBudget } },
      { $inc: { balance: -totalBudget } },
      { new: true }
    );

    if (!provider) {
      throw new Error(
        `Insufficient balance. You need ৳${totalBudget.toFixed(
          2
        )} to fund this task.`
      );
    }

    const work = new Work({
      ...workData,
      providerId: userId,
      targetQuantity,
      costPerUnit,
      price: costPerUnit, // Backwards compat
      totalBudget,
      escrowRemaining: totalBudget,
      taskUrl: (workData.taskUrl || workData.url || "").trim(),
      url: (workData.taskUrl || workData.url || "").trim(),
      status: "PENDING_APPROVAL",
    });

    await work.save();

    // Notify Admins about pending task for moderation
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      notifyMany(
        admins.map((a) => a._id),
        {
          category: "tasks",
          type: "new_task_pending",
          title: "New Task Awaiting Review",
          message: `${provider.name || provider.username} created task "${
            work.title
          }" (Budget: ৳${totalBudget.toFixed(2)}).`,
          link: "/admin/social-works",
        }
      );
    }

    return work;
  } catch (error) {
    throw new Error("Error creating task: " + error.message);
  }
};

/**
 * Worker & Public Feed: Fetch active tasks with hidden platform commission
 */
const getAllWorks = async (user, options = {}) => {
  try {
    const userRes = await User.findById(user._id || user);
    if (!userRes) throw new Error("User not found");

    const commissionRate = await getCommissionRate();

    // Admin view: return all tasks with pending submit counts
    if (userRes.role === "admin") {
      const filter = {};
      if (options.status && options.status !== "all") {
        filter.status = options.status;
      }
      if (options.platform && options.platform !== "all") {
        filter.platform = options.platform;
      }

      const worksQuery = Work.find(filter)
        .populate("providerId", "name username email avatar")
        .sort({ createdAt: -1 });

      const pendingSubmits = await WorkSubmit.aggregate([
        { $match: { status: { $in: ["PENDING", "pending"] } } },
        { $group: { _id: "$workId", count: { $sum: 1 } } },
      ]);

      if (options.page && options.limit) {
        const page = parseInt(options.page, 10) || 1;
        const limit = parseInt(options.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const [works, total] = await Promise.all([
          worksQuery.skip(skip).limit(limit),
          Work.countDocuments(filter),
        ]);

        const enriched = works.map((w) => {
          const pending = pendingSubmits.find(
            (s) => s._id.toString() === w._id.toString()
          );
          return {
            ...w.toObject(),
            count: pending ? pending.count : 0,
          };
        });

        return {
          data: enriched,
          total,
          page,
          pages: Math.ceil(total / limit),
        };
      }

      const works = await worksQuery;
      return works.map((w) => {
        const pending = pendingSubmits.find(
          (s) => s._id.toString() === w._id.toString()
        );
        return {
          ...w.toObject(),
          count: pending ? pending.count : 0,
        };
      });
    }

    // Worker marketplace feed query — using $and to safely combine filters
    const conditions = [
      { status: { $in: ["ACTIVE", "active"] } },
      { workers: { $nin: [userRes._id] } }, // Pass ObjectId directly, not .toString()
      { $expr: { $lt: ["$completedQuantity", "$targetQuantity"] } },
      {
        $or: [
          { deadline: null },
          { deadline: { $exists: false } },
          { deadline: { $gt: new Date() } },
        ],
      },
    ];

    if (options.platform && options.platform !== "all") {
      conditions.push({ platform: options.platform.toLowerCase() });
    }
    if (options.actionType && options.actionType !== "all") {
      conditions.push({ actionType: options.actionType });
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      conditions.push({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      });
    }

    const filter = { $and: conditions };

    let sortObj = { createdAt: -1 };
    if (options.sortBy === "highest") {
      sortObj = { costPerUnit: -1 };
    } else if (options.sortBy === "lowest") {
      sortObj = { costPerUnit: 1 };
    }

    const query = Work.find(filter).select("-workers").sort(sortObj);

    // Helper to mask provider fees and show net earnings
    const maskReward = (task) => {
      const gross = task.costPerUnit || task.price || 0;
      const netReward = Math.round(gross * (1 - commissionRate) * 100) / 100;
      const obj = task.toObject();
      delete obj.costPerUnit;
      delete obj.totalBudget;
      delete obj.escrowRemaining;
      return {
        ...obj,
        reward: netReward,
        price: netReward, // Backwards compat
      };
    };

    if (options.page && options.limit) {
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 50;
      const skip = (page - 1) * limit;

      const [works, total] = await Promise.all([
        query.skip(skip).limit(limit),
        Work.countDocuments(filter),
      ]);

      return {
        data: works.map(maskReward),
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    }

    const works = await query;
    return works.map(maskReward);
  } catch (error) {
    throw new Error("Error fetching tasks: " + error.message);
  }
};

/**
 * Provider: Fetch tasks created by authenticated user
 */
const getMyCreatedTasks = async (userId, options = {}) => {
  try {
    const filter = { providerId: userId };
    if (options.status && options.status !== "all") {
      filter.status = options.status;
    }

    const works = await Work.find(filter).sort({ createdAt: -1 });

    const pendingSubmits = await WorkSubmit.aggregate([
      {
        $match: {
          providerId: userId,
          status: { $in: ["PENDING", "pending"] },
        },
      },
      { $group: { _id: "$workId", count: { $sum: 1 } } },
    ]);

    return works.map((w) => {
      const pending = pendingSubmits.find(
        (s) => s._id.toString() === w._id.toString()
      );
      return {
        ...w.toObject(),
        pendingSubmissions: pending ? pending.count : 0,
      };
    });
  } catch (error) {
    throw new Error("Error fetching my tasks: " + error.message);
  }
};

/**
 * Provider: Cancel an active or pending task and refund unspent escrow
 */
const cancelWorkByProvider = async (taskId, userId) => {
  try {
    const task = await Work.findOne({ _id: taskId, providerId: userId });
    if (!task) throw new Error("Task not found or unauthorized");

    if (["COMPLETED", "CANCELLED", "REJECTED"].includes(task.status)) {
      throw new Error(`Cannot cancel a task that is already ${task.status}`);
    }

    const refundAmount = Math.max(0, task.escrowRemaining || 0);

    task.status = "CANCELLED";
    task.escrowRemaining = 0;
    await task.save();

    // Refund unspent escrow back to provider's balance
    if (refundAmount > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: refundAmount },
      });
    }

    return {
      message: "Task cancelled successfully",
      refundedAmount: refundAmount,
      task,
    };
  } catch (error) {
    throw new Error("Error cancelling task: " + error.message);
  }
};

/**
 * Get single task details
 */
const getWorkById = async (workId, user) => {
  try {
    const work = await Work.findById(workId).populate(
      "providerId",
      "name username avatar"
    );
    if (!work) throw new Error("Task not found");

    const commissionRate = await getCommissionRate();
    const gross = work.costPerUnit || work.price || 0;
    const netReward = Math.round(gross * (1 - commissionRate) * 100) / 100;

    const isOwnerOrAdmin =
      user &&
      (user.role === "admin" ||
        work.providerId?._id?.toString() === user._id?.toString());

    const obj = work.toObject();
    obj.reward = netReward;

    if (!isOwnerOrAdmin) {
      delete obj.costPerUnit;
      delete obj.totalBudget;
      delete obj.escrowRemaining;
      obj.price = netReward;
    }

    return obj;
  } catch (error) {
    throw new Error("Error fetching task: " + error.message);
  }
};

/**
 * Worker: Submit completed task proof
 */
const createWorkSubmit = async (data, workerId) => {
  try {
    const task = await Work.findById(data.workId);
    if (!task) throw new Error("Task not found");

    if (!["ACTIVE", "active"].includes(task.status)) {
      throw new Error("This task is not currently active");
    }

    // Guard #5: Provider cannot submit to own task
    if (task.providerId.toString() === workerId.toString()) {
      throw new Error("You cannot submit proof for your own task");
    }

    // Guard #7: Check deadline
    if (task.deadline && new Date() > new Date(task.deadline)) {
      throw new Error("This task has passed its deadline");
    }

    // Guard #9: Check retry limit for previously rejected workers
    const previousRejections = await WorkSubmit.countDocuments({
      workId: task._id,
      userId: workerId,
      status: { $in: ["REJECTED", "rejected"] },
    });
    const maxRetries = typeof task.maxRetries === "number" ? task.maxRetries : 1;
    if (previousRejections > maxRetries) {
      throw new Error(
        `You have exceeded the maximum retry limit (${maxRetries + 1} attempts) for this task`
      );
    }

    // Guard #6: Check real capacity (completed + pending = filled slots)
    const pendingCount = await WorkSubmit.countDocuments({
      workId: task._id,
      status: { $in: ["PENDING", "pending"] },
    });
    if (task.completedQuantity + pendingCount >= task.targetQuantity) {
      throw new Error(
        "This task has no available slots right now. Try again later."
      );
    }

    // Guard #1: Atomic duplicate prevention — push worker only if not already present
    const atomicTask = await Work.findOneAndUpdate(
      {
        _id: task._id,
        status: { $in: ["ACTIVE", "active"] },
        workers: { $nin: [workerId] },
      },
      { $push: { workers: workerId } },
      { new: true }
    );

    if (!atomicTask) {
      throw new Error(
        "You have already submitted proof for this task or the task is no longer available"
      );
    }

    const commissionRate = await getCommissionRate();
    const gross = task.costPerUnit || task.price || 0;
    const platformFee = Math.round(gross * commissionRate * 100) / 100;
    const netAmount = Math.round((gross - platformFee) * 100) / 100;

    const proofData = data.proofData || {
      text: data.answers?.join(", ") || data.text || "",
      screenshots:
        data.screenshots || (data.proofImage ? [data.proofImage] : []),
      watchedSeconds: data.duration || 0,
    };

    const workSubmit = new WorkSubmit({
      workId: task._id,
      providerId: task.providerId,
      userId: workerId,
      proofData,
      answers: data.answers || [],
      duration: data.duration || 0,
      grossAmount: gross,
      netAmount,
      platformFee,
      status: "PENDING",
      attemptNumber: previousRejections + 1,
    });

    await workSubmit.save();

    // Notify provider about new submission
    if (task.providerId) {
      notifyUser(task.providerId, {
        category: "tasks",
        type: "task_submitted",
        title: "New Task Submission",
        message: `A worker submitted proof for "${task.title}". Review and approve.`,
        link: `/user/social-works/task/${task._id}/submissions`,
      });
    }

    return workSubmit;
  } catch (error) {
    throw new Error("Error submitting work: " + error.message);
  }
};

/**
 * Provider / Admin: Review worker submission (APPROVE or REJECT)
 */
const providerReviewSubmission = async (
  submitId,
  user,
  { status, rejectionReason }
) => {
  try {
    const submit = await WorkSubmit.findById(submitId).populate("workId");
    if (!submit) throw new Error("Submission not found");

    const isOwner =
      submit.providerId &&
      submit.providerId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to review this submission");
    }

    if (status === "APPROVED" || status === "completed") {
      // Atomic state change: only succeeds if currently pending
      const updatedSubmit = await WorkSubmit.findOneAndUpdate(
        { _id: submitId, status: { $in: ["PENDING", "pending"] } },
        { status: "APPROVED", reviewedAt: new Date() },
        { new: true }
      ).populate("workId");

      if (!updatedSubmit) {
        throw new Error("This submission has already been reviewed");
      }

      // 1. Credit Worker Balance with Net Amount
      if (updatedSubmit.netAmount > 0) {
        await User.findByIdAndUpdate(updatedSubmit.userId, {
          $inc: { balance: updatedSubmit.netAmount },
        });
      }

      // 2. Guard #2: Atomic escrow deduction with floor guard — prevents negative escrow
      const task = await Work.findOneAndUpdate(
        {
          _id: updatedSubmit.workId._id,
          escrowRemaining: { $gte: updatedSubmit.grossAmount },
        },
        {
          $inc: {
            escrowRemaining: -updatedSubmit.grossAmount,
            completedQuantity: 1,
          },
        },
        { new: true }
      );

      if (!task) {
        // Guard #4: Compensating rollback — revert submission and refund worker
        await WorkSubmit.findByIdAndUpdate(submitId, {
          status: "PENDING",
          reviewedAt: null,
        });
        if (updatedSubmit.netAmount > 0) {
          await User.findByIdAndUpdate(updatedSubmit.userId, {
            $inc: { balance: -updatedSubmit.netAmount },
          });
        }
        throw new Error(
          "Insufficient escrow remaining. The task may have already reached its budget limit."
        );
      }

      // 3. Guard #8: Auto-complete task if target reached + auto-reject orphaned PENDING submissions
      if (task.completedQuantity >= task.targetQuantity) {
        task.status = "COMPLETED";
        await task.save();

        // Find and auto-reject any remaining PENDING submissions
        const orphanedSubmits = await WorkSubmit.find({
          workId: task._id,
          status: { $in: ["PENDING", "pending"] },
        });

        if (orphanedSubmits.length > 0) {
          await WorkSubmit.updateMany(
            { workId: task._id, status: { $in: ["PENDING", "pending"] } },
            {
              status: "REJECTED",
              rejectionReason:
                "Task completed — target quantity reached. Submission auto-closed.",
              reviewedAt: new Date(),
            }
          );

          // Re-open worker slots for auto-rejected workers
          const orphanedWorkerIds = orphanedSubmits.map((s) => s.userId);
          await Work.findByIdAndUpdate(task._id, {
            $pull: { workers: { $in: orphanedWorkerIds } },
          });

          // Notify auto-rejected workers
          orphanedSubmits.forEach((s) => {
            notifyUser(s.userId, {
              category: "tasks",
              type: "task_auto_closed",
              title: "Task Completed",
              message: `The task "${task.title}" reached its target. Your pending submission was automatically closed.`,
              link: "/user/social-works/submissions",
            });
          });
        }
      }

      // 4. Record in Platform Profit Ledger
      await ProfitLedger.create({
        taskId: updatedSubmit.workId._id,
        submissionId: updatedSubmit._id,
        providerId: updatedSubmit.providerId,
        workerId: updatedSubmit.userId,
        grossAmount: updatedSubmit.grossAmount,
        netAmount: updatedSubmit.netAmount,
        platformFee: updatedSubmit.platformFee,
      });

      // 5. Notify Worker
      notifyUser(updatedSubmit.userId, {
        category: "tasks",
        type: "task_approved",
        title: "Task Approved! 🎉",
        message: `Your work on "${
          updatedSubmit.workId?.title
        }" was approved! ৳${updatedSubmit.netAmount.toFixed(
          2
        )} has been credited to your balance.`,
        link: "/user/social-works/submissions",
      });

      return updatedSubmit;
    } else if (status === "REJECTED" || status === "rejected") {
      const reason =
        rejectionReason || "Submission did not satisfy task requirements.";
      const updatedSubmit = await WorkSubmit.findOneAndUpdate(
        { _id: submitId, status: { $in: ["PENDING", "pending"] } },
        {
          status: "REJECTED",
          rejectionReason: reason,
          reviewedAt: new Date(),
        },
        { new: true }
      ).populate("workId");

      if (!updatedSubmit) {
        throw new Error("This submission has already been reviewed");
      }

      // Re-open worker slot by pulling worker from task.workers array
      await Work.findByIdAndUpdate(updatedSubmit.workId._id, {
        $pull: { workers: updatedSubmit.userId },
      });

      // Notify Worker
      notifyUser(updatedSubmit.userId, {
        category: "tasks",
        type: "task_rejected",
        title: "Submission Rejected",
        message: `Your submission for "${
          updatedSubmit.workId?.title
        }" was rejected. Reason: ${reason}`,
        link: "/user/social-works/submissions",
      });

      return updatedSubmit;
    } else {
      throw new Error("Invalid review action");
    }
  } catch (error) {
    throw new Error("Error reviewing submission: " + error.message);
  }
};

/**
 * Admin: Moderate Task (APPROVE or REJECT with Instant Escrow Refund)
 */
const adminModerateTask = async (taskId, { action, rejectionReason }) => {
  try {
    const task = await Work.findById(taskId);
    if (!task) throw new Error("Task not found");

    if (action === "APPROVE") {
      task.status = "ACTIVE";
      task.rejectionReason = null;
      await task.save();

      // Notify Provider
      if (task.providerId) {
        notifyUser(task.providerId, {
          category: "tasks",
          type: "task_active",
          title: "Task Approved & Live! 🚀",
          message: `Your task "${task.title}" has been approved by admin and is now active for workers.`,
          link: "/user/social-works/my-tasks",
        });
      }

      // Broadcast to active platform workers
      const activeUsers = await User.find({ status: "active" }).select("_id");
      notifyMany(
        activeUsers.map((u) => u._id),
        {
          category: "tasks",
          type: "new_task",
          title: "New Task Available!",
          message: `New task: "${task.title}". Complete it now to earn rewards!`,
          link: "/user/social-works",
        }
      );

      return task;
    } else if (action === "REJECT") {
      const reason =
        rejectionReason || "Violated platform community guidelines.";

      const updatedTask = await Work.findOneAndUpdate(
        { _id: taskId, status: { $ne: "REJECTED" } },
        { status: "REJECTED", rejectionReason: reason },
        { new: true }
      );

      if (!updatedTask) throw new Error("Task already rejected");

      // 🌟 Instant Escrow Refund to Provider's Balance
      if (updatedTask.providerId && updatedTask.escrowRemaining > 0) {
        await User.findByIdAndUpdate(updatedTask.providerId, {
          $inc: { balance: updatedTask.escrowRemaining },
        });

        notifyUser(updatedTask.providerId, {
          category: "tasks",
          type: "task_rejected_refunded",
          title: "Task Rejected & Escrow Refunded 💸",
          message: `Your task "${
            updatedTask.title
          }" was rejected (${reason}). ৳${updatedTask.escrowRemaining.toFixed(
            2
          )} has been refunded to your balance.`,
          link: "/user/social-works/my-tasks",
        });
      }

      return updatedTask;
    } else {
      throw new Error("Invalid moderation action");
    }
  } catch (error) {
    throw new Error("Error moderating task: " + error.message);
  }
};

/**
 * Get Submissions for a specific task (Task Owner or Admin)
 */
const getTaskSubmissions = async (taskId, user) => {
  try {
    const task = await Work.findById(taskId);
    if (!task) throw new Error("Task not found");

    const isOwner =
      task.providerId &&
      task.providerId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to view submissions for this task");
    }

    const submits = await WorkSubmit.find({ workId: taskId })
      .populate("userId", "name username email avatar")
      .sort({ createdAt: -1 });

    return {
      task,
      submits,
    };
  } catch (error) {
    throw new Error("Error fetching submissions: " + error.message);
  }
};

/**
 * Submissions history (Admin paginated stream or filtered search)
 */
const getAllWorkSubmits = async (status, options = {}, user) => {
  try {
    const filter = {};
    if (status && status !== "all") {
      if (["pending", "completed", "rejected"].includes(status)) {
        filter.status = { $in: [status, status.toUpperCase()] };
      } else {
        filter.status = status;
      }
    }

    const query = WorkSubmit.find(filter)
      .sort({ createdAt: -1 })
      .populate("workId")
      .populate("userId", "name username email avatar")
      .populate("providerId", "name username email avatar");

    if (!options.page) {
      return await query;
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit),
      WorkSubmit.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error("Error fetching submits: " + error.message);
  }
};

/**
 * Worker: Get own submission history
 */
const getWorkSubmitById = async (userId, status) => {
  try {
    const query = { userId };
    if (status && status !== "all") {
      query.status = { $in: [status, status.toUpperCase()] };
    }
    const submits = await WorkSubmit.find(query)
      .populate("workId")
      .sort({ createdAt: -1 });

    return submits;
  } catch (error) {
    throw new Error("Error fetching user submits: " + error.message);
  }
};

/**
 * Admin: Marketplace Analytics & Metrics
 */
const getAdminAnalytics = async () => {
  try {
    const [profitAgg, volumeAgg, escrowAgg, pendingCount, completedCount] =
      await Promise.all([
        ProfitLedger.aggregate([
          { $group: { _id: null, totalProfit: { $sum: "$platformFee" } } },
        ]),
        ProfitLedger.aggregate([
          { $group: { _id: null, totalVolume: { $sum: "$grossAmount" } } },
        ]),
        Work.aggregate([
          {
            $match: {
              status: { $in: ["ACTIVE", "active", "PENDING_APPROVAL"] },
            },
          },
          { $group: { _id: null, totalEscrow: { $sum: "$escrowRemaining" } } },
        ]),
        Work.countDocuments({ status: "PENDING_APPROVAL" }),
        WorkSubmit.countDocuments({
          status: { $in: ["APPROVED", "completed"] },
        }),
      ]);

    return {
      totalPlatformProfit: profitAgg[0]?.totalProfit || 0,
      totalMarketplaceVolume: volumeAgg[0]?.totalVolume || 0,
      activeEscrowHeld: escrowAgg[0]?.totalEscrow || 0,
      pendingModerationCount: pendingCount || 0,
      completedSubmissionsCount: completedCount || 0,
    };
  } catch (error) {
    throw new Error("Error fetching analytics: " + error.message);
  }
};

/**
 * Delete a Task (Admin only with validation)
 */
const deleteWork = async (workId) => {
  try {
    const pendingSubmits = await WorkSubmit.countDocuments({
      workId,
      status: { $in: ["PENDING", "pending"] },
    });
    if (pendingSubmits > 0) {
      throw new Error(
        `Cannot delete task: it has ${pendingSubmits} pending submissions awaiting review.`
      );
    }

    const task = await Work.findById(workId);
    if (!task) throw new Error("Task not found");

    // Refund remaining escrow to provider if task wasn't already completed or refunded
    if (
      task.providerId &&
      task.escrowRemaining > 0 &&
      !["REJECTED", "COMPLETED", "CANCELLED"].includes(task.status)
    ) {
      await User.findByIdAndUpdate(task.providerId, {
        $inc: { balance: task.escrowRemaining },
      });
    }

    await Work.findByIdAndDelete(workId);
    return {
      message:
        "Task deleted and remaining escrow returned if applicable.",
    };
  } catch (error) {
    throw new Error("Error deleting task: " + error.message);
  }
};

/**
 * Worker: File a dispute/appeal on a rejected submission
 */
const fileDispute = async (submitId, workerId, reason) => {
  try {
    if (!reason || reason.trim().length < 10) {
      throw new Error(
        "Please provide a detailed reason for your appeal (at least 10 characters)"
      );
    }

    const submit = await WorkSubmit.findOne({
      _id: submitId,
      userId: workerId,
    }).populate("workId");

    if (!submit) throw new Error("Submission not found or unauthorized");

    if (!["REJECTED", "rejected"].includes(submit.status)) {
      throw new Error("Only rejected submissions can be disputed");
    }

    if (submit.disputed) {
      throw new Error("You have already filed a dispute for this submission");
    }

    if (submit.disputeVerdict) {
      throw new Error("This submission already has a resolved dispute");
    }

    submit.disputed = true;
    submit.disputeReason = reason.trim();
    submit.disputedAt = new Date();
    await submit.save();

    // Notify Admins
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      notifyMany(
        admins.map((a) => a._id),
        {
          category: "tasks",
          type: "dispute_filed",
          title: "⚠️ New Dispute Filed",
          message: `A worker disputed their rejection on task "${
            submit.workId?.title || "Unknown"
          }". Review required.`,
          link: "/admin/social-works",
        }
      );
    }

    return submit;
  } catch (error) {
    throw new Error("Error filing dispute: " + error.message);
  }
};

/**
 * Admin: Get all disputed submissions for review
 */
const getDisputedSubmissions = async () => {
  try {
    const disputes = await WorkSubmit.find({
      disputed: true,
      disputeVerdict: null,
    })
      .populate("workId")
      .populate("userId", "name username email avatar balance")
      .populate("providerId", "name username email avatar balance")
      .sort({ disputedAt: -1 });

    return disputes;
  } catch (error) {
    throw new Error("Error fetching disputes: " + error.message);
  }
};

/**
 * Admin: Resolve a dispute
 * - WORKER_WINS: Force-approve submission + fine provider 2x grossAmount
 * - PROVIDER_WINS: Dismiss appeal + fine worker 2x netAmount
 */
const resolveDispute = async (submitId, adminUser, { verdict, adminNote }) => {
  try {
    if (!["WORKER_WINS", "PROVIDER_WINS"].includes(verdict)) {
      throw new Error("Invalid verdict. Must be WORKER_WINS or PROVIDER_WINS");
    }

    const submit = await WorkSubmit.findById(submitId).populate("workId");
    if (!submit) throw new Error("Submission not found");

    if (!submit.disputed) {
      throw new Error("This submission has no active dispute");
    }

    if (submit.disputeVerdict) {
      throw new Error("This dispute has already been resolved");
    }

    const task = submit.workId;
    if (!task) throw new Error("Associated task not found");

    if (verdict === "WORKER_WINS") {
      // ── Worker was right, submission is valid ──
      // 1. Force-approve the submission
      submit.status = "APPROVED";
      submit.reviewedAt = new Date();

      // 2. Credit worker with netAmount
      if (submit.netAmount > 0) {
        await User.findByIdAndUpdate(submit.userId, {
          $inc: { balance: submit.netAmount },
        });
      }

      // 3. Deduct from task escrow
      await Work.findOneAndUpdate(
        {
          _id: task._id,
          escrowRemaining: { $gte: submit.grossAmount },
        },
        {
          $inc: {
            escrowRemaining: -submit.grossAmount,
            completedQuantity: 1,
          },
        }
      );

      // 4. Record platform profit
      await ProfitLedger.create({
        taskId: task._id,
        submissionId: submit._id,
        providerId: submit.providerId,
        workerId: submit.userId,
        grossAmount: submit.grossAmount,
        netAmount: submit.netAmount,
        platformFee: submit.platformFee,
      });

      // 5. Fine provider 2x grossAmount
      const fineAmount =
        Math.round(submit.grossAmount * 2 * 100) / 100;
      await User.findByIdAndUpdate(submit.providerId, {
        $inc: { balance: -fineAmount },
      });

      // 6. Update dispute metadata
      submit.disputeVerdict = "WORKER_WINS";
      submit.disputeResolvedAt = new Date();
      submit.disputeAdminNote = adminNote || "";
      submit.disputeFine = fineAmount;
      submit.disputeFinedUser = submit.providerId;
      await submit.save();

      // 7. Notify Worker (won)
      notifyUser(submit.userId, {
        category: "tasks",
        type: "dispute_won",
        title: "Dispute Resolved in Your Favor! 🎉",
        message: `Admin reviewed your dispute on "${task.title}" and ruled in your favor. ৳${submit.netAmount.toFixed(
          2
        )} has been credited to your balance.`,
        link: "/user/social-works/submissions",
      });

      // 8. Notify Provider (fined)
      notifyUser(submit.providerId, {
        category: "tasks",
        type: "dispute_lost_fined",
        title: "⚠️ Dispute Lost — Fine Applied",
        message: `Admin ruled that your rejection of a submission on "${task.title}" was invalid. A penalty of ৳${fineAmount.toFixed(
          2
        )} (2× task rate) has been deducted from your balance.`,
        link: "/user/social-works/my-tasks",
      });

      return submit;
    } else {
      // ── PROVIDER_WINS: Worker's appeal was invalid ──
      // 1. Fine worker 2x netAmount
      const fineAmount = Math.round(submit.netAmount * 2 * 100) / 100;
      await User.findByIdAndUpdate(submit.userId, {
        $inc: { balance: -fineAmount },
      });

      // 2. Update dispute metadata
      submit.disputeVerdict = "PROVIDER_WINS";
      submit.disputeResolvedAt = new Date();
      submit.disputeAdminNote = adminNote || "";
      submit.disputeFine = fineAmount;
      submit.disputeFinedUser = submit.userId;
      await submit.save();

      // 3. Notify Worker (lost + fined)
      notifyUser(submit.userId, {
        category: "tasks",
        type: "dispute_lost_fined",
        title: "⚠️ Dispute Dismissed — Fine Applied",
        message: `Admin reviewed your dispute on "${task.title}" and ruled against you. A penalty of ৳${fineAmount.toFixed(
          2
        )} (2× reward) has been deducted from your balance for filing an invalid appeal.`,
        link: "/user/social-works/submissions",
      });

      // 4. Notify Provider (vindicated)
      notifyUser(submit.providerId, {
        category: "tasks",
        type: "dispute_won",
        title: "Dispute Dismissed ✅",
        message: `A worker's dispute on "${task.title}" was reviewed and dismissed by admin. Your rejection was upheld.`,
        link: "/user/social-works/my-tasks",
      });

      return submit;
    }
  } catch (error) {
    throw new Error("Error resolving dispute: " + error.message);
  }
};

module.exports = {
  createWork,
  getAllWorks,
  getMyCreatedTasks,
  cancelWorkByProvider,
  getWorkById,
  createWorkSubmit,
  providerReviewSubmission,
  adminModerateTask,
  getTaskSubmissions,
  getAllWorkSubmits,
  getWorkSubmitById,
  getAdminAnalytics,
  deleteWork,
  fileDispute,
  getDisputedSubmissions,
  resolveDispute,
};
