/**
 * Reusable role authorization middleware.
 * Usage: router.get('/admin-only', authChecker, roleChecker(['admin']), controllerMethod)
 */
const roleChecker = (allowedRoles = ['admin']) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User context missing" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to perform this action"
            });
        }

        next();
    };
};

module.exports = roleChecker;
