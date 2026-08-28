const mongoose = require("mongoose");

const externalSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, "Withdraw amount is required"],
        min: [1, "Withdraw amount must be greater than 0"],
    },
    status: {
        type: String,
        enum: ["pending", "completed", "rejected"],
        default: "pending",
    },
    video: {
        type: String,
        required: [true, "Video  is required"],
    },
    image: {
        type: String,
        required: [true, "Screenshot is required"],
    },
    method: {
        type: String,
        required: [true, "Withdraw method is required"],
    },
    account: {
        type: String,
        required: [true, "Account is required"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    }
}, { timestamps: true });

const External = mongoose.model("External", externalSchema);
module.exports = External