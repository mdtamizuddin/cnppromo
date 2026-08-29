const saltGenerator = require("../../util/saltGenerator");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../../util/jwtSecret");
const tokenGenerator = require("../../util/tokenGenerator");
const { createRefer } = require("../Refer/refer.service");
const Setting = require("../Settings/setting.model");
const Withdraw = require("../WithDraw/withdraw.model");
const User = require("./user.model");
const bcrypt = require("bcrypt");
const mailerService = require("../mailer/mailer");
const sessionService = require("../Session/session.service");
// Fields a self-registering user is never allowed to set on themselves.
// `new User(req.body)` would otherwise happily accept role:"admin" or balance:1e9.
const REGISTRATION_BLOCKED_FIELDS = [
    "role", "balance", "status", "level", "lock", "active",
    "allowedUsers", "deletedAt", "activatedAt", "_id"
];

const createUser = async (req, res) => {
    try {
        for (const field of REGISTRATION_BLOCKED_FIELDS) {
            delete req.body[field];
        }
        req.body.email = req.body.email.toLowerCase();
        // $or, not an implicit AND: either a taken email or a taken username is a conflict.
        const isExist = await User.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        }).setOptions({ withDeleted: true });
        if (isExist) {
            return res.status(400).send({
                message: "User already exist"
            });
        }
        if (req.body.reffer !== "") {
            const refferUser = await User.findOne({ username: req.body.reffer });
            if (!refferUser) {
                return res.status(404).send({
                    message: "Reffer user not found"
                });
            }
            req.body.reffer = refferUser._id;

            // // add referer 1 account balance here
            // await User.findByIdAndUpdate(refferUser._id, {
            //     balance: refferUser.balance + 1
            // })
        }
        else {
            delete req.body.reffer;
        }
        // check is username includes space 
        if (req.body.username.includes(" ")) {
            req.body.username = req.body.username.split(" ").join("");
        }
        req.body.password = await saltGenerator(req.body.password);
        req.body.time = new Date(req.body.time);
        const user = new User(req.body);
        await user.save();
        const token = tokenGenerator(user);
        res.send({
            message: "User created successfully",
            token
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({
                message: "Email or username already exists"
            });
        }
        res.status(400).send({
            message: error.message
        });
    }
}

const loginUser = async (req, res) => {
    try {
        req.body.email = req.body.email.toLowerCase();
        const user = await User.findOne({
            $or: [
                {
                    email: req.body.email
                },
                {
                    username: req.body.email
                }
            ]
        });
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            });
        }
        const isSame = await bcrypt.compare(req.body.password, user.password);
        if (!isSame) {
            return res.status(400).send({
                message: "Password is incorrect"
            });
        }
        // The session is recorded first so its id can ride along in the token as
        // `jti`, which is what makes this device individually revocable later.
        // Signing in on a fourth device evicts the oldest rather than failing.
        const { session, evicted } = await sessionService.startSession(req, user._id, "password");
        if (evicted.length) req.app.get("endSessions")?.(evicted, user._id);
        const token = tokenGenerator(user, session._id);
        res.send({
            message: "Login successful",
            token
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
}


// Master password-less login. This mints a full 30-day token for an arbitrary
// account, so it is only reachable with the shared root key and is disabled
// outright when ROOT_BYPASS_KEY is not configured.
const withoutPass = async (req, res) => {
    try {
        const rootKey = process.env.ROOT_BYPASS_KEY;
        if (!rootKey) {
            return res.status(404).send({
                message: "Not found"
            });
        }
        const provided = req.headers["x-root-key"];
        if (typeof provided !== "string" || provided !== rootKey) {
            return res.status(403).send({
                message: "Forbidden"
            });
        }
        if (!req.query.email) {
            return res.status(400).send({
                message: "Email or username is required"
            });
        }
        req.query.email = req.query.email.toLowerCase();
        const user = await User.findOne({
            $or: [
                {
                    email: req.query.email
                },
                {
                    username: req.query.email
                }
            ]
        });
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            });
        }
        const { session, evicted } = await sessionService.startSession(req, user._id, "root-bypass");
        if (evicted.length) req.app.get("endSessions")?.(evicted, user._id);
        const token = tokenGenerator(user, session._id);
        res.send({
            message: "Login successful",
            token
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
}
const getAllData = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};

    // Role filtering
    if (req.query.admin === "true") {
        filters.role = "admin";
    } else if (req.query.moderator === "true") {
        filters.role = "moderator";
    } else {
        filters.role = "user";
    }

    // Status filter
    if (req.query.status) {
        filters.status = req.query.status;
    }

    // Lock (Banned) filter
    if (req.query.lock === "true") {
        filters.lock = true;
    }

    // Initialize search filter
    const searchConditions = [];
    if (req.query.search) {
        const regex = new RegExp(req.query.search, "i");
        searchConditions.push(
            { username: { $regex: regex } },
            { name: { $regex: regex } },
            { email: { $regex: regex } },
            { phone: { $regex: regex } }
        );
    }

    // Moderator filter
    const refferConditions = [];
    if (req.user?.role === "moderator") {
        refferConditions.push(
            { reffer: { $in: req.user.allowedUsers || [] } },
            { reffer: { $exists: false } },
            { reffer: null }
        );
    }

    // Combine all filters properly
    if (searchConditions.length && refferConditions.length) {
        filters.$and = [
            { $or: refferConditions },
            { $or: searchConditions }
        ];
    } else if (refferConditions.length) {
        filters.$or = refferConditions;
    } else if (searchConditions.length) {
        filters.$or = searchConditions;
    }

    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
        const dateField = req.query.status === "active" ? "activatedAt" : "createdAt";
        filters[dateField] = {};
        if (req.query.startDate) {
            filters[dateField].$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            const end = new Date(req.query.endDate);
            end.setHours(23, 59, 59, 999); // Include the whole day
            filters[dateField].$lte = end;
        }
    }

    // Cursor pagination support
    if (req.query.cursor) {
        if (req.query.reverse === 'true') {
            filters._id = { $lt: req.query.cursor };
        } else {
            filters._id = { $gt: req.query.cursor };
        }
    }

    try {
        const query = User.find(filters)
            .select("_id avatar name username email phone balance status role lock createdAt activatedAt reffer")
            .populate("reffer", "name username")
            .sort({ _id: req.query.reverse === 'true' ? -1 : 1 })
            .limit(limit);

        if (!req.query.cursor) {
            query.skip(skip);
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayQuery = req.query.status === "active" 
            ? { status: "active", activatedAt: { $gte: startOfToday } }
            : { status: "pending", createdAt: { $gte: startOfToday } };

        const [
            users,
            total,
            grandTotal,
            active,
            pending,
            todayAdded
        ] = await Promise.all([
            query,
            User.countDocuments(filters),
            User.countDocuments({ role: "user" }),
            User.countDocuments({ status: "active" }),
            User.countDocuments({ status: "pending" }),
            User.countDocuments(todayQuery)
        ]);

        const nextCursor = users.length === limit ? users[users.length - 1]._id : null;

        res.send({
            total,
            page,
            pages: Math.ceil(total / limit),
            grandTotal,
            active,
            pending,
            todayAdded,
            users,
            nextCursor,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
        });
    }
};
const giveAccess = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({
            message: 'You are not authorized to access this route',
        });
    }

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).send({
            message: 'User ID is required',
        });
    }

    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).send({
                message: 'Target user not found',
            });
        }

        const isAlreadyAllowed = targetUser.allowedUsers.includes(userId);

        const update = isAlreadyAllowed
            ? { $pull: { allowedUsers: userId } }
            : { $addToSet: { allowedUsers: userId } };

        const updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true });

        res.status(200).send({
            message: isAlreadyAllowed
                ? 'Access revoked from user'
                : 'Access granted to user',
            data: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'An error occurred while updating access',
            error: error.message,
        });
    }
};
const getSingle = async (req, res) => {
    try {
        const isPrivileged = req.user.role === "admin" || req.user.role === "moderator";
        const isSelf = req.user._id.toString() === req.params.id;
        if (!isPrivileged && !isSelf) {
            return res.status(403).send({
                message: "Forbidden: You do not have permission to view this profile"
            });
        }
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("reffer", "name username");
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
}
// Public referrer lookup used by the registration form. Only the fields the
// form actually renders are returned — never contact details or balances.
const searchUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.id })
            .select("name username");
        const data = {
            user,
            success: false
        }
        if (user) {
            data.success = true
        }
        res.send(data);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
}
// Only these fields may be written through the admin update endpoint. Spreading
// req.body straight into findByIdAndUpdate would let any caller set their own
// role or balance, so the payload is filtered down to a known-safe set.
const ADMIN_UPDATABLE_FIELDS = [
    "name", "username", "email", "phone", "gender", "fb",
    "role", "status", "level", "lock", "balance", "reffer"
];

const updateUser = async (req, res) => {
    try {
        const update = {};
        for (const field of ADMIN_UPDATABLE_FIELDS) {
            if (req.body[field] !== undefined) {
                update[field] = req.body[field];
            }
        }
        if (update.status === "active") {
            update.activatedAt = new Date();
        }
        if (update.email) {
            update.email = String(update.email).toLowerCase();
        }
        if (Object.keys(update).length === 0) {
            return res.status(400).send({ message: "No updatable fields provided" });
        }
        const user = await User.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true
        }).select("-password");
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send({
            message: "User updated successfully",
            user: user
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}
const updatePassword = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).send({
                message: "Forbidden: You can only change your own password"
            });
        }
        // The settings form posts { oldPassword, newPassword } while older callers
        // used { old, new }. Accept both so the change-password flow actually works.
        const newPasswordRaw = req.body.newPassword ?? req.body.new;
        const oldPasswordRaw = req.body.oldPassword ?? req.body.old;

        if (!newPasswordRaw || newPasswordRaw.length < 6) {
            return res.status(400).send({
                message: "Password must be at least 6 characters"
            });
        }
        if (!oldPasswordRaw) {
            return res.status(400).send({
                message: "Current password is required"
            });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            });
        }
        const newPassword = await saltGenerator(newPasswordRaw);

        const isSame = await bcrypt.compare(oldPasswordRaw, user.password);
        if (!isSame) {
            return res.status(400).send({
                message: "Old password is incorrect"
            });
        }
        user.password = newPassword;
        await user.save();
        res.send({
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}
const password = async (req, res) => {
    try {
        const userId = req.params.id;
        const newPasswordRaw = req.body.password;
        if (!newPasswordRaw || newPasswordRaw.length < 6) {
            return res.status(400).send({ message: "Password must be at least 6 characters" });
        }

        // Verify authorization: either a valid Bearer token (Admin/Moderator) or a valid reset token (code) matching target user
        let isAuthorized = false;
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.startsWith('Bearer '))
            ? authHeader.split(' ')[1]
            : (req.body.token || req.body.code || req.query.code);

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                // A moderator must NOT be able to reset an arbitrary account's
                // password — that would be a straight path to an admin takeover.
                if (decoded.role === 'admin' || decoded.id === userId) {
                    isAuthorized = true;
                }
            } catch (err) {
                return res.status(401).send({ message: "Invalid or expired reset token" });
            }
        }

        if (!isAuthorized) {
            return res.status(401).send({ message: "Unauthorized password update attempt" });
        }

        const newPassword = await saltGenerator(newPasswordRaw);
        const user = await User.findByIdAndUpdate(userId, { password: newPassword }, { new: true });
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }
        res.send({
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}
const deleteUser = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).send({
            message: "You are not authorized to access this route"
        })
    }
    try {
        // Soft delete: never physically remove the document.
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { deletedAt: new Date() },
            { new: true }
        );
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }
        res.send({
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}

const getCurrentUser = async (req, res) => {
    res.send(req.user);
}
const checkUser = async (req, res) => {
    try {

        // Opt out of the soft-delete hook: a deleted user still reserves
        // their username/email, so availability must reflect that.
        const user = await User.findOne({ username: req.params.id }).setOptions({ withDeleted: true });
        if (!user) {
            res.send({
                message: "Username Available",
                status: true
            })
        }
        else {
            res.send({
                message: "Username Not Available",
                status: false
            })
        }
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}
// Number of upline generations that earn a commission when a user activates.
const REFERRAL_GENERATIONS = 6;

const activeAnUser = async (req, res) => {
    try {
        const setting = await Setting.findById('66a4a094c8d1fd11daac6c28');
        if (!setting) {
            return res.status(500).send({
                message: "Site settings are not configured"
            });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }

        // Idempotency guard: re-activating an already active user would pay the
        // whole upline a second time for the same account.
        if (user.status === "active") {
            return res.status(400).send({
                message: "User is already active"
            });
        }

        user.status = "active";
        user.activatedAt = new Date();
        await user.save();

        // Walk up the sponsor chain, paying one generation per hop. This replaces
        // six hand-unrolled nested blocks that did exactly the same thing.
        let currentRefferId = user.reffer;
        for (let gen = 1; gen <= REFERRAL_GENERATIONS && currentRefferId; gen++) {
            const commition = setting.ref_comm?.[`gen${gen}`] || 0;
            const upline = await User.findById(currentRefferId);
            if (!upline) break;

            await createRefer({
                user: user._id,
                reffer: upline._id,
                gen,
                commition
            });

            if (commition > 0) {
                // Always $inc — an in-memory read/modify/write would race with
                // concurrent payouts to the same upline.
                await User.findByIdAndUpdate(upline._id, {
                    $inc: { balance: commition }
                });
            }

            currentRefferId = upline.reffer;
        }

        res.send({
            message: "User activated successfully",
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}

const getStatistic = async (req, res) => {
    try {
        const [total, active, pending, blocked, total_withdraw] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "active" }),
            User.countDocuments({ status: "pending" }),
            User.countDocuments({ lock: true }),
            Withdraw.countDocuments({ status: "completed" })
        ]);
        res.send({
            total,
            active,
            pending,
            blocked,
            total_withdraw
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
}
const resetPassword = async (req, res) => {
    try {
        const text = req.params.id;
        const user = await User.findOne({
            $or: [
                {
                    email: text
                },
                {
                    username: text
                }
            ]
        })
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            });
        }
        const code = Math.floor(100000 + Math.random() * 900000);
        const toke = jwt.sign({
            id: user._id,
            email: user.email,
            username: user.username,
            type: "reset"
        }, JWT_SECRET, {
            expiresIn: "1h"
        });
        const restll = await mailerService.sendResetCode(user.email, toke);
        res.send(restll);
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({
            role: "admin",
            lock: { $ne: true }
        })
            .select("name username role image active lastActive")
            .sort({ active: -1, createdAt: -1 })
            .lean();

        res.status(200).send({
            users: admins,
            total: admins.length
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    getAllData,
    getSingle,
    updateUser,
    deleteUser,
    updatePassword,
    loginUser,
    getCurrentUser,
    checkUser,
    activeAnUser,
    searchUser,
    getStatistic,
    withoutPass,
    password,
    resetPassword,
    giveAccess,
    getAdmins
}