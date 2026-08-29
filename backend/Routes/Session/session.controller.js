const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const sessionService = require("./session.service");
const Session = require("./session.model");

// Every route here is scoped to the caller's own sessions. Letting one account
// list or end another's would turn this page into an account-takeover tool.

const listMine = async (req, res) => {
    try {
        const result = await sessionService.listSessions(req.user._id, req.sessionId);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const revokeOne = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).send({ message: "Session not found" });
        }
        if (String(session.user) !== String(req.user._id)) {
            return res.status(403).send({ message: "Forbidden: That session is not yours" });
        }

        await sessionService.revokeSession(req.params.id, "user");
        req.app.get("endSessions")?.([req.params.id], req.user._id);

        res.send({
            message: "Device logged out",
            // The client needs to know whether it just signed *itself* out, so it
            // can drop the cookie and send the user to the login screen.
            wasCurrent: String(req.params.id) === String(req.sessionId),
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const revokeOthers = async (req, res) => {
    try {
        const { revoked, ids } = await sessionService.revokeOtherSessions(
            req.user._id,
            req.sessionId
        );
        if (ids.length) req.app.get("endSessions")?.(ids, req.user._id);

        res.send({
            message:
                revoked === 0
                    ? "No other devices were signed in"
                    : `Signed out of ${revoked} other ${revoked === 1 ? "device" : "devices"}`,
            revoked,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const revokeAll = async (req, res) => {
    try {
        const { revoked, ids } = await sessionService.revokeAllSessions(req.user._id);
        if (ids.length) req.app.get("endSessions")?.(ids, req.user._id);

        res.send({
            message:
                revoked === 0
                    ? "No devices were signed in"
                    : `Signed out of ${revoked} ${revoked === 1 ? "device" : "devices"}`,
            revoked,
            // Always true in practice — the caller's own session is in the set —
            // but stated explicitly so the client knows to drop its token.
            wasCurrent: true,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

router.get("/", authChecker, listMine);
router.post("/revoke-others", authChecker, revokeOthers);
router.post("/revoke-all", authChecker, revokeAll);
router.delete("/:id", authChecker, revokeOne);

module.exports = router;
