const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "admin_credit",
        "admin_debit",
        "admin_adjustment",
        "topup",
        "withdraw",
        "referral",
        "task",
        "bonus",
        "other",
      ],
      default: "admin_adjustment",
    },
    title: {
      type: String,
      required: true,
      default: "Admin Balance Adjustment",
    },
    note: {
      type: String,
      default: "",
    },
    trxId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    balanceBefore: {
      type: Number,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "rejected", "failed"],
      default: "completed",
      index: true,
    },
    method: {
      type: String,
      default: "",
    },
    account: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    referenceId: {
      type: String,
      sparse: true,
      index: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gen: {
      type: Number,
    },
    taskTitle: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1, createdAt: -1 });
transactionSchema.index({ user: 1, category: 1, createdAt: -1 });
transactionSchema.index({ user: 1, referenceId: 1 }, { sparse: true });

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
