const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Setting name is required"],
    },
    siteName: {
        type: String,
        required: [true, "Setting siteName is required"],
    },
    siteLogo: {
        type: String,
        default: ""
    },
    ref_comm: {
        gen1: {
            type: Number,
            default: 20
        },
        gen2: {
            type: Number,
            default: 10
        },
        gen3: {
            type: Number,
            default: 5
        },
        gen4: {
            type: Number,
            default: 1
        },
        gen5: {
            type: Number,
            default: 1
        },
        gen6: {
            type: Number,
            default: 1
        },
    },
    accounts: {
        phone: {
            type: String
        },
        whatsapp: {
            type: String
        },
        email: {
            type: String
        },
        bkash: {
            type: String
        },
        nagad: {
            type: String
        },
        rocket: {
            type: String
        },
        upay: {
            type: String
        },
        payeer: {
            type: String
        }
    },
    links: {
        whatsapp: {
            type: String
        },
        telegram: {
            type: String
        },
        facebook: {
            type: String
        },
        page: {
            type: String
        },
        video: {
            type: String
        },
        supportMessanger: {
            type: String
        }
    },
    register: {
        type: Boolean,
        default: true
    },
    ht_video:{
        type: String
    },
    acAmm:{
        type: String
    },

    withdraw: {
        type: Boolean,
        default: true
    },
    copyright: {
        type: String
    },
    notice: {
        type: String
    },
    bonus: {
        amount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        active: {
            type: Boolean,
            default: false
        }
    },
    // Task marketplace config. NEVER returned by the public GET /setting
    // endpoint (see getSetting.js) — commissionRate must stay invisible to
    // workers. Read/written by admins through /tasks/admin/config instead.
    marketplace: {
        enabled: {
            type: Boolean,
            default: true
        },
        commissionRate: {
            type: Number,
            default: 10,
            min: 0,
            max: 90
        },
        autoApproveHours: {
            type: Number,
            default: 72,
            min: 1
        },
        reportWindowHours: {
            type: Number,
            default: 72,
            min: 0
        },
        maxAttempts: {
            type: Number,
            default: 2,
            min: 1
        },
    },
}, {
    timestamps: true
});
const Setting = mongoose.model("Setting", settingSchema);
module.exports = Setting;
