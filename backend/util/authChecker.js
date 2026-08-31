const User = require("../Routes/User/user.model");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./jwtSecret");
const sessionService = require("../Routes/Session/session.service");

const authChecker = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: Missing or invalid authorization header" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.jti) {
            return res.status(401).json({ message: "Unauthorized: Session expired, please log in again" });
        }

        const session = await sessionService.loadLiveSession(decoded.jti);
        if (!session) {
            return res.status(401).json({ message: "Unauthorized: Session ended" });
        }
        if (String(session.user) !== String(decoded.id)) {
            return res.status(401).json({ message: "Unauthorized: Session mismatch" });
        }
        sessionService.touchSession(session);
        req.session = session;
        req.sessionId = String(session._id);

        const user = await User.findOne({ _id: decoded.id }).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        }
        return res.status(401).json({ message: "Unauthorized: Authentication failed" });
    }
};

module.exports = authChecker;
