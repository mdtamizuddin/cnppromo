const activeChecker = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    // Admins and moderators are always privileged
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
        return next();
    }

    // Check admin-approved active status
    const isApprovedActive = req.user.status === 'active';
    if (!isApprovedActive) {
        return res.status(403).json({
            message: "Forbidden: Account is inactive and pending admin activation.",
            status: "pending_approval"
        });
    }

    next();
};

module.exports = activeChecker;
