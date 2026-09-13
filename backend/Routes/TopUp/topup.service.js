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

        try {
            const { recordTransaction } = require("../Transaction/transaction.service");
            await recordTransaction({
                userId: user,
                amount: amount,
                type: "credit",
                category: "topup",
                title: "Wallet TopUp Pending",
                status: "pending",
                referenceId: withDraw._id,
                trxId: withDraw.trx || `TRX${String(withDraw._id).slice(-7).toUpperCase()}`,
                method: withDraw.method,
                account: withDraw.account,
                image: withDraw.image,
                skipNotification: true,
            });
        } catch (trxErr) {
            console.error("Failed to record topup transaction:", trxErr);
        }

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

        try {
            const { updateTransactionByReference } = require("../Transaction/transaction.service");
            const updatePayload = {};
            if (data.status) {
                updatePayload.status = data.status;
                if (data.status === "completed") updatePayload.title = "Wallet TopUp Completed";
                if (data.status === "rejected") updatePayload.title = "Wallet TopUp Rejected";
            }
            if (data.note) updatePayload.note = data.note;
            if (data.image) updatePayload.image = data.image;
            await updateTransactionByReference(id, updatePayload);
        } catch (trxErr) {
            console.error("Failed to update topup transaction:", trxErr);
        }

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
        const updatedUser = await User.findByIdAndUpdate(data.user, {
            $inc: { balance: data.amount }
        }, { new: true });

        try {
            const { updateTransactionByReference } = require("../Transaction/transaction.service");
            await updateTransactionByReference(data._id, {
                status: "completed",
                title: "Wallet TopUp Completed",
                balanceBefore: updatedUser ? updatedUser.balance - data.amount : 0,
                balanceAfter: updatedUser ? updatedUser.balance : data.amount,
            });
        } catch (trxErr) {
            console.error("Failed to complete topup transaction:", trxErr);
        }

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