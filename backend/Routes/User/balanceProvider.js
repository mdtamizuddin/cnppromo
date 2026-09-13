const User = require("./user.model")

const balanceProvider = async (id, balance) => {
    try {
        const user = await User.findByIdAndUpdate(id, {
            $inc: { balance: balance }
        }, { new: true });

        try {
            const { recordTransaction } = require("../Transaction/transaction.service");
            await recordTransaction({
                userId: id,
                amount: Math.abs(balance),
                type: balance >= 0 ? "credit" : "debit",
                category: balance >= 0 ? "admin_credit" : "admin_debit",
                title: balance >= 0 ? "Balance Credit" : "Balance Debit",
                balanceBefore: user ? user.balance - balance : 0,
                balanceAfter: user ? user.balance : balance,
                skipNotification: true,
            });
        } catch (txErr) {
            console.error("Failed to record balanceProvider transaction:", txErr);
        }
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = balanceProvider