const External = require("./external.model");

const createWithdraw = async (data) => {
    try {
        const withDraw = new External(data);
        await withDraw.save();

        try {
            const { recordTransaction } = require("../Transaction/transaction.service");
            await recordTransaction({
                userId: data.user,
                amount: Number(data.amount || 0),
                type: "debit",
                category: "withdraw",
                title: "External Withdrawal Request",
                status: data.status || "pending",
                referenceId: withDraw._id,
                trxId: `TRX${String(withDraw._id).slice(-7).toUpperCase()}`,
                method: data.method || data.gateway || "External Gateway",
                account: data.account || data.walletNumber || "",
                image: data.image || "",
                skipNotification: true,
            });
        } catch (trxErr) {
            console.error("Failed to record external withdraw transaction:", trxErr);
        }

        return withDraw;
    } catch (error) {
        throw new Error(error);
    }
};

const getSingle = async (id) => {
    try {
        const withDraw = await External.findById(id)
            .populate("user", "-password")
            .exec();
        return withDraw;
    } catch (error) {
        throw new Error(error);
    }
};

const getAllByUser = async (id, status) => {
    try {
        const withDraw = await External.find({ user: id, status: status ? status : "pending" })
            .populate("user", "-password")
            .sort({ createdAt: -1 })
            .exec();
        return withDraw;
    } catch (error) {
        throw new Error(error);
    }
};

const getAll = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 50;
        const skip = (page - 1) * limit;
        const filters = {};
        if (query.status) {
            filters.status = query.status;
        } else {
            filters.status = "pending";
        }
        
        if (query.dateSearch) {
            const start = new Date(query.dateSearch);
            start.setHours(0, 0, 0, 0); // Start of the day
            filters.createdAt = {
                $gte: start,
                $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000)
            };
        }
        
        if (query.textSearch) {
            const regex = new RegExp(query.textSearch, "i");
            const User = require("../User/user.model");
            const users = await User.find({
                $or: [
                    { username: { $regex: regex } },
                    { email: { $regex: regex } },
                    { phone: { $regex: regex } }
                ]
            }).select("_id");
            const userIds = users.map(u => u._id);
            
            filters.$or = [
                { user: { $in: userIds } },
                { account: { $regex: regex } }
            ];
        }

        const withDraw = await External.find(filters)
            .populate("user", "-password")
            .sort({ createdAt: query.reverse ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .exec();
            
        const total = await External.countDocuments(filters);
        
        return {
            data: withDraw,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        throw new Error(error);
    }
};

const updateData = async (id, data) => {
    try {
        await External.findByIdAndUpdate(id, data, { new: true });

        try {
            const { updateTransactionByReference } = require("../Transaction/transaction.service");
            const updatePayload = {};
            if (data.status) {
                updatePayload.status = (data.status === "completed" || data.status === "approved") ? "completed" : data.status === "rejected" ? "rejected" : "pending";
                updatePayload.title = (data.status === "completed" || data.status === "approved") ? "External Withdrawal Payment" : "External Withdrawal Request";
            }
            if (data.note) updatePayload.note = data.note;
            if (data.image) updatePayload.image = data.image;
            await updateTransactionByReference(id, updatePayload);
        } catch (trxErr) {
            console.error("Failed to update external withdraw transaction:", trxErr);
        }

        return {
            message: "Data updated successfully",
        };
    } catch (error) {
        throw new Error(error);
    }
};

const deleteData = async (id) => {
    try {
        const withDraw = await External.findByIdAndDelete(id);
        return withDraw;
    } catch (error) {
        throw new Error(error);
    }
};

const externalWithdrawServices = {
    createWithdraw,
    getSingle,
    getAllByUser,
    getAllRefer: getAllByUser,
    getAll,
    updateData,
    deleteData
};

module.exports = externalWithdrawServices;