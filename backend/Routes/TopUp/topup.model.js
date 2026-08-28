const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, "Withdraw amount is required"],
    },
    status: {
        type: String,
        enum: ["pending", "completed", "rejected"],
        default: "pending",
    },
    method: {
        type: String,
        required: [true, "Withdraw method is required"],
    },
    account: {
        type: String,
        required: [true, "Account is required"],
    },
    currency: {
        type: String,
        default: "bdt"
    },
    trx: {
        type: String,
        required: [true, "Transection Id is required"],
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

const Withdraw = mongoose.model("Topup", withdrawSchema);
module.exports = Withdraw