const mongoose = require("mongoose");

/**
 * One sign-in on one device.
 *
 * The session id is minted before the token so it can be embedded as the token's
 * `jti`. That is what makes "log out this device" possible at all: without a
 * per-session identity every token for a user is interchangeable, and the only
 * way to revoke one is to rotate the signing secret for the whole site.
 */
const SessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userAgent: { type: String, default: "" },
        device: {
            kind: { type: String, default: "desktop" },
            name: { type: String, default: "Unknown device" },
            os: { type: String, default: "Unknown OS" },
            browser: { type: String, default: "Unknown browser" },
        },
        ip: { type: String, default: "unknown" },
        loginMethod: {
            type: String,
            enum: ["password", "register", "root-bypass"],
            default: "password",
        },
        lastActiveAt: { type: Date, default: Date.now },

        // Set when the session is ended early. Presence of this field, not a
        // status string, is what marks a session dead — a stored status would
        // drift out of sync with the token's real validity.
        revokedAt: { type: Date, default: null },
        revokedBy: {
            type: String,
            // "limit" marks a session the device cap evicted rather than one the
            // user ended, so the history can say why it ended.
            enum: ["user", "admin", "limit", null],
            default: null,
        },

        // When the token itself stops verifying.
        expiresAt: { type: Date, required: true },
        // When the *record* stops being interesting. Kept well past expiry so the
        // "Logged out devices" history survives; a TTL on expiresAt would erase
        // the history this page exists to show.
        purgeAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Serves the listing: a user's sessions, most recently used first.
SessionSchema.index({ user: 1, lastActiveAt: -1 });
// Housekeeping. Mongo drops the document once purgeAt passes.
SessionSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

// Derived rather than stored, for the reason above.
SessionSchema.methods.statusAt = function (now = new Date()) {
    if (this.revokedAt) return "logged_out";
    if (this.expiresAt <= now) return "expired";
    return "active";
};

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;
