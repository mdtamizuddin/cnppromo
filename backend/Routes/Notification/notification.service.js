const Notification = require("./notification.model");
const User = require("../User/user.model");

// Whether a user currently accepts notifications. Missing flag falls back to
// true so existing accounts keep working until they opt out from Settings.
const acceptsNotifications = async (userId) => {
    if (!userId) return false;
    try {
        const user = await User.findById(userId).select("notificationsEnabled");
        return user ? user.notificationsEnabled !== false : true;
    } catch (error) {
        return true;
    }
};

// Insert a notification for a single user. Returns null (silently) when the
// user has turned notifications off — nothing is written at all.
const notifyUser = async (userId, payload) => {
    try {
        if (!userId) return null;
        const enabled = await acceptsNotifications(userId);
        if (!enabled) return null;
        const notification = await Notification.create({ user: userId, ...payload });
        return notification;
    } catch (error) {
        console.error("notifyUser error:", error.message);
        return null;
    }
};

// Broadcast to many users (e.g. a newly published task). Each user's own
// notification setting is respected — opted-out users get nothing inserted.
const notifyMany = async (userIds, payload) => {
    try {
        if (!userIds || !userIds.length) return [];
        const enabled = await User.find(
            { _id: { $in: userIds }, notificationsEnabled: { $ne: false } }
        ).select("_id");
        if (!enabled.length) return [];
        const docs = enabled.map((u) => ({ user: u._id, ...payload }));
        return await Notification.insertMany(docs);
    } catch (error) {
        console.error("notifyMany error:", error.message);
        return [];
    }
};

const getNotifications = async (userId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = { user: userId };
    if (query.category && query.category !== "all") {
        filter.category = query.category;
    }

    const [data, total, unread] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(filter),
        Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return {
        data,
        total,
        unread,
        page,
        pages: Math.ceil(total / limit),
    };
};

const markAsRead = async (userId, id) => {
    await Notification.findOneAndUpdate(
        { _id: id, user: userId },
        { isRead: true }
    );
    return { message: "Notification marked as read" };
};

const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
    );
    return { message: "All notifications marked as read" };
};

const deleteNotification = async (userId, id) => {
    await Notification.findOneAndDelete({ _id: id, user: userId });
    return { message: "Notification deleted" };
};

const clearAll = async (userId) => {
    await Notification.deleteMany({ user: userId });
    return { message: "All notifications cleared" };
};

module.exports = {
    acceptsNotifications,
    notifyUser,
    notifyMany,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
};