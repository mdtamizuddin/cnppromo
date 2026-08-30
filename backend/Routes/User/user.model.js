const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        minlength: 5,
        required: [true, "Username is required (minimum 5 characters)"],
    },
    
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
    },
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["pending", "active", "inactive"],
        default: "pending",
    },
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male"
    },
    education: {
        type: String,
       default: "Other"
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minlength: 6,
    },
    paymentMethod: {
        type: String,
        default: "Bkash"
    },
    account: {
        type: String,
        default: "0000000"
    },
    trx: {
        type: String,
        default: "ERROR"
    },
    time: {
        type: Date,
        default: Date.now
    },
    reffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    fbId: {
        type: String,
        required: [true, "Facebook ID is required"],
    },
    balance: {
        type: Number,
        default: 0
    },
    lock: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: false
    },
    lastActive: {
        type: Date
    },
    level: {
        type: Number,
        default: 1
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    deletedAt: {
        type: Date,
        default: null,
    },
    activatedAt: {
        type: Date,
        default: null,
    },
    notificationsEnabled: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Soft-delete: automatically exclude deleted users from ALL read queries.
// A deleted user is NEVER returned by any API (admin included).
// Restore/update is only possible via direct database (set deletedAt: null).
userSchema.index({ deletedAt: 1 });
userSchema.pre(["find", "findOne", "countDocuments", "distinct"], function () {
    const query = this.getQuery();
    if (query.deletedAt === undefined && !this.options?.withDeleted) {
        this.setQuery({ ...query, deletedAt: null });
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
