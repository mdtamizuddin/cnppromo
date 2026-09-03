const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        minlength: [4, "Username must be at least 4 characters"],
        maxlength: [20, "Username cannot exceed 20 characters"],
        required: [true, "Username is required"],
        validate: {
            validator: function (v) {
                if (!v) return false;
                const clean = v.trim().toLowerCase();
                if (clean.length < 4 || clean.length > 20) return false;
                if (clean.includes("@") || clean.includes(" ") || clean.includes("__") || clean.includes("--")) return false;
                return /^[a-z0-9][a-z0-9_-]{2,18}[a-z0-9]$/.test(clean);
            },
            message: "Username must be 4-20 characters long, start and end with a letter or number, and only contain letters, numbers, underscores, and hyphens (no email addresses or spaces allowed)."
        }
    },
    
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                if (!v) return false;
                return !v.includes(" ") && !/\s/.test(v);
            },
            message: "Email cannot contain spaces."
        }
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
    avatar: {
        type: String,
        default: "",
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
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return false;
                return !v.includes(" ") && !/\s/.test(v);
            },
            message: "Phone number cannot contain spaces."
        }
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
    paymentAccounts: [{
        gatewayId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gateway",
        },
        gatewayName: {
            type: String,
            trim: true,
        },
        accountNumber: {
            type: String,
            trim: true,
        },
    }],
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
    maxActiveSessions: {
        type: Number,
        default: 5,
        min: 1,
        max: 20,
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
