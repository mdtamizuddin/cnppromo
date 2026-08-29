const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./jwtSecret");

/**
 * Signs a 30-day access token.
 *
 * `sessionId` becomes the token's `jti`, tying it to one row in the sessions
 * collection. That link is what lets a single device be signed out; without it
 * every token for a user is interchangeable and only rotating JWT_SECRET — which
 * signs everyone out at once — can revoke anything.
 *
 * It stays optional so callers that genuinely have no session (none today) still
 * work, and so this file has no import cycle back into the session service.
 */
const tokenGenerator = (user, sessionId) => {
    const payload = {
        id: user._id,
        role: user.role
    };
    if (sessionId) payload.jti = String(sessionId);

    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

module.exports = tokenGenerator;
