const mongoose = require("mongoose");

const referSchema = new mongoose.Schema({
    reffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reffer is required"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    gen: {
        type: Number,
        required: [true, "Generation is required"],
    },
    commition: {
        type: Number,
        required: [true, "Commition is required"],
    }
}, { timestamps: true });

const Refer = mongoose.model("Refer", referSchema);
module.exports = Refer