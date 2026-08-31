const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Trainer name is required"],
        },
        title: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        time: {
            type: String,
            default: "",
        },
        whatsapp: {
            type: String,
            default: "",
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

const Trainer = mongoose.model("Trainer", trainerSchema);
module.exports = Trainer;
