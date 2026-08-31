const mongoose = require("mongoose");

const quickActionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Quick action title is required"],
        },
        subtitle: {
            type: String,
            default: "",
        },
        to: {
            type: String,
            default: "#",
        },
        icon: {
            type: String,
            default: "play",
        },
        color: {
            type: String,
            default: "#5a32fa",
        },
        bg: {
            type: String,
            default: "bg-purple-50",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const QuickAction = mongoose.model("QuickAction", quickActionSchema);
module.exports = QuickAction;
