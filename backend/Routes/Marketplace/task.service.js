const mongoose = require("mongoose");
const { MarketTask, TaskSubmission } = require("./task.model");
const WatchSession = require("./watch.model");
const PlatformLedger = require("./ledger.model");
const { getTaskType, normalizeTypeConfig } = require("./taskTypes");
const { round2 } = require("./money");
const User = require("../User/user.model");
const { getOrCreateSetting } = require("../Settings/settingStore");
const updateSettingFn = require("../Settings/updateSetting");
const { notifyUser, notifyMany } = require("../Notification/notification.service");
const { deleteObjectsByUrl } = require("../../util/s3");

const S3_URL_PREFIX = `https://${process.env.AWS_BUCKET_NAME || "cnppromo-files"}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/`;

// ─────────────────────────────────────────────────────────────────────────
// Whitelist serialisers — the hidden-fee contract. A field must be opted IN
// to each audience here; it cannot leak by adding a field to the schema.
// ─────────────────────────────────────────────────────────────────────────

const toWorkerTaskView = (t) => ({
    _id: t._id,
    title: t.title,
    description: t.description,
    taskType: t.taskType,
    platform: t.platform,
    typeConfig: t.typeConfig,
    targetUrl: t.targetUrl,
    proofInstructions: t.proofInstructions,
    accountLabel: t.accountLabel,
    requiresScreenshot: t.requiresScreenshot,
    requiresProofUrl: t.requiresProofUrl,
    proofQuestions: t.proofQuestions,
    reward: t.netPerUnit, // named "reward", never "netPerUnit" — no hint of a split
    slotsRemaining: t.slotsRemaining,
    createdAt: t.createdAt,
});

const toProviderTaskView = (t) => ({
    _id: t._id,
    title: t.title,
    description: t.description,
    taskType: t.taskType,
    platform: t.platform,
    typeConfig: t.typeConfig,
    targetUrl: t.targetUrl,
    proofInstructions: t.proofInstructions,
    accountLabel: t.accountLabel,
    requiresScreenshot: t.requiresScreenshot,
    requiresProofUrl: t.requiresProofUrl,
    proofQuestions: t.proofQuestions,
    targetQuantity: t.targetQuantity,
    costPerUnit: t.costPerUnit,
    totalBudget: t.totalBudget,
    escrowHeld: t.escrowHeld,
    escrowReleased: t.escrowReleased,
    pendingCount: t.pendingCount,
    approvedCount: t.approvedCount,
    slotsRemaining: t.slotsRemaining,
    status: t.status,
    rejectionReason: t.rejectionReason,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
});

const toWorkerSubmissionView = (s) => ({
    _id: s._id,
    task: s.task,
    status: s.status,
    amount: s.netAmount,
    creditedSeconds: s.creditedSeconds,
    proof: s.proof,
    attempt: s.attempt,
    rejectionReason: s.rejectionReason,
    reportReason: s.reportReason,
    reportResolution: s.reportResolution,
    autoApproveAt: s.autoApproveAt,
    createdAt: s.createdAt,
    reviewedAt: s.reviewedAt,
});

const toProviderSubmissionView = (s) => ({
    _id: s._id,
    task: s.task,
    worker: s.worker,
    status: s.status,
    amount: s.grossAmount,
    creditedSeconds: s.creditedSeconds,
    proof: s.proof,
    attempt: s.attempt,
    attempts: s.attempts,
    rejectionReason: s.rejectionReason,
    autoApproveAt: s.autoApproveAt,
    createdAt: s.createdAt,
    reviewedAt: s.reviewedAt,
});

// ─────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────

const assertMarketplaceEnabled = async (setting) => {
    if (setting.marketplace?.enabled === false) {
        throw new Error("The task marketplace is currently disabled");
    }
};

const validateProofUrl = (url) => {
    if (!url) return;
    if (!url.startsWith(S3_URL_PREFIX)) {
        throw new Error("Screenshots must be uploaded through this app");
    }
};

// Every screenshot must live under this app's own S3 bucket — otherwise a
// worker could pass an arbitrary off-site or hotlinked URL as "proof".
const buildProofSnapshot = (task, typeDef, body) => {
    const proofSpec = typeDef.proof;
    const account = String(body.account || "").trim();
    if (proofSpec.account === "required" && !account) {
        throw new Error(`"${task.accountLabel || "Account"}" is required for this task`);
    }

    const screenshots = (Array.isArray(body.screenshots) ? body.screenshots : [])
        .map(String).map((s) => s.trim()).filter(Boolean).slice(0, 3);
    screenshots.forEach(validateProofUrl);
    if (task.requiresScreenshot && screenshots.length === 0) {
        throw new Error("At least one screenshot is required");
    }

    const url = String(body.url || "").trim();
    if (task.requiresProofUrl && !url) {
        throw new Error("A proof URL is required for this task");
    }

    const questions = task.proofQuestions || [];
    const rawAnswers = Array.isArray(body.answers) ? body.answers : [];
    const answers = questions.map((q, i) => {
        const found = rawAnswers.find((a) => a && a.question === q) || rawAnswers[i];
        const answer = String(found?.answer || "").trim();
        if (!answer) throw new Error(`Please answer: "${q}"`);
        return { question: q, answer };
    });

    const proof = {
        account,
        url,
        note: String(body.note || "").trim(),
        screenshots,
        answers,
    };
    if (account) {
        // Normalised for the dedupe index — "MyChannel" and " mychannel "
        // must collide.
        proof.accountKey = account.toLowerCase();
    }
    return proof;
};

// Shared by the cancel guard and the media purge: a task may only lose its
// escrow lock (cancel) or its proof images (purge) once nobody can still
// contest a decision on it.
const isTaskDisputeFree = async (taskId) => {
    const setting = await getOrCreateSetting();
    const reportWindowHours = Number(setting.marketplace?.reportWindowHours ?? 72);
    const cutoff = new Date(Date.now() - reportWindowHours * 3600 * 1000);

    const openCount = await TaskSubmission.countDocuments({
        task: taskId,
        $or: [
            { status: { $in: ["PENDING", "REPORTED"] } },
            { status: "REJECTED", reviewedAt: { $gt: cutoff } },
        ],
    });
    return openCount === 0;
};

// ─────────────────────────────────────────────────────────────────────────
// Task creation & admin moderation
// ─────────────────────────────────────────────────────────────────────────

const createTask = async (providerId, data) => {
    const setting = await getOrCreateSetting();
    await assertMarketplaceEnabled(setting);

    const targetQuantity = Number(data.targetQuantity);
    if (!Number.isInteger(targetQuantity) || targetQuantity <= 0) {
        throw new Error("Target quantity must be a positive whole number");
    }
    const costPerUnit = Number(data.costPerUnit);
    if (!Number.isFinite(costPerUnit) || costPerUnit <= 0) {
        throw new Error("Cost per unit must be a positive number");
    }

    const typeDef = getTaskType(data.taskType);
    if (!typeDef) throw new Error("Invalid task type");
    if (!typeDef.platforms.includes(data.platform)) {
        throw new Error(`Platform "${data.platform}" is not valid for this task type`);
    }
    const typeConfig = normalizeTypeConfig(data.taskType, data.typeConfig);

    const commissionRate = Number(setting.marketplace?.commissionRate ?? 10);
    const netPerUnit = round2(costPerUnit * (1 - commissionRate / 100));
    const feePerUnit = round2(costPerUnit - netPerUnit);
    // The only effective price floor, and it is derived rather than
    // configured: a price whose net rounds to zero would advertise unpaid
    // work. The provider's own balance is the effective ceiling.
    if (netPerUnit <= 0) {
        throw new Error("This price is too low — the worker's net reward would round to ৳0.00");
    }
    const totalBudget = round2(targetQuantity * costPerUnit);
    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
        throw new Error("Invalid total budget");
    }

    // A provider may RAISE an optional proof requirement to required, but
    // never relax one the registry marks required.
    const proofSpec = typeDef.proof;
    const requiresScreenshot = proofSpec.screenshot === "required"
        ? true
        : proofSpec.screenshot === "none" ? false : Boolean(data.requiresScreenshot ?? true);
    const requiresProofUrl = proofSpec.url === "required"
        ? true
        : proofSpec.url === "none" ? false : Boolean(data.requiresProofUrl ?? false);

    const proofQuestions = (Array.isArray(data.proofQuestions) ? data.proofQuestions : [])
        .map(String).map((s) => s.trim()).filter(Boolean).slice(0, 10);

    // Created with escrowFunded: false — invisible to every query, which all
    // filter on that flag — until the debit below actually succeeds.
    const task = await MarketTask.create({
        provider: providerId,
        title: String(data.title || "").trim(),
        description: String(data.description || "").trim(),
        taskType: data.taskType,
        platform: data.platform,
        typeConfig,
        targetUrl: String(data.targetUrl || "").trim(),
        proofInstructions: String(data.proofInstructions || "").trim(),
        accountLabel: String(data.accountLabel || "").trim(),
        requiresScreenshot,
        requiresProofUrl,
        proofQuestions,
        targetQuantity,
        costPerUnit,
        netPerUnit,
        feePerUnit,
        commissionRate,
        totalBudget,
        slotsRemaining: targetQuantity,
    });

    // The $gte in the filter is what makes this race-free — two concurrent
    // creates from a provider who can only afford one cannot both pass.
    const debited = await User.findOneAndUpdate(
        { _id: providerId, balance: { $gte: totalBudget } },
        { $inc: { balance: -totalBudget } },
        { new: true }
    );
    if (!debited) {
        await MarketTask.findByIdAndDelete(task._id);
        throw new Error("Insufficient balance");
    }

    await MarketTask.findOneAndUpdate(
        { _id: task._id, escrowFunded: false },
        { escrowFunded: true, escrowHeld: totalBudget }
    );

    await PlatformLedger.create({
        type: "ESCROW_HOLD", amount: totalBudget, task: task._id, provider: providerId, note: "Task created",
    });

    notifyUser(providerId, {
        category: "tasks",
        type: "task_pending_approval",
        title: "টাস্ক পর্যালোচনার অপেক্ষায়",
        message: `আপনার টাস্ক "${task.title}" জমা হয়েছে এবং এডমিন অনুমোদনের অপেক্ষায় আছে। ৳${totalBudget} এস্ক্রোতে জমা রাখা হয়েছে।`,
        link: "/provider/tasks",
    });
    const admins = await User.find({ role: { $in: ["admin", "moderator"] } }).select("_id");
    notifyMany(admins.map((a) => a._id), {
        category: "tasks",
        type: "task_needs_approval",
        title: "নতুন টাস্ক অনুমোদনের অপেক্ষায়",
        message: `"${task.title}" টাস্কটি পর্যালোচনার জন্য অপেক্ষা করছে।`,
        link: "/marketplace",
    });

    return await MarketTask.findById(task._id).lean();
};

const approveTaskModeration = async (taskId, adminId) => {
    const task = await MarketTask.findOneAndUpdate(
        { _id: taskId, status: "PENDING_APPROVAL", escrowFunded: true },
        { status: "ACTIVE", moderatedBy: adminId, moderatedAt: new Date() },
        { new: true }
    );
    if (!task) throw new Error("Task not found or already moderated");

    const workers = await User.find({ status: "active", role: "user" }).select("_id");
    notifyMany(workers.map((u) => u._id), {
        category: "tasks",
        type: "new_task",
        title: "নতুন টাস্ক যোগ হয়েছে",
        message: `"${task.title}" · রিওয়ার্ড ৳${task.netPerUnit}। আজই সম্পন্ন করুন!`,
        link: "/tasks",
    });
    notifyUser(task.provider, {
        category: "tasks",
        type: "task_approved_live",
        title: "আপনার টাস্ক লাইভ হয়েছে",
        message: `"${task.title}" এখন ওয়ার্কারদের জন্য উন্মুক্ত।`,
        link: "/provider/tasks",
    });
    return task;
};

const rejectTaskModeration = async (taskId, adminId, reason) => {
    const trimmed = String(reason || "").trim();
    if (!trimmed) throw new Error("A rejection reason is required");

    const task = await MarketTask.findOneAndUpdate(
        { _id: taskId, status: "PENDING_APPROVAL" },
        { status: "REJECTED", rejectionReason: trimmed, moderatedBy: adminId, moderatedAt: new Date() },
        { new: true }
    );
    if (!task) throw new Error("Task not found or already moderated");

    if (task.escrowHeld > 0) {
        await User.findByIdAndUpdate(task.provider, { $inc: { balance: task.escrowHeld } });
        await PlatformLedger.create({
            type: "ESCROW_REFUND", amount: task.escrowHeld, task: task._id, provider: task.provider, note: "Task rejected by admin",
        });
        await MarketTask.findByIdAndUpdate(task._id, { escrowHeld: 0 });
    }

    notifyUser(task.provider, {
        category: "tasks",
        type: "task_rejected",
        title: "আপনার টাস্ক প্রত্যাখ্যান হয়েছে",
        message: `"${task.title}" প্রত্যাখ্যান করা হয়েছে। কারণ: ${trimmed}। ৳${task.totalBudget} ফেরত দেওয়া হয়েছে।`,
        link: "/provider/tasks",
    });
    return task;
};

// ─────────────────────────────────────────────────────────────────────────
// Worker feed
// ─────────────────────────────────────────────────────────────────────────

const getFeed = async (userId, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const submittedTaskIds = await TaskSubmission.find({ worker: userId }).distinct("task");

    const filter = {
        status: "ACTIVE",
        escrowFunded: true,
        slotsRemaining: { $gt: 0 },
        provider: { $ne: userId },
        _id: { $nin: submittedTaskIds },
    };
    if (query.platform) filter.platform = query.platform;
    if (query.taskType) filter.taskType = query.taskType;
    if (query.search) {
        const regex = new RegExp(query.search, "i");
        filter.$or = [{ title: regex }, { description: regex }];
    }

    const [data, total] = await Promise.all([
        MarketTask.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        MarketTask.countDocuments(filter),
    ]);

    return { data: data.map(toWorkerTaskView), total, page, pages: Math.ceil(total / limit) };
};

const getFeedTaskById = async (taskId) => {
    const task = await MarketTask.findOne({ _id: taskId, status: "ACTIVE", escrowFunded: true }).lean();
    if (!task) throw new Error("Task not found");
    return toWorkerTaskView(task);
};

// ─────────────────────────────────────────────────────────────────────────
// Watch sessions — the server-verified timer (see plan §1c)
// ─────────────────────────────────────────────────────────────────────────

const startWatchSession = async (userId, taskId) => {
    const task = await MarketTask.findOne({ _id: taskId, status: "ACTIVE", escrowFunded: true }).lean();
    if (!task) throw new Error("Task not found or not active");
    if (String(task.provider) === String(userId)) throw new Error("You cannot work on your own task");

    const typeDef = getTaskType(task.taskType);
    if (!typeDef || typeDef.gate === "NONE") {
        throw new Error("This task does not require a timed session");
    }

    const minDurationSeconds = Number(task.typeConfig?.minDurationSeconds) || 0;
    const ceilingSeconds = minDurationSeconds * 2 + 300;
    const now = new Date();
    const purgeAt = new Date(now.getTime() + (ceilingSeconds + 86400) * 1000);

    // Resume an existing session rather than restarting, so a page refresh
    // doesn't lose progress.
    let session = await WatchSession.findOne({ task: taskId, worker: userId });
    if (!session) {
        session = await WatchSession.create({ task: taskId, worker: userId, startedAt: now, lastPingAt: now, creditedSeconds: 0, purgeAt });
    }
    return { sessionId: session._id, minDurationSeconds, creditedSeconds: session.creditedSeconds };
};

const pingWatchSession = async (userId, taskId, { reset = false } = {}) => {
    const session = await WatchSession.findOne({ task: taskId, worker: userId });
    if (!session) throw new Error("No active watch session — call start first");

    const task = await MarketTask.findById(taskId).select("typeConfig taskType").lean();
    if (!task) throw new Error("Task not found");
    const minDurationSeconds = Number(task.typeConfig?.minDurationSeconds) || 0;
    const ceilingSeconds = minDurationSeconds * 2 + 300;

    const now = new Date();
    const ageSeconds = (now - session.startedAt) / 1000;
    if (ageSeconds > ceilingSeconds) {
        throw new Error("This session has expired — please start again");
    }

    // `reset` marks the moment playback RESUMES after a pause/tab-return: it
    // moves lastPingAt to now WITHOUT crediting the gap, so the paused time
    // itself is never counted as watched. The client must call this on every
    // pause->play transition, then resume its normal ~15s heartbeat.
    if (reset) {
        session.lastPingAt = now;
        await session.save();
        return { creditedSeconds: session.creditedSeconds, minDurationSeconds };
    }

    // Credit AT MOST the real elapsed time since the previous ping (with a
    // couple of seconds tolerance for jitter), never a client-supplied
    // number. This single clamp is what makes the timer unforgeable.
    const elapsedSeconds = Math.max(0, (now - session.lastPingAt) / 1000);
    const credit = Math.min(elapsedSeconds + 2, 30);

    session.creditedSeconds = session.creditedSeconds + credit;
    session.lastPingAt = now;
    await session.save();

    return { creditedSeconds: session.creditedSeconds, minDurationSeconds };
};

// ─────────────────────────────────────────────────────────────────────────
// Submission lifecycle
// ─────────────────────────────────────────────────────────────────────────

const submitProof = async (userId, taskId, body) => {
    const task = await MarketTask.findOne({ _id: taskId, status: "ACTIVE", escrowFunded: true });
    if (!task) throw new Error("Task not found or not active");
    if (String(task.provider) === String(userId)) {
        throw new Error("You cannot submit to your own task");
    }

    const typeDef = getTaskType(task.taskType);
    if (!typeDef) throw new Error("This task has an invalid configuration");

    const existing = await TaskSubmission.findOne({ task: taskId, worker: userId });
    if (existing) {
        return await retrySubmission(existing, task, typeDef, body);
    }

    let creditedSeconds = null;
    if (typeDef.gate !== "NONE") {
        const session = await WatchSession.findOne({ task: taskId, worker: userId });
        const minDurationSeconds = Number(task.typeConfig?.minDurationSeconds) || 0;
        creditedSeconds = session?.creditedSeconds || 0;
        if (creditedSeconds < minDurationSeconds) {
            throw new Error(`You need to complete at least ${minDurationSeconds}s before submitting`);
        }
    }

    const proof = buildProofSnapshot(task, typeDef, body);

    // Reserve a slot atomically before creating the submission — the $gt
    // check in the filter is what stops N+1 workers reserving one slot.
    const reserved = await MarketTask.findOneAndUpdate(
        { _id: taskId, status: "ACTIVE", escrowFunded: true, slotsRemaining: { $gt: 0 } },
        { $inc: { slotsRemaining: -1, pendingCount: 1 } },
        { new: true }
    );
    if (!reserved) throw new Error("This task is full or no longer active");

    const setting = await getOrCreateSetting();
    const autoApproveHours = Number(setting.marketplace?.autoApproveHours ?? 72);

    let submission;
    try {
        submission = await TaskSubmission.create({
            task: taskId,
            worker: userId,
            provider: task.provider,
            status: "PENDING",
            autoApproveAt: new Date(Date.now() + autoApproveHours * 3600 * 1000),
            grossAmount: task.costPerUnit,
            netAmount: task.netPerUnit,
            feeAmount: task.feePerUnit,
            creditedSeconds,
            proof,
            attempt: 1,
        });
    } catch (error) {
        // Release the slot on ANY failure, including the duplicate-handle
        // unique index (E11000), so a failed submit never shrinks the pool.
        await MarketTask.findByIdAndUpdate(taskId, { $inc: { slotsRemaining: 1, pendingCount: -1 } });
        if (error.code === 11000) {
            throw new Error("This account has already been submitted for this task");
        }
        throw error;
    }

    notifyUser(task.provider, {
        category: "tasks",
        type: "submission_received",
        title: "নতুন সাবমিশন এসেছে",
        message: `"${task.title}" এর জন্য একটি নতুন সাবমিশন রিভিউয়ের অপেক্ষায় আছে।`,
        link: "/provider/tasks",
    });

    return toWorkerSubmissionView(submission.toObject());
};

const retrySubmission = async (existing, task, typeDef, body) => {
    if (existing.status !== "REJECTED") {
        throw new Error("This submission cannot be resubmitted right now");
    }
    const setting = await getOrCreateSetting();
    const maxAttempts = Number(setting.marketplace?.maxAttempts ?? 2);
    if (existing.attempt >= maxAttempts) {
        throw new Error("You have used all your attempts for this task");
    }

    let creditedSeconds = existing.creditedSeconds;
    if (typeDef.gate !== "NONE") {
        const session = await WatchSession.findOne({ task: task._id, worker: existing.worker });
        const minDurationSeconds = Number(task.typeConfig?.minDurationSeconds) || 0;
        creditedSeconds = session?.creditedSeconds || 0;
        if (creditedSeconds < minDurationSeconds) {
            throw new Error(`You need to complete at least ${minDurationSeconds}s before resubmitting`);
        }
    }

    const proof = buildProofSnapshot(task, typeDef, body);
    const autoApproveHours = Number(setting.marketplace?.autoApproveHours ?? 72);

    // Guarded flip is the concurrency barrier — the same pattern as every
    // other status transition in this file. A bare read-then-.save() here
    // would let a double-click reserve two slots for what is really one
    // retry, since the "still REJECTED" check and the write wouldn't be
    // atomic together.
    const attemptRecord = {
        attempt: existing.attempt,
        proof: existing.proof,
        submittedAt: existing.updatedAt,
        rejectionReason: existing.rejectionReason,
        reviewedAt: existing.reviewedAt,
    };
    let flipped;
    try {
        flipped = await TaskSubmission.findOneAndUpdate(
            { _id: existing._id, status: "REJECTED" },
            {
                $push: { attempts: attemptRecord },
                status: "PENDING",
                attempt: existing.attempt + 1,
                autoApproveAt: new Date(Date.now() + autoApproveHours * 3600 * 1000),
                proof,
                creditedSeconds,
                rejectionReason: "",
                reviewedAt: null,
                reviewedBy: null,
            },
            { new: true }
        );
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("This account has already been submitted for this task");
        }
        throw error;
    }
    if (!flipped) throw new Error("This submission was already resubmitted");

    const reserved = await MarketTask.findOneAndUpdate(
        { _id: task._id, status: "ACTIVE", escrowFunded: true, slotsRemaining: { $gt: 0 } },
        { $inc: { slotsRemaining: -1, pendingCount: 1 } },
        { new: true }
    );
    if (!reserved) {
        // Roll back the flip so the worker isn't stuck PENDING with no slot
        // actually reserved for them.
        await TaskSubmission.findByIdAndUpdate(existing._id, {
            status: "REJECTED",
            attempt: existing.attempt,
            $pop: { attempts: 1 },
        });
        throw new Error("This task filled up before your retry could be submitted");
    }

    notifyUser(task.provider, {
        category: "tasks",
        type: "submission_received",
        title: "একটি রিসাবমিশন এসেছে",
        message: `"${task.title}" এর জন্য একটি সংশোধিত সাবমিশন জমা হয়েছে।`,
        link: "/provider/tasks",
    });

    return toWorkerSubmissionView(flipped.toObject());
};

const getMySubmissions = async (workerId, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = { worker: workerId };
    if (query.status) filter.status = query.status;
    const [data, total] = await Promise.all([
        TaskSubmission.find(filter).populate("task", "title taskType platform").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        TaskSubmission.countDocuments(filter),
    ]);
    return { data: data.map(toWorkerSubmissionView), total, page, pages: Math.ceil(total / limit) };
};

// ─────────────────────────────────────────────────────────────────────────
// Approve / reject / auto-approve — ONE shared payout path
// ─────────────────────────────────────────────────────────────────────────

/**
 * The only function that pays a worker. Called by the provider's approve
 * button, the admin override, and the auto-approve sweep — never
 * reimplemented, so the escrow/fee arithmetic can't drift between callers.
 */
const approveSubmission = async (submissionId, { reviewedBy = null, resultStatus = "APPROVED", byProviderId = null } = {}) => {
    const filter = { _id: submissionId, status: "PENDING" };
    if (byProviderId) filter.provider = byProviderId; // ownership check lives IN the filter

    const submission = await TaskSubmission.findOneAndUpdate(
        filter,
        { status: resultStatus, reviewedBy, reviewedAt: new Date() },
        { new: true }
    );
    if (!submission) throw new Error("Submission not found, not pending, or not yours");

    const taskUpdate = await MarketTask.findOneAndUpdate(
        { _id: submission.task, escrowHeld: { $gte: submission.grossAmount } },
        { $inc: { approvedCount: 1, pendingCount: -1, escrowHeld: -submission.grossAmount, escrowReleased: submission.grossAmount } },
        { new: true }
    );
    if (!taskUpdate) {
        // Escrow shortfall (should not happen in normal operation) — revert
        // rather than silently lose the submission.
        await TaskSubmission.findByIdAndUpdate(submission._id, { status: "PENDING", reviewedBy: null, reviewedAt: null });
        throw new Error("Escrow shortfall — could not complete this approval");
    }

    await User.findByIdAndUpdate(submission.worker, { $inc: { balance: submission.netAmount } });

    await PlatformLedger.create([
        { type: "WORKER_PAYOUT", amount: submission.netAmount, task: submission.task, submission: submission._id, worker: submission.worker, provider: submission.provider },
        { type: "PLATFORM_FEE", amount: submission.feeAmount, task: submission.task, submission: submission._id, worker: submission.worker, provider: submission.provider },
    ]);

    if (taskUpdate.approvedCount >= taskUpdate.targetQuantity) {
        const completed = await MarketTask.findOneAndUpdate(
            { _id: taskUpdate._id, status: "ACTIVE" },
            { status: "COMPLETED", completedAt: new Date() },
            { new: true }
        );
        if (completed) {
            // Fire-and-forget: a purge failure must never block or fail a payout.
            purgeTaskMedia(completed._id).catch(() => {});
        }
    }

    notifyUser(submission.worker, {
        category: "tasks",
        type: "task_approved",
        title: "কাজ অনুমোদিত হয়েছে!",
        message: `আপনার সাবমিশন অনুমোদিত হয়েছে এবং ৳${submission.netAmount} ব্যালেন্সে যোগ হয়েছে।`,
        link: "/my-submissions",
    });

    return submission;
};

const providerApproveSubmission = (submissionId, providerId) =>
    approveSubmission(submissionId, { reviewedBy: providerId, resultStatus: "APPROVED", byProviderId: providerId });

const adminApproveSubmission = (submissionId, adminId) =>
    approveSubmission(submissionId, { reviewedBy: adminId, resultStatus: "ADMIN_APPROVED" });

const autoApproveSubmission = (submissionId) =>
    approveSubmission(submissionId, { reviewedBy: null, resultStatus: "AUTO_APPROVED" });

const rejectSubmission = async (submissionId, providerId, reason) => {
    const trimmedReason = String(reason || "").trim();
    if (trimmedReason.length < 5) {
        throw new Error("Please provide a rejection reason (at least 5 characters)");
    }

    const submission = await TaskSubmission.findOneAndUpdate(
        { _id: submissionId, provider: providerId, status: "PENDING" },
        { status: "REJECTED", rejectionReason: trimmedReason, reviewedBy: providerId, reviewedAt: new Date() },
        { new: true }
    );
    if (!submission) throw new Error("Submission not found, not pending, or not yours");

    // Return the slot to the pool for another worker (or this worker's
    // retry). Escrow stays untouched — still fully held.
    await MarketTask.findByIdAndUpdate(submission.task, { $inc: { slotsRemaining: 1, pendingCount: -1 } });

    const setting = await getOrCreateSetting();
    const maxAttempts = Number(setting.marketplace?.maxAttempts ?? 2);
    const canRetry = submission.attempt < maxAttempts;

    notifyUser(submission.worker, {
        category: "tasks",
        type: "task_rejected",
        title: "সাবমিশন প্রত্যাখ্যান হয়েছে",
        message: `কারণ: ${trimmedReason}।${canRetry ? " আপনি আরেকবার চেষ্টা করতে পারবেন।" : " দুঃখিত, আর কোনো চেষ্টা অবশিষ্ট নেই — চাইলে এডমিনের কাছে রিপোর্ট করতে পারেন।"}`,
        link: "/my-submissions",
    });

    return submission;
};

// Admin override — same guarded-flip authorisation pattern, without the
// provider-ownership clause.
const adminRejectSubmission = async (submissionId, adminId, reason) => {
    const trimmedReason = String(reason || "").trim();
    if (trimmedReason.length < 5) {
        throw new Error("Please provide a rejection reason (at least 5 characters)");
    }
    const submission = await TaskSubmission.findOneAndUpdate(
        { _id: submissionId, status: "PENDING" },
        { status: "REJECTED", rejectionReason: trimmedReason, reviewedBy: adminId, reviewedAt: new Date() },
        { new: true }
    );
    if (!submission) throw new Error("Submission not found or not pending");
    await MarketTask.findByIdAndUpdate(submission.task, { $inc: { slotsRemaining: 1, pendingCount: -1 } });

    notifyUser(submission.worker, {
        category: "tasks",
        type: "task_rejected",
        title: "সাবমিশন প্রত্যাখ্যান হয়েছে",
        message: `কারণ: ${trimmedReason}।`,
        link: "/my-submissions",
    });
    return submission;
};

// ─────────────────────────────────────────────────────────────────────────
// Reports & admin arbitration
// ─────────────────────────────────────────────────────────────────────────

const reportSubmission = async (userId, submissionId, reason) => {
    const trimmedReason = String(reason || "").trim();
    if (!trimmedReason) throw new Error("Please describe why you're reporting this rejection");

    const submission = await TaskSubmission.findOne({ _id: submissionId, worker: userId });
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "REJECTED") throw new Error("Only a rejected submission can be reported");

    const setting = await getOrCreateSetting();
    const reportWindowHours = Number(setting.marketplace?.reportWindowHours ?? 72);
    const deadline = new Date((submission.reviewedAt || submission.updatedAt).getTime() + reportWindowHours * 3600 * 1000);
    if (new Date() > deadline) {
        throw new Error("The window to report this rejection has passed");
    }

    const updated = await TaskSubmission.findOneAndUpdate(
        { _id: submissionId, status: "REJECTED" },
        { status: "REPORTED", reportReason: trimmedReason, reportedAt: new Date() },
        { new: true }
    );
    if (!updated) throw new Error("This submission is no longer rejected");

    // Flag it as needing attention. Note this does not re-take a slot from
    // the pool — that slot was already returned at reject time and may have
    // gone to another worker since, which is fine: money accuracy here
    // depends only on escrowHeld (untouched since rejection), not on this
    // counter.
    await MarketTask.findByIdAndUpdate(updated.task, { $inc: { pendingCount: 1 } });

    const admins = await User.find({ role: { $in: ["admin", "moderator"] } }).select("_id");
    notifyMany(admins.map((a) => a._id), {
        category: "tasks",
        type: "submission_reported",
        title: "একটি সাবমিশন রিপোর্ট হয়েছে",
        message: "একজন ওয়ার্কার তার প্রত্যাখ্যাত সাবমিশন নিয়ে রিপোর্ট করেছেন।",
        link: "/marketplace/reports",
    });

    return updated;
};

const resolveReportDismiss = async (submissionId, adminId) => {
    const submission = await TaskSubmission.findOneAndUpdate(
        { _id: submissionId, status: "REPORTED" },
        { status: "REJECTED", reportResolution: "DISMISSED", reportResolvedBy: adminId, reportResolvedAt: new Date() },
        { new: true }
    );
    if (!submission) throw new Error("Report not found or already resolved");
    await MarketTask.findByIdAndUpdate(submission.task, { $inc: { pendingCount: -1 } });

    notifyUser(submission.worker, {
        category: "tasks",
        type: "report_dismissed",
        title: "আপনার রিপোর্ট বাতিল হয়েছে",
        message: "এডমিন পর্যালোচনার পর, মূল প্রত্যাখ্যানের সিদ্ধান্তই বহাল রাখা হয়েছে।",
        link: "/my-submissions",
    });
    return submission;
};

const resolveReportForceApprove = async (submissionId, adminId, fineAmount) => {
    const reported = await TaskSubmission.findOne({ _id: submissionId, status: "REPORTED" });
    if (!reported) throw new Error("Report not found or already resolved");

    const numericFine = Number(fineAmount) || 0;
    if (numericFine < 0) throw new Error("Fine amount cannot be negative");

    // Pre-check affordability BEFORE touching anything, so a fine the
    // provider can't cover refuses the whole action and nothing moves —
    // simpler and safer than unwinding a payout that already happened.
    if (numericFine > 0) {
        const provider = await User.findById(reported.provider).select("balance");
        if (!provider || provider.balance < numericFine) {
            throw new Error(`Fine refused — provider's balance (৳${provider?.balance || 0}) cannot cover ৳${numericFine}. Try a smaller amount.`);
        }
    }

    // Flip REPORTED -> PENDING momentarily so the shared approveSubmission's
    // {status:'PENDING'} guard applies uniformly — one payout implementation.
    // Leave pendingCount alone here: reportSubmission already bumped it by
    // +1, and approveSubmission's own {pendingCount: -1} is what cancels
    // that bump — exactly mirroring how resolveReportDismiss's single -1
    // cancels it on the other branch. An extra decrement here would
    // double-subtract and drive pendingCount negative.
    const flipped = await TaskSubmission.findOneAndUpdate(
        { _id: submissionId, status: "REPORTED" },
        { status: "PENDING" },
        { new: true }
    );
    if (!flipped) throw new Error("Report not found or already resolved");

    let submission;
    try {
        submission = await approveSubmission(submissionId, { reviewedBy: adminId, resultStatus: "ADMIN_APPROVED" });
    } catch (error) {
        await TaskSubmission.findByIdAndUpdate(submissionId, { status: "REPORTED" });
        throw error;
    }

    await TaskSubmission.findByIdAndUpdate(submissionId, {
        reportResolution: "UPHELD", reportResolvedBy: adminId, reportResolvedAt: new Date(),
    });

    if (numericFine > 0) {
        const debited = await User.findOneAndUpdate(
            { _id: submission.provider, balance: { $gte: numericFine } },
            { $inc: { balance: -numericFine } },
            { new: true }
        );
        if (debited) {
            await TaskSubmission.findByIdAndUpdate(submissionId, { fineAmount: numericFine });
            await PlatformLedger.create({
                type: "PROVIDER_FINE", amount: numericFine, task: submission.task, submission: submission._id,
                provider: submission.provider, worker: submission.worker, note: "Fine for bad-faith rejection",
            });
            notifyUser(submission.provider, {
                category: "tasks",
                type: "provider_fined",
                title: "একটি জরিমানা আরোপ করা হয়েছে",
                message: `একটি অন্যায্য প্রত্যাখ্যানের জন্য আপনার একাউন্ট থেকে ৳${numericFine} কেটে নেওয়া হয়েছে।`,
                link: "/provider/tasks",
            });
        }
        // A race between the pre-check and this debit is the one gap left by
        // not using DB transactions; if it fires, the worker is still paid
        // and the fine is simply not applied — surfaced only via the
        // missing ledger row, not by failing this request.
    }

    notifyUser(submission.worker, {
        category: "tasks",
        type: "report_upheld",
        title: "আপনার রিপোর্ট গ্রহণ করা হয়েছে",
        message: `এডমিন আপনার সাবমিশন অনুমোদন করেছেন এবং ৳${submission.netAmount} আপনার ব্যালেন্সে যোগ হয়েছে।`,
        link: "/my-submissions",
    });

    return submission;
};

// ─────────────────────────────────────────────────────────────────────────
// Cancel & media purge
// ─────────────────────────────────────────────────────────────────────────

const cancelTask = async (providerId, taskId) => {
    const task = await MarketTask.findOne({ _id: taskId, provider: providerId });
    if (!task) throw new Error("Task not found");
    if (!["ACTIVE", "PENDING_APPROVAL", "PAUSED"].includes(task.status)) {
        throw new Error("This task cannot be cancelled from its current status");
    }

    const clear = await isTaskDisputeFree(taskId);
    if (!clear) {
        throw new Error("This task has submissions still pending, reported, or recently rejected. Cancel is blocked until they are resolved.");
    }

    const cancelled = await MarketTask.findOneAndUpdate(
        { _id: taskId, provider: providerId, status: task.status },
        { status: "CANCELLED" },
        { new: true }
    );
    if (!cancelled) throw new Error("Task could not be cancelled — please try again");

    if (cancelled.escrowHeld > 0) {
        await User.findByIdAndUpdate(providerId, { $inc: { balance: cancelled.escrowHeld } });
        await PlatformLedger.create({
            type: "ESCROW_REFUND", amount: cancelled.escrowHeld, task: cancelled._id, provider: providerId, note: "Task cancelled by provider",
        });
        await MarketTask.findByIdAndUpdate(cancelled._id, { escrowHeld: 0 });
    }

    purgeTaskMedia(cancelled._id).catch(() => {});

    return cancelled;
};

/**
 * Deletes proof screenshots from S3 for a terminal, dispute-free task.
 * Never lets a failure here reach the caller or touch money — see plan §6b.
 */
const purgeTaskMedia = async (taskId) => {
    try {
        const task = await MarketTask.findOneAndUpdate(
            { _id: taskId, mediaPurgedAt: null, status: { $in: ["COMPLETED", "CANCELLED"] } },
            { mediaPurgedAt: new Date() },
            { new: true }
        );
        if (!task) return; // already purged, not terminal, or lost the claim race — harmless

        const clear = await isTaskDisputeFree(taskId);
        if (!clear) {
            // Not actually eligible yet — release the claim so the sweep retries.
            await MarketTask.findByIdAndUpdate(taskId, { mediaPurgedAt: null });
            return;
        }

        const submissions = await TaskSubmission.find({ task: taskId });
        const urls = [];
        for (const s of submissions) {
            urls.push(...(s.proof?.screenshots || []));
            for (const a of s.attempts || []) urls.push(...(a.proof?.screenshots || []));
        }
        if (urls.length) await deleteObjectsByUrl(urls);

        await TaskSubmission.updateMany({ task: taskId }, { $set: { "proof.screenshots": [], proofMediaPurged: true } });

        // Attempt-history screenshots must be cleared per document — Mongo
        // can't $set a nested field inside every array element at once.
        const withAttempts = await TaskSubmission.find({ task: taskId, "attempts.0": { $exists: true } });
        for (const s of withAttempts) {
            s.attempts = s.attempts.map((a) => {
                const plain = a.toObject ? a.toObject() : a;
                return { ...plain, proof: { ...(plain.proof || {}), screenshots: [] } };
            });
            await s.save();
        }
    } catch (error) {
        console.error("[Marketplace] purgeTaskMedia failed for", taskId, error.message);
        await MarketTask.findByIdAndUpdate(taskId, { mediaPurgedAt: null }).catch(() => {});
    }
};

// ─────────────────────────────────────────────────────────────────────────
// Sweep entry points (called by sweep.js on a shared 15-minute interval)
// ─────────────────────────────────────────────────────────────────────────

const sweepAutoApprove = async () => {
    const now = new Date();
    const overdue = await TaskSubmission.find({ status: "PENDING", autoApproveAt: { $lte: now } }).limit(50).select("_id");
    for (const s of overdue) {
        try {
            await autoApproveSubmission(s._id);
        } catch (error) {
            console.error("[Marketplace] auto-approve failed for", s._id, error.message);
        }
    }

    const reminderCutoff = new Date(now.getTime() + 24 * 3600 * 1000);
    const dueSoon = await TaskSubmission.find({
        status: "PENDING", autoApproveAt: { $lte: reminderCutoff, $gt: now }, reminderSentAt: null,
    }).limit(200);

    const byProvider = new Map();
    for (const s of dueSoon) {
        const key = String(s.provider);
        byProvider.set(key, (byProvider.get(key) || 0) + 1);
    }
    for (const [providerId, count] of byProvider) {
        notifyUser(providerId, {
            category: "tasks",
            type: "auto_approve_reminder",
            title: "সাবমিশন শীঘ্রই স্বয়ংক্রিয়ভাবে অনুমোদিত হবে",
            message: `আপনার ${count}টি সাবমিশন আগামীকাল স্বয়ংক্রিয়ভাবে অনুমোদিত হয়ে যাবে যদি আপনি রিভিউ না করেন।`,
            link: "/provider/tasks",
        });
    }
    if (dueSoon.length) {
        await TaskSubmission.updateMany({ _id: { $in: dueSoon.map((s) => s._id) } }, { reminderSentAt: now });
    }
};

const sweepMediaPurge = async () => {
    const candidates = await MarketTask.find({ status: { $in: ["COMPLETED", "CANCELLED"] }, mediaPurgedAt: null }).limit(50).select("_id");
    for (const t of candidates) {
        await purgeTaskMedia(t._id);
    }
};

// ─────────────────────────────────────────────────────────────────────────
// Provider-side reads
// ─────────────────────────────────────────────────────────────────────────

const getMyTasks = async (providerId, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = { provider: providerId };
    if (query.status) filter.status = query.status;
    const [data, total] = await Promise.all([
        MarketTask.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        MarketTask.countDocuments(filter),
    ]);
    return { data: data.map(toProviderTaskView), total, page, pages: Math.ceil(total / limit) };
};

const getMyTaskById = async (providerId, taskId) => {
    const task = await MarketTask.findOne({ _id: taskId, provider: providerId }).lean();
    if (!task) throw new Error("Task not found");
    return toProviderTaskView(task);
};

const getMyTaskSubmissions = async (providerId, taskId, query) => {
    const owns = await MarketTask.exists({ _id: taskId, provider: providerId });
    if (!owns) throw new Error("Task not found");

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = { task: taskId, provider: providerId };
    if (query.status) filter.status = query.status;
    const [data, total] = await Promise.all([
        TaskSubmission.find(filter).populate("worker", "name username").sort({ autoApproveAt: 1 }).skip(skip).limit(limit).lean(),
        TaskSubmission.countDocuments(filter),
    ]);
    return { data: data.map(toProviderSubmissionView), total, page, pages: Math.ceil(total / limit) };
};

const getMyTasksSummary = async (providerId) => {
    const objectId = new mongoose.Types.ObjectId(providerId);
    const facet = await MarketTask.aggregate([
        { $match: { provider: objectId } },
        { $group: { _id: "$status", n: { $sum: 1 }, held: { $sum: "$escrowHeld" }, budget: { $sum: "$totalBudget" } } },
    ]);
    const byStatus = Object.fromEntries(facet.map((f) => [f._id, { count: f.n, escrowHeld: round2(f.held) }]));
    const totalEscrowHeld = round2(facet.reduce((sum, f) => sum + (f.held || 0), 0));
    const totalSpent = round2(facet.reduce((sum, f) => sum + (f.budget || 0), 0));
    return { byStatus, totalEscrowHeld, totalSpent };
};

// ─────────────────────────────────────────────────────────────────────────
// Admin reads & config
// ─────────────────────────────────────────────────────────────────────────

const getAllTasksAdmin = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.taskType) filter.taskType = query.taskType;
    if (query.platform) filter.platform = query.platform;
    if (query.provider) filter.provider = query.provider;
    if (query.search) {
        const regex = new RegExp(query.search, "i");
        filter.$or = [{ title: regex }, { description: regex }];
    }
    const [data, total] = await Promise.all([
        MarketTask.find(filter).populate("provider", "name username email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        MarketTask.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
};

const getTaskByIdAdmin = async (taskId) => {
    const task = await MarketTask.findById(taskId).populate("provider", "name username email balance").lean();
    if (!task) throw new Error("Task not found");
    return task;
};

const getTaskSubmissionsAdmin = async (taskId, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = { task: taskId };
    if (query.status) filter.status = query.status;
    const [data, total] = await Promise.all([
        TaskSubmission.find(filter).populate("worker", "name username").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        TaskSubmission.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
};

const getAllSubmissionsAdmin = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.taskId) filter.task = query.taskId;
    if (query.workerId) filter.worker = query.workerId;
    const [data, total] = await Promise.all([
        TaskSubmission.find(filter)
            .populate("worker", "name username")
            .populate("task", "title taskType platform")
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        TaskSubmission.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
};

const getReportsQueue = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = { status: "REPORTED" };
    const [data, total] = await Promise.all([
        TaskSubmission.find(filter)
            .populate("worker", "name username")
            .populate("provider", "name username balance")
            .populate("task", "title taskType platform")
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        TaskSubmission.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
};

const getLedger = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.type) filter.type = query.type;
    const [data, total] = await Promise.all([
        PlatformLedger.find(filter)
            .populate("provider", "name username")
            .populate("worker", "name username")
            .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        PlatformLedger.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
};

const getRevenue = async () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const chartStart = new Date(startOfToday); chartStart.setDate(startOfToday.getDate() - 14);

    const [facetResult, dailyChart] = await Promise.all([
        PlatformLedger.aggregate([
            { $match: { type: { $in: ["PLATFORM_FEE", "PROVIDER_FINE"] } } },
            { $facet: {
                total: [{ $group: { _id: null, v: { $sum: "$amount" } } }],
                today: [{ $match: { createdAt: { $gte: startOfToday } } }, { $group: { _id: null, v: { $sum: "$amount" } } }],
                week: [{ $match: { createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, v: { $sum: "$amount" } } }],
                month: [{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, v: { $sum: "$amount" } } }],
            } },
        ]),
        PlatformLedger.aggregate([
            { $match: { type: { $in: ["PLATFORM_FEE", "PROVIDER_FINE"] }, createdAt: { $gte: chartStart } } },
            { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" }, d: { $dayOfMonth: "$createdAt" } }, v: { $sum: "$amount" } } },
            { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
        ]),
    ]);
    const f = facetResult[0] || {};
    const dailyMap = new Map((dailyChart || []).map((d) => [`${d._id.y}-${String(d._id.m).padStart(2, "0")}-${String(d._id.d).padStart(2, "0")}`, d.v]));
    const chart = Array.from({ length: 15 }, (_, i) => {
        const d = new Date(chartStart); d.setDate(chartStart.getDate() + i);
        const key = d.toISOString().split("T")[0];
        return { date: key, amount: dailyMap.get(key) || 0 };
    });
    return {
        total: round2(f.total?.[0]?.v || 0),
        today: round2(f.today?.[0]?.v || 0),
        week: round2(f.week?.[0]?.v || 0),
        month: round2(f.month?.[0]?.v || 0),
        chart,
    };
};

const getReconcile = async () => {
    const [heldSum, ledgerFacet, orphanFunded] = await Promise.all([
        MarketTask.aggregate([{ $group: { _id: null, v: { $sum: "$escrowHeld" } } }]),
        PlatformLedger.aggregate([{ $group: { _id: "$type", v: { $sum: "$amount" } } }]),
        MarketTask.countDocuments({ escrowFunded: false, createdAt: { $lt: new Date(Date.now() - 3600 * 1000) } }),
    ]);
    const byType = Object.fromEntries(ledgerFacet.map((f) => [f._id, f.v]));
    const expectedHeld = (byType.ESCROW_HOLD || 0) - (byType.ESCROW_REFUND || 0) - (byType.WORKER_PAYOUT || 0) - (byType.PLATFORM_FEE || 0);
    const actualHeld = heldSum[0]?.v || 0;
    return {
        actualHeld: round2(actualHeld),
        expectedHeld: round2(expectedHeld),
        difference: round2(actualHeld - expectedHeld),
        orphanUnfundedTasks: orphanFunded,
        ledgerTotals: byType,
    };
};

const getConfig = async () => {
    const setting = await getOrCreateSetting();
    return setting.marketplace || {};
};

const updateConfig = async (data) => {
    const result = await updateSettingFn({ marketplace: data });
    return result.setting.marketplace;
};

const purgeTaskMediaNow = async (taskId) => {
    await purgeTaskMedia(taskId);
    const task = await MarketTask.findById(taskId).select("mediaPurgedAt status").lean();
    if (!task?.mediaPurgedAt) {
        throw new Error("Task is not yet eligible for purge — it must be terminal and dispute-free");
    }
    return task;
};

module.exports = {
    toWorkerTaskView, toProviderTaskView, toWorkerSubmissionView, toProviderSubmissionView,
    createTask, approveTaskModeration, rejectTaskModeration,
    getFeed, getFeedTaskById,
    startWatchSession, pingWatchSession,
    submitProof, getMySubmissions, reportSubmission,
    providerApproveSubmission, adminApproveSubmission, rejectSubmission, adminRejectSubmission,
    resolveReportDismiss, resolveReportForceApprove,
    cancelTask, purgeTaskMediaNow,
    sweepAutoApprove, sweepMediaPurge,
    getMyTasks, getMyTaskById, getMyTaskSubmissions, getMyTasksSummary,
    getAllTasksAdmin, getTaskByIdAdmin, getTaskSubmissionsAdmin, getAllSubmissionsAdmin,
    getReportsQueue, getLedger, getRevenue, getReconcile,
    getConfig, updateConfig,
};
