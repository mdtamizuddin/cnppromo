const Refer = require("./refer.model");
const User = require("../User/user.model");
const createRefer = async (data) => {
    try {
        const refer = new Refer(data);
        await refer.save();
        return refer
    } catch (error) {
        throw new Error(error)
    }
}
const getReferHintory = async (user, gen) => {
    try {
        const refer = await Refer.find({ reffer: user, gen: gen })
            .sort({ createdAt: -1 })
            .populate("user", "name email phone")
            .populate("reffer", "name email phone");
        return refer
    } catch (error) {
        throw new Error(error)
    }
}
const Withdraw = require("../WithDraw/withdraw.model");

const statistic_board = async (options = {}) => {
    try {
        let date = options?.date ? new Date(options.date) : new Date();
        const type = options?.type || "earners"; // "earners", "referrers", "withdrawers"
        const timeframe = options?.timeframe || "month"; // "today", "week", "month", "all"

        let matchStage = {};

        if (timeframe === "today") {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);
            matchStage.createdAt = { $gte: startOfToday, $lte: endOfToday };
        } else if (timeframe === "week") {
            const past7Days = new Date();
            past7Days.setDate(past7Days.getDate() - 7);
            matchStage.createdAt = { $gte: past7Days };
        } else if (timeframe === "month") {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
            matchStage.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
        }
        // If timeframe === "all", no createdAt filter is added

        if (type === "withdrawers") {
            const withdrawMatch = { status: "completed", ...matchStage };
            const withdrawData = await Withdraw.aggregate([
                { $match: withdrawMatch },
                {
                    $group: {
                        _id: "$user",
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                {
                    $project: {
                        _id: 1,
                        totalAmount: 1,
                        count: 1,
                        "user.name": 1,
                        "user.username": 1,
                        "user.gender": 1,
                        "user.level": 1,
                    },
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 50 },
            ]);

            return withdrawData.map((item, index) => ({
                position: index + 1,
                earnings: item.totalAmount,
                ...item,
            }));
        }

        // Default: Referrers & Earners
        const referMatch = Object.keys(matchStage).length > 0 ? matchStage : {};
        const pipeline = [];

        if (Object.keys(referMatch).length > 0) {
            pipeline.push({ $match: referMatch });
        }

        pipeline.push(
            {
                $group: {
                    _id: "$reffer",
                    gen1: {
                        $sum: {
                            $cond: [{ $eq: ["$gen", 1] }, 1, 0],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    gen1: 1,
                    "user.name": 1,
                    "user.username": 1,
                    "user.gender": 1,
                    "user.level": 1,
                },
            },
            { $sort: { gen1: -1 } },
            { $limit: 50 }
        );

        const data = await Refer.aggregate(pipeline);

        return data.map((item, index) => ({
            position: index + 1,
            earnings: (item.gen1 || 0) * 30,
            ...item,
        }));
    } catch (error) {
        throw new Error(error);
    }
};
const getAll = async (user, gen) => {
    try {
        const refer = await Refer.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("user", "name email phone")
            .populate("reffer", "name email phone");
        const total = await Refer.countDocuments();
        return {
            data: refer,
            total
        }
    } catch (error) {
        throw new Error(error)
    }
}
const getAllRefer = async (user) => {
    try {
        const mongoose = require("mongoose");
        const userId = typeof user === "string" ? new mongoose.Types.ObjectId(user) : user;
        const refer = await Refer.find({ reffer: userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("user", "name username email phone status createdAt")
            .populate("reffer", "name username");
        return refer;
    } catch (error) {
        throw new Error(error);
    }
};

// Helper to calculate referral stats per generation in 1 database aggregation query.
const getReferralStatsByUserId = async (userId) => {
    const stats = await Refer.aggregate([
        { $match: { reffer: userId } },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userData"
            }
        },
        {
            $unwind: {
                path: "$userData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$gen",
                count: { $sum: 1 },
                totalCommission: { $sum: "$commition" },
                activeCount: {
                    $sum: {
                        $cond: [{ $eq: ["$userData.status", "active"] }, 1, 0]
                    }
                }
            }
        }
    ]);

    const result = {
        gen1: 0, gen2: 0, gen3: 0, gen4: 0, gen5: 0, gen6: 0,
        commGen1: 0, commGen2: 0, commGen3: 0, commGen4: 0, commGen5: 0, commGen6: 0,
        activeGen1: 0, activeGen2: 0, activeGen3: 0, activeGen4: 0, activeGen5: 0, activeGen6: 0,
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0
    };

    for (const item of stats) {
        if (item._id >= 1 && item._id <= 6) {
            result[`gen${item._id}`] = item.count;
            result[`commGen${item._id}`] = item.totalCommission || 0;
            result[`activeGen${item._id}`] = item.activeCount || 0;
            result.totalReferrals += item.count;
            result.activeReferrals += (item.activeCount || 0);
            result.totalEarnings += (item.totalCommission || 0);
        }
    }
    return result;
};

const statistic = async (user) => {
    try {
        const mongoose = require("mongoose");
        const userId = typeof user === "string" ? new mongoose.Types.ObjectId(user) : user;
        return await getReferralStatsByUserId(userId);
    } catch (error) {
        throw new Error(error);
    }
};

const statistic2 = async (user) => {
    try {
        const userCheck = await User.findOne({ $or: [{ username: user }, { email: user }] });
        if (!userCheck) {
            throw new Error("User not found");
        }
        const counts = await getReferralStatsByUserId(userCheck._id);
        return { ...counts, user: userCheck };
    } catch (error) {
        throw new Error(error);
    }
};
module.exports = {
    createRefer,
    getReferHintory,
    getAllRefer,
    statistic,
    getAll,
    statistic2,
    statistic_board
}