const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Work name is required"],
    },
    desc: {
        type: String,
        required: [true, "Work description is required"],
    },
    category: {
        type: String,
        required: [true, "Work category is required"],
    },
    link: {
        type: String,
        required: [true, "Work link is required"],
    }
},{
    timestamps: true
})

const Work = mongoose.model("Work", workSchema);
module.exports = Work;