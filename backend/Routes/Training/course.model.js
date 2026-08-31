const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
        },
        subtitle: {
            type: String,
            default: "",
        },
        lessons: {
            type: String,
            default: "",
        },
        level: {
            type: String,
            default: "",
        },
        icon: {
            type: String,
            default: "💻",
        },
        bg: {
            type: String,
            default: "from-purple-600 via-indigo-600 to-purple-800",
        },
        tagColor: {
            type: String,
            default: "bg-purple-50 text-[#5a32fa]",
        },
        videoUrl: {
            type: String,
            default: "",
        },
        topics: {
            type: [String],
            default: [],
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

const TrainingCourse = mongoose.model("TrainingCourse", courseSchema);
module.exports = TrainingCourse;
