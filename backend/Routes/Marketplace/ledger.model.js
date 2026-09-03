const mongoose = require("mongoose");

// Append-only audit trail for every money movement the marketplace makes,
// modelled on `Refer` (the codebase's only other ledger-shaped collection).
// Total platform profit = sum(amount) where type in (PLATFORM_FEE, PROVIDER_FINE).
const platformLedgerSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["ESCROW_HOLD", "ESCROW_REFUND", "WORKER_PAYOUT", "PLATFORM_FEE", "PROVIDER_FINE"],
        required: [true, "Ledger type is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MarketTask",
    },
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskSubmission",
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    note: {
        type: String,
        default: "",
    },
}, { timestamps: true });

// Revenue reporting: sum by type over a time window.
platformLedgerSchema.index({ type: 1, createdAt: -1 });
// Reconciliation: every ledger row touching one task.
platformLedgerSchema.index({ task: 1 });

const PlatformLedger = mongoose.model("PlatformLedger", platformLedgerSchema);

module.exports = PlatformLedger;
