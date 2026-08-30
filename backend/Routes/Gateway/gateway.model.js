const mongoose = require("mongoose");

const gatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subName: {
      type: String,
      default: "(Personal)",
      trim: true,
    },
    type: {
      type: String,
      enum: ["Mobile Banking", "Bank", "Online Payment", "Crypto", "Other"],
      default: "Mobile Banking",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    currency: {
      type: String,
      default: "BDT",
      trim: true,
    },
    fee: {
      type: String,
      default: "1.50%",
      trim: true,
    },
    accountName: {
      type: String,
      default: "CNP PROMO",
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    minAmount: {
      type: Number,
      default: 10,
    },
    maxAmount: {
      type: Number,
      default: 50000,
    },
    dailyLimit: {
      type: Number,
      default: 200000,
    },
    instructions: {
      type: String,
      default: "Send money to this account and submit the transaction ID.",
    },
    icon: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gateway", gatewaySchema);
