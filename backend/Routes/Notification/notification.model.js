const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Notification user is required"],
    },
    category: {
        type: String,
        enum: ["payments", "referrals", "tasks", "system", "levels", "security"],
        default: "system",
    },
    type: {
        type: String,
        default: "info",
    },
    title: {
        type: String,
        required: [true, "Notification title is required"],
    },
    message: {
        type: String,
        default: "",
    },
    link: {
        type: String,
        default: "",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;