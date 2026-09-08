const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    platform: {
        type: String,
        enum: ["youtube", "facebook", "tiktok", "instagram", "telegram", "twitter", "website", "other"],
        default: "other",
    },
    actionType: {
        type: String,
        enum: ["subscribe", "like", "comment", "watch_time", "join_group", "share_repost", "custom"],
        default: "custom",
    },
    title: {
        type: String,
        required: [true, "Work title is required"],
    },
    description: {
        type: String,
        default: "",
    },
    taskUrl: {
        type: String,
        default: "",
    },
    url: {
        type: String,
        default: "",
    },
    // Dynamic Action Properties
    properties: {
        watchDuration: { type: Number, default: 0 },
        customCommentText: { type: String, default: null },
        channelOrAccountName: { type: String, default: null },
        groupName: { type: String, default: null },
        additionalInstructions: { type: String, default: "" },
    },
    // Dynamic Proof Requirements
    proofConfig: {
        requireText: { type: Boolean, default: true },
        textPrompt: { type: String, default: "Enter your username / proof details" },
        requireScreenshot: { type: Boolean, default: true },
        screenshotCount: { type: Number, default: 1, min: 1, max: 3 },
        screenshotLabels: [{ type: String }],
    },
    // Escrow & Quantities
    targetQuantity: {
        type: Number,
        default: 1,
        min: 1,
    },
    completedQuantity: {
        type: Number,
        default: 0,
    },
    costPerUnit: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalBudget: {
        type: Number,
        default: 0,
    },
    escrowRemaining: {
        type: Number,
        default: 0,
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
        enum: ["PENDING_APPROVAL", "ACTIVE", "REJECTED", "COMPLETED", "CANCELLED", "active", "inactive"],
        default: "PENDING_APPROVAL",
    },
    rejectionReason: {
        type: String,
        default: null,
    },
    workers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    }
}, {
    timestamps: true
});

const workSubmitSchema = new mongoose.Schema({
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
        text: { type: String, default: "" },
        screenshots: [{ type: String }],
        watchedSeconds: { type: Number, default: 0 },
    },
    // Legacy support answers
    answers: {
        type: Array,
        default: [],
    },
    duration: {
        type: Number,
        default: 0,
    },
    // Financial Breakdown
    grossAmount: {
        type: Number,
        default: 0,
    },
    netAmount: {
        type: Number,
        default: 0,
    },
    platformFee: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "rejected", "PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    rejectionReason: {
        type: String,
        default: null,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true
});

const Work = mongoose.model("SocialWork", workSchema);
const WorkSubmit = mongoose.model("WorkSubmit", workSubmitSchema);

module.exports = {
    Work,
    WorkSubmit
};