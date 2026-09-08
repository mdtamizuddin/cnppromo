const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider ID is required"],
      index: true,
    },
    platform: {
      type: String,
      enum: [
        "youtube",
        "facebook",
        "tiktok",
        "instagram",
        "telegram",
        "twitter",
        "website",
        "other",
      ],
      default: "other",
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        "subscribe",
        "like",
        "comment",
        "watch_time",
        "join_group",
        "share_repost",
        "custom",
      ],
      default: "custom",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Work title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    taskUrl: {
      type: String,
      default: "",
      trim: true,
    },
    url: {
      type: String,
      default: "",
      trim: true,
    },
    // Dynamic Action Properties
    properties: {
      watchDuration: { type: Number, default: 0, min: 0 },
      customCommentText: { type: String, default: null, trim: true },
      channelOrAccountName: { type: String, default: null, trim: true },
      groupName: { type: String, default: null, trim: true },
      additionalInstructions: { type: String, default: "", trim: true },
    },
    // Dynamic Proof Configuration
    proofConfig: {
      requireText: { type: Boolean, default: true },
      textPrompt: {
        type: String,
        default: "Enter your username / proof details",
        trim: true,
      },
      requireScreenshot: { type: Boolean, default: true },
      screenshotCount: { type: Number, default: 1, min: 1, max: 3 },
      screenshotLabels: [{ type: String, trim: true }],
    },
    // Escrow & Quantities
    targetQuantity: {
      type: Number,
      required: [true, "Target quantity is required"],
      default: 1,
      min: [1, "Target quantity must be at least 1"],
    },
    completedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Completed quantity cannot be negative"],
    },
    costPerUnit: {
      type: Number,
      required: [true, "Cost per unit is required"],
      default: 0,
      min: [0.01, "Cost per unit must be at least 0.01 BDT"],
    },
    totalBudget: {
      type: Number,
      required: true,
      min: [0, "Total budget cannot be negative"],
    },
    escrowRemaining: {
      type: Number,
      required: true,
      min: [0, "Escrow remaining cannot be negative"],
    },
    // Legacy support fields
    duration: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    questions: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL",
        "ACTIVE",
        "REJECTED",
        "PAUSED",
        "COMPLETED",
        "CANCELLED",
        "active",
        "inactive",
      ],
      default: "PENDING_APPROVAL",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    maxRetries: {
      type: Number,
      default: 1,
      min: [0, "Max retries cannot be negative"],
      max: [3, "Max retries cannot exceed 3"],
    },
    workers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for standard query access patterns
workSchema.index({ status: 1, createdAt: -1 });
workSchema.index({ providerId: 1, createdAt: -1 });
workSchema.index({ platform: 1, status: 1 });
workSchema.index({ workers: 1 });

const workSubmitSchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialWork",
      required: [true, "Work ID is required"],
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    // Dynamic Proof Data
    proofData: {
      text: { type: String, default: "", trim: true, maxlength: 1000 },
      screenshots: [{ type: String, trim: true }],
      watchedSeconds: { type: Number, default: 0 },
    },
    // Legacy support
    answers: {
      type: Array,
      default: [],
    },
    duration: {
      type: Number,
      default: 0,
    },
    // Financial Ledger Snapshots (Frozen at submission / approval time)
    grossAmount: {
      type: Number,
      required: true,
      min: [0, "Gross amount cannot be negative"],
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: [0, "Net amount cannot be negative"],
      default: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: [0, "Platform fee cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "rejected",
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for submission queries
workSubmitSchema.index({ workId: 1, status: 1, createdAt: -1 });
workSubmitSchema.index({ providerId: 1, status: 1, createdAt: -1 });
workSubmitSchema.index({ userId: 1, createdAt: -1 });
workSubmitSchema.index(
  { workId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["PENDING", "pending"] } },
  }
);

const Work = mongoose.model("SocialWork", workSchema);
const WorkSubmit = mongoose.model("WorkSubmit", workSubmitSchema);

module.exports = {
  Work,
  WorkSubmit,
};