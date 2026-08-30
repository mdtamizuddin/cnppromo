const mongoose = require("mongoose");

const paymentProofSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["bKash", "Nagad", "Rocket", "Bank", "Binance / USDT", "Other"],
      default: "bKash",
    },
    amount: {
      type: Number,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    trxId: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("bn-BD"),
    },
    note: {
      type: String,
      default: "পেমেন্ট সফলভাবে সম্পন্ন হয়েছে",
    },
    featured: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: "পেমেন্ট সফল",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaymentProof", paymentProofSchema);
