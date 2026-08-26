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
        const refer = await Refer.find({ reffer: user })
            .sort({ createdAt: -1 })
            .populate("user", "name email phone")
            .populate("reffer", "name email phone");
        return refer
    } catch (error) {
        throw new Error(error)
    }
}
const statistic = async (user) => {
    try {
        const gen1 = await Refer.countDocuments({ reffer: user, gen: 1 });
        const gen2 = await Refer.countDocuments({ reffer: user, gen: 2 });
        const gen3 = await Refer.countDocuments({ reffer: user, gen: 3 });
        const gen4 = await Refer.countDocuments({ reffer: user, gen: 4 });
        const gen5 = await Refer.countDocuments({ reffer: user, gen: 5 });
        const gen6 = await Refer.countDocuments({ reffer: user, gen: 6 });
        return { gen1, gen2, gen3, gen4, gen5, gen6 }
    } catch (error) {
        throw new Error(error)
    }
}
const statistic2 = async (user) => {
    try {
        const userCheck = await User.findOne({ $or: [{ username: user }, { email: user }] });
        if (!userCheck) {
            throw new Error("User not found")
        }
        const gen1 = await Refer.countDocuments({ reffer: userCheck._id, gen: 1 });
        const gen2 = await Refer.countDocuments({ reffer: userCheck._id, gen: 2 });
        const gen3 = await Refer.countDocuments({ reffer: userCheck._id, gen: 3 });
        const gen4 = await Refer.countDocuments({ reffer: userCheck._id, gen: 4 });
        const gen5 = await Refer.countDocuments({ reffer: userCheck._id, gen: 5 });
        const gen6 = await Refer.countDocuments({ reffer: userCheck._id, gen: 6 });
        return { gen1, gen2, gen3, gen4, gen5, gen6, user: userCheck }
    } catch (error) {
        throw new Error(error)
    }
}
module.exports = {
    createRefer,
    getReferHintory,
    getAllRefer,
    statistic,
    getAll,
    statistic2,
    statistic_board
}