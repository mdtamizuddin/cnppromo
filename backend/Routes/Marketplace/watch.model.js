const mongoose = require("mongoose");

/**
 * Backs the server-verified timer for WATCH_SESSION / DWELL gated tasks.
 *
 * The client's reported watch time is never trusted. Each ping credits at
 * most the real wall-clock time elapsed since the previous ping, so
 * `creditedSeconds` can never exceed real elapsed time no matter what the
 * client sends — that clamp is what makes the timer unforgeable.
 */
const watchSessionSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MarketTask",
        required: true,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    lastPingAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    creditedSeconds: {
        type: Number,
        default: 0,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    // Mongo drops the document on its own once this passes — same TTL idiom
    // as Session.purgeAt.
    purgeAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

// One live session per worker per task.
watchSessionSchema.index({ task: 1, worker: 1 }, { unique: true });
watchSessionSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });

const WatchSession = mongoose.model("WatchSession", watchSessionSchema);

module.exports = WatchSession;
