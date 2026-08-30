const User = require("../User/user.model");
const Withdraw = require("./withdraw.model");
const { notifyUser } = require("../Notification/notification.service");

const createWithDraw = async (data) =>
{
    try {
        const { amount, user } = data
        // check today any withdraw has created with this user
        const today = new Date();
        // const lastWithdraw = await Withdraw.findOne({ user, createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) } });
        // if (lastWithdraw) {
        //     throw new Error("You can't withdraw again today. Your Dayly withdraw limit is exceeded")
        // }
        // A negative or non-numeric amount would sail past the balance check
        // below and then CREDIT the account via `$inc: { balance: -amount }`.
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            throw new Error("Withdraw amount must be a positive number")
        }
        const userData = await User.findById(user);
        if (!userData) {
            throw new Error("User not found")
        }
        if (numericAmount > userData.balance) {
            throw new Error("Insufficient balance")
        }

        const withDraw = new Withdraw({ ...data, amount: numericAmount });
        await withDraw.save();
        // Deduct atomically, and only while the balance still covers it, so two
        // concurrent requests cannot both pass the check above and overdraw.
        const debited = await User.findOneAndUpdate({
            _id: user,
            balance: { $gte: numericAmount }
        }, {
            $inc: { balance: -numericAmount }
        }, { new: true })

        if (!debited) {
            await Withdraw.findByIdAndDelete(withDraw._id);
            throw new Error("Insufficient balance")
        }
        // userData.balance = userData.balance - amount;
        // await userData.save();
        notifyUser(user, {
            category: "payments",
            type: "withdraw_request",
            title: `উইথড্রয়াল রিকোয়েস্ট সাবমিট হয়েছে`,
            message: `৳${numericAmount} উইথড্রয়াল রিকোয়েস্ট গ্রহণ করা হয়েছে। ১২-২৪ ঘন্টার মধ্যে প্রসেস করা হবে।`,
            link: "/account/withdraw",
        });
        return withDraw
    } catch (error) {
        throw new Error(error)
    }
}
// get all data

const getAllData = async (query) =>
{
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

            const end = new Date(start);
            end.setDate(start.getDate() + 1); // Next day start (exclusive)

            filters.createdAt = {
                $gte: start,
                $lt: end
            };
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
            
            // Search either by user info or account number
            filters.$or = [
                { user: { $in: userIds } },
                { account: { $regex: regex } }
            ];
        }
        const withDraws = await Withdraw.find(filters)
            .populate("user", "-password")
            .sort({ createdAt: query.reverse ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await Withdraw.countDocuments(filters);
        let totalWithdraw = 0
        await withDraws.forEach(withdraw =>
        {
            totalWithdraw += withdraw.amount
        })
        return {
            data: withDraws,
            total,
            page,
            pages: Math.ceil(total / limit),
            totalWithdraw: totalWithdraw
        }
    } catch (error) {
        throw new Error(error)
    }
}


// get single data

const getSingle = async (id) =>
{
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
const updateData = async (id, data) =>
{
    try {
        const before = await Withdraw.findById(id);
        await Withdraw.findByIdAndUpdate(id, data, { new: true });
        if (before && data.status === "completed") {
            notifyUser(before.user, {
                category: "payments",
                type: "withdraw_paid",
                title: `উইথড্রয়াল সফল হয়েছে`,
                message: `৳${before.amount} আপনার অ্যাকাউন্টে পাঠানো হয়েছে। ধন্যবাদ!`,
                link: "/account/withdraw",
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
const rejectWithdraw = async (id) =>
{
    try {
        const data = await Withdraw.findById(id);
        if (!data) {
            throw new Error("Data not found")
        }
        data.status = "rejected"
        await data.save();
        await User.findByIdAndUpdate(data.user, {
            $inc: { balance: data.amount }
        })
        notifyUser(data.user, {
            category: "payments",
            type: "withdraw_rejected",
            title: `উইথড্রয়াল রিকোয়েস্ট বাতিল হয়েছে`,
            message: `৳${data.amount} উত্তোলনের অনুরোধটি বাতিল হয়েছে এবং ব্যালেন্সে ফেরত যোগ করা হয়েছে।`,
            link: "/account/withdraw",
        });
        return data
    } catch (error) {
        throw new Error(error)
    }
}
// delete data
const deleteData = async (id) =>
{
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