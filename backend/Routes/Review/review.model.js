const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      default: "user",
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "Dhaka",
    },
    featured: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending"],
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
