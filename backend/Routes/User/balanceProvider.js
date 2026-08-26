const User = require("./user.model")

const balanceProvider = async (id, balance) => {
    try {
        await User.findByIdAndUpdate(id, {
            $inc: { balance: balance }
        })
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = balanceProvider