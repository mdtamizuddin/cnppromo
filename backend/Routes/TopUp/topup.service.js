const User = require("../User/user.model");
const Withdraw = require("./topup.model");
const { notifyUser } = require("../Notification/notification.service");

const createWithDraw = async (data) => {
    try {
        const { amount, user } = data
        const userData = await User.findById(user);
        if (!userData) {
            throw new Error("User not found")
        }
        if (amount < 50) {
            throw new Error("Withdraw amount must be greater than 50")
        }

        const withDraw = new Withdraw(data);
        await withDraw.save();
        notifyUser(user, {
            category: "payments",
            type: "topup_request",
            title: `টপ-আপ রিকোয়েস্ট সাবমিট হয়েছে`,
            message: `৳${amount} টপ-আপের অনুরোধ প্রক্রিয়াধীন রয়েছে। অ্যাডমিন যাচাই করার পর ব্যালেন্সে যোগ হবে।`,
            link: "/account/topup",
        });
        // deduct amount from user balance
        return withDraw
    } catch (error) {
        throw new Error(error)
    }
}
// get all data

const getAllData = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 50;
        const skip = (page - 1) * limit;
        const filters = {};
        if (query.status) {
            filters.status = query.status
        }
        if (query.user) {
            filters.user = query.user
        }
        if (query.dateSearch) {
            const start = new Date(query.dateSearch);
            start.setHours(0, 0, 0, 0); // Start of the day
            filters.createdAt = {
                $gte: start,
                $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000)
            }
        }
        
        if (query.textSearch) {
            const regex = new RegExp(query.textSearch, "i");
            // First find users matching the text search
            const users = await User.find({
                $or: [
                    { username: { $regex: regex } },
                    { email: { $regex: regex } },
                    { phone: { $regex: regex } }
                ]
            }).select("_id");
            const userIds = users.map(u => u._id);
            
            // Search either by user info, account number, or transaction ID (trx)
            filters.$or = [
                { user: { $in: userIds } },
                { account: { $regex: regex } },
                { trx: { $regex: regex } }
            ];
        }
        const withDraws = await Withdraw.find(filters)
            .populate("user", "-password")
            .sort({ createdAt: query.reverse ? -1 : 1 })
            .skip(skip)
            .limit(limit);
        const total = await Withdraw.countDocuments(filters);
        let totalWithdraw = 0
        await withDraws.forEach(withdraw => {
            totalWithdraw += withdraw.amount
        })
        return {
            data: withDraws,
            total,
            page,
            pages: Math.ceil(total / limit),
            totalWithdraw
        }
    } catch (error) {
        throw new Error(error)
    }
}


// get single data

const getSingle = async (id) => {
    try {
        const withDraw = await Withdraw.findById(id)
            .populate("user", "-password")
            .exec();
        return withDraw
    } catch (error) {
        throw new Error(error)
    }
}
// update data
const updateData = async (id, data) => {
    try {
        const before = await Withdraw.findById(id);
        await Withdraw.findByIdAndUpdate(id, data, { new: true });
        if (before && data.status === "rejected") {
            notifyUser(before.user, {
                category: "payments",
                type: "topup_rejected",
                title: `টপ-আপ রিকোয়েস্ট বাতিল হয়েছে`,
                message: `৳${before.amount} টপ-আপের অনুরোধটি বাতিল হয়েছে। ট্রানজেকশন আইডি (${before.trx || "N/A"}) যাচাই করে আবার চেষ্টা করুন।`,
                link: "/account/topup",
            });
        }
        return {
            message: "Data updated successfully",
        }
    } catch (error) {
        throw new Error(error)
    }
}
// Reject data
const rejectWithdraw = async (id) => {
    try {
        const data = await Withdraw.findById(id);
        if (!data) {
            throw new Error("Data not found")
        }
        data.status = "completed"
                await data.save();
        await User.findByIdAndUpdate(data.user, {
            $inc: { balance: data.amount }
        })
        notifyUser(data.user, {
            category: "payments",
            type: "topup_accepted",
            title: `টপ-আপ সফল হয়েছে`,
            message: `৳${data.amount} আপনার ব্যালেন্সে যোগ হয়েছে। ধন্যবাদ!`,
            link: "/account/topup",
        });
        return data
    } catch (error) {
        throw new Error(error)
    }
}
// delete data
const deleteData = async (id) => {
    try {
        const withDraw = await Withdraw.findByIdAndDelete(id);
        return withDraw
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    createWithDraw,
    getAllData,
    getSingle,
    updateData,
    deleteData,
    rejectWithdraw
}