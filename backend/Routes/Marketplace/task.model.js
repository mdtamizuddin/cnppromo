const mongoose = require("mongoose");
const { TASK_TYPE_KEYS, PLATFORMS } = require("./taskTypes");

const marketTaskSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Provider is required"],
    },
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    taskType: {
        type: String,
        enum: TASK_TYPE_KEYS,
        required: [true, "Task type is required"],
    },
    platform: {
        type: String,
        enum: PLATFORMS,
        required: [true, "Platform is required"],
    },
    // Type-specific settings validated against the registry, e.g.
    // { minDurationSeconds: 60 } for a WATCH/VISIT task.
    typeConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    targetUrl: {
        type: String,
        required: [true, "Target URL is required"],
        validate: {
            validator: (v) => /^https?:\/\/.+/i.test(v || ""),
            message: "Target URL must be a valid http(s) link",
        },
    },
    proofInstructions: {
        type: String,
        default: "",
    },
    // What identity to ask the worker for — e.g. "Your YouTube channel name".
    accountLabel: {
        type: String,
        default: "",
    },
    requiresScreenshot: {
        type: Boolean,
        default: true,
    },
    requiresProofUrl: {
        type: Boolean,
        default: false,
    },
    proofQuestions: {
        type: [String],
        default: [],
    },
    targetQuantity: {
        type: Number,
        required: [true, "Target quantity is required"],
        min: [1, "Target quantity must be at least 1"],
    },
    // Gross — what the Provider pays per unit. Never shown to a worker.
    costPerUnit: {
        type: Number,
        required: [true, "Cost per unit is required"],
    },
    // Net — what the Worker earns per unit. Never shown to a provider.
    netPerUnit: {
        type: Number,
        required: true,
    },
    // Platform's cut per unit. Never shown to either side.
    feePerUnit: {
        type: Number,
        required: true,
    },
    // Snapshot of the global commission rate at creation time, so changing
    // the rate later never rewrites an in-flight task's arithmetic.
    commissionRate: {
        type: Number,
        required: true,
    },
    totalBudget: {
        type: Number,
        required: true,
    },
    // False until the provider's balance has actually been debited. Every
    // read query filters on this so a debited-but-not-yet-funded task (the
    // narrow window between steps 4 and 5 of task creation) is invisible.
    escrowFunded: {
        type: Boolean,
        default: false,
    },
    escrowHeld: {
        type: Number,
        default: 0,
    },
    escrowReleased: {
        type: Number,
        default: 0,
    },
    slotsRemaining: {
        type: Number,
        default: 0,
    },
    pendingCount: {
        type: Number,
        default: 0,
    },
    approvedCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["PENDING_APPROVAL", "ACTIVE", "REJECTED", "PAUSED", "COMPLETED", "CANCELLED"],
        default: "PENDING_APPROVAL",
    },
    rejectionReason: {
        type: String,
        default: "",
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    moderatedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    // Set once proof screenshots have been purged from S3 (see s3.js /
    // task.service.js purgeTaskMedia).
    mediaPurgedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// The worker feed: active, funded tasks with open slots, newest first.
marketTaskSchema.index({ status: 1, escrowFunded: 1, slotsRemaining: 1, createdAt: -1 });
// A provider's own task list.
marketTaskSchema.index({ provider: 1, createdAt: -1 });
// The admin moderation queue / all-tasks view.
marketTaskSchema.index({ status: 1, createdAt: -1 });

const MarketTask = mongoose.model("MarketTask", marketTaskSchema);

const attemptSchema = new mongoose.Schema({
    attempt: { type: Number, required: true },
    proof: { type: mongoose.Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, required: true },
    rejectionReason: { type: String, default: "" },
    reviewedAt: { type: Date },
}, { _id: false });

const taskSubmissionSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MarketTask",
        required: [true, "Task is required"],
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Worker is required"],
    },
    // Denormalised so the provider's inbox query never has to join the task.
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Provider is required"],
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "AUTO_APPROVED", "REJECTED", "REPORTED", "ADMIN_APPROVED"],
        default: "PENDING",
    },
    // Refreshed to now + autoApproveHours every time status becomes PENDING,
    // so a retry restarts the clock rather than inheriting the old deadline.
    autoApproveAt: {
        type: Date,
        required: true,
    },
    reminderSentAt: {
        type: Date,
        default: null,
    },
    // Snapshots taken at submit time. Never read through to the live task,
    // so editing a task's price can't rewrite the history of what was
    // already earned (the bug the old SocialWork.price had).
    grossAmount: {
        type: Number,
        required: true,
    },
    netAmount: {
        type: Number,
        required: true,
    },
    feeAmount: {
        type: Number,
        required: true,
    },
    // What is verified server-side for a gated (WATCH_SESSION / DWELL) task.
    creditedSeconds: {
        type: Number,
        default: null,
    },
    proof: {
        account: { type: String, default: "" },
        accountKey: { type: String },
        url: { type: String, default: "" },
        note: { type: String, default: "" },
        screenshots: { type: [String], default: [] },
        answers: [{ question: String, answer: String }],
    },
    proofMediaPurged: {
        type: Boolean,
        default: false,
    },
    attempt: {
        type: Number,
        default: 1,
    },
    attempts: {
        type: [attemptSchema],
        default: [],
    },
    rejectionReason: {
        type: String,
        default: "",
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reviewedAt: {
        type: Date,
    },
    reportReason: {
        type: String,
        default: "",
    },
    reportedAt: {
        type: Date,
    },
    reportResolution: {
        type: String,
        enum: ["UPHELD", "DISMISSED", null],
        default: null,
    },
    reportResolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reportResolvedAt: {
        type: Date,
    },
    fineAmount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// The hard guarantee against double-payment: one document per worker per
// task. A retry mutates this same document instead of creating a second one.
taskSubmissionSchema.index({ task: 1, worker: 1 }, { unique: true });
// Stops two worker accounts submitting the SAME handle to one task, which
// would have the provider paying twice for one subscriber. Partial, because
// WATCH/VISIT tasks collect no handle at all — without the partial filter
// every account-less submission on a task would collide on an absent key.
// (A `sparse` index does not do this: sparse only skips a document when
// EVERY indexed field is absent, and `task` is always present.)
taskSubmissionSchema.index(
    { task: 1, "proof.accountKey": 1 },
    { unique: true, partialFilterExpression: { "proof.accountKey": { $exists: true } } }
);
// Provider's review inbox, sorted by soonest auto-approve deadline.
taskSubmissionSchema.index({ provider: 1, status: 1, autoApproveAt: 1 });
// The auto-approve sweep — keeps a query that runs every 15 minutes off a
// collection scan.
taskSubmissionSchema.index({ status: 1, autoApproveAt: 1 });
// Admin report queue.
taskSubmissionSchema.index({ status: 1, createdAt: -1 });

const TaskSubmission = mongoose.model("TaskSubmission", taskSubmissionSchema);

module.exports = { MarketTask, TaskSubmission };
