const mongoose = require("mongoose");
const Session = require("./session.model");
const { describeRequest } = require("../../util/requestContext");

// Must match the token lifetime in util/tokenGenerator.
const SESSION_DAYS = 30;
// How many devices one account may be signed in on at once. A fourth login does
// not fail — it evicts the least recently started session so the person is never
// locked out of the device in their hand.
const MAX_ACTIVE_SESSIONS = 3;
// How long an ended session stays visible in the history list.
const RETENTION_DAYS = 90;
// `lastActiveAt` is only rewritten once the stored value is this stale, so an
// authenticated request doesn't turn into a database write every time.
const ACTIVITY_THROTTLE_MS = 5 * 60 * 1000;

const days = (n) => n * 24 * 60 * 60 * 1000;

/**
 * Records a new sign-in and returns the session document.
 *
 * Called before the token is signed so the session's `_id` can be embedded in it.
 */
const startSession = async (req, userId, loginMethod = "password") => {
    const now = Date.now();
    const context = describeRequest(req);
    const session = await Session.create({
        ...context,
        user: userId,
        loginMethod,
        lastActiveAt: new Date(now),
        expiresAt: new Date(now + days(SESSION_DAYS)),
        purgeAt: new Date(now + days(RETENTION_DAYS)),
    });

    // Enforced after the row exists so the new device is counted, and so it is
    // the survivor rather than a candidate for eviction.
    const evicted = await enforceDeviceLimit(userId, session._id);
    return { session, evicted };
};

/**
 * Holds an account to MAX_ACTIVE_SESSIONS live devices.
 *
 * Keeps the most recently started sessions and revokes the rest. Ordering is by
 * `createdAt` — when the device signed in — not `lastActiveAt`, so a device that
 * merely sat idle isn't punished ahead of one that logged in long ago.
 */
const enforceDeviceLimit = async (userId, protectSessionId) => {
    const live = await Session.find({
        user: userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    })
        .sort({ createdAt: -1 })
        .select("_id");

    if (live.length <= MAX_ACTIVE_SESSIONS) return [];

    const evicted = live
        .slice(MAX_ACTIVE_SESSIONS)
        .map((s) => String(s._id))
        // The session being created is newest and so always inside the keep set;
        // this guards the case where two logins land in the same millisecond.
        .filter((id) => id !== String(protectSessionId));

    if (!evicted.length) return [];

    await Session.updateMany(
        { _id: { $in: evicted } },
        { revokedAt: new Date(), revokedBy: "limit" }
    );
    return evicted;
};

/**
 * Loads a session for authentication.
 *
 * Returns null for anything that must not authenticate — unknown id, revoked, or
 * past its expiry — so the caller can treat null as a flat 401.
 */
const loadLiveSession = async (sessionId) => {
    if (!mongoose.isValidObjectId(sessionId)) return null;
    const session = await Session.findById(sessionId);
    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt <= new Date()) return null;
    return session;
};

const touchSession = async (session) => {
    const now = Date.now();
    if (now - new Date(session.lastActiveAt).getTime() < ACTIVITY_THROTTLE_MS) return;
    // Fire-and-forget: a failed heartbeat must never fail the request it rode in on.
    Session.updateOne({ _id: session._id }, { lastActiveAt: new Date(now) }).catch(() => {});
};

const revokeSession = async (sessionId, actor = "user") => {
    const session = await Session.findById(sessionId);
    if (!session) return null;
    if (session.revokedAt) return session; // already ended; revoking again is a no-op
    session.revokedAt = new Date();
    session.revokedBy = actor;
    await session.save();
    return session;
};

/**
 * Ends every live session for a user except the one they are calling from.
 */
const revokeOtherSessions = async (userId, keepSessionId) => {
    const filter = {
        user: userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    };
    if (keepSessionId) filter._id = { $ne: keepSessionId };

    const doomed = await Session.find(filter).select("_id");
    if (!doomed.length) return { revoked: 0, ids: [] };

    await Session.updateMany(filter, { revokedAt: new Date(), revokedBy: "user" });
    return { revoked: doomed.length, ids: doomed.map((s) => s._id.toString()) };
};

/**
 * Ends every live session for a user, the caller's own included.
 *
 * Distinct from revokeOtherSessions: this one signs the caller out too, so the
 * client must clear its token afterwards.
 */
const revokeAllSessions = async (userId) => {
    const filter = {
        user: userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    };
    const doomed = await Session.find(filter).select("_id");
    if (!doomed.length) return { revoked: 0, ids: [] };

    await Session.updateMany(filter, { revokedAt: new Date(), revokedBy: "user" });
    return { revoked: doomed.length, ids: doomed.map((s) => String(s._id)) };
};

// Shape sent to the client. The raw user-agent is deliberately withheld — it adds
// nothing the parsed fields don't already say.
const present = (session, currentSessionId, now = new Date()) => ({
    _id: session._id,
    device: session.device,
    ip: session.ip,
    loginMethod: session.loginMethod,
    status: session.statusAt(now),
    isCurrent: String(session._id) === String(currentSessionId),
    lastActiveAt: session.lastActiveAt,
    createdAt: session.createdAt,
    revokedAt: session.revokedAt,
    revokedBy: session.revokedBy,
});

const listSessions = async (userId, currentSessionId) => {
    const now = new Date();
    const sessions = await Session.find({ user: userId }).sort({ lastActiveAt: -1 }).limit(100);
    const rows = sessions.map((s) => present(s, currentSessionId, now));

    const active = rows.filter((r) => r.status === "active");
    const ended = rows.filter((r) => r.status !== "active");

    return {
        active,
        ended,
        summary: {
            activeCount: active.length,
            endedCount: ended.length,
            maxDevices: MAX_ACTIVE_SESSIONS,
            // The newest sign-in, which is what "Last Login" means to a reader —
            // not the newest activity.
            lastLoginAt: rows.length
                ? rows.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt
                : null,
        },
    };
};

module.exports = {
    startSession,
    enforceDeviceLimit,
    loadLiveSession,
    touchSession,
    revokeSession,
    revokeOtherSessions,
    revokeAllSessions,
    listSessions,
    SESSION_DAYS,
    MAX_ACTIVE_SESSIONS,
};
