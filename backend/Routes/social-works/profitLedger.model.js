const mongoose = require("mongoose");

const profitLedgerSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SocialWork",
        required: true,
        index: true,
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkSubmit",
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    grossAmount: {
        type: Number,
        required: true,
    },
    netAmount: {
        type: Number,
        required: true,
    },
    platformFee: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

const ProfitLedger = mongoose.model("ProfitLedger", profitLedgerSchema);

module.exports = ProfitLedger;
