const Transaction = require("./transaction.model");
const User = require("../User/user.model");
const { notifyUser } = require("../Notification/notification.service");

const generateTrxId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRX${timestamp}${randomStr}`;
};

/**
 * Adjust a user's balance (Credit or Debit) and record a dedicated transaction.
 */
const adjustBalance = async ({ adminId, userId, amount, type, note, title }) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error("A valid positive amount is required");
  }

  if (!["credit", "debit"].includes(type)) {
    throw new Error("Type must be either 'credit' or 'debit'");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Target user not found");
  }

  const balanceBefore = Number(user.balance) || 0;

  if (type === "debit" && balanceBefore < numericAmount) {
    throw new Error(`Insufficient user balance. Current balance is ৳${balanceBefore}`);
  }

  const change = type === "credit" ? numericAmount : -numericAmount;
  const balanceAfter = Math.max(0, balanceBefore + change);

  // Update user balance atomically
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { balance: change } },
    { new: true, runValidators: true }
  ).select("-password");

  const defaultTitle =
    title || (type === "credit" ? "Admin Balance Credit" : "Admin Balance Deduction");
  const trxId = generateTrxId();

  // Create transaction record
  const transaction = await Transaction.create({
    user: userId,
    amount: numericAmount,
    type,
    category: type === "credit" ? "admin_credit" : "admin_debit",
    title: defaultTitle,
    note: note ? String(note).trim() : "",
    trxId,
    adminUser: adminId,
    balanceBefore,
    balanceAfter,
    status: "completed",
  });

  // Directly insert notification into the user's notification feed
  try {
    const Notification = require("../Notification/notification.model");
    await Notification.create({
      user: userId,
      category: "payments",
      type: type === "credit" ? "balance_credited" : "balance_deducted",
      title:
        type === "credit"
          ? `আপনার ওয়ালেটে ৳${numericAmount} যোগ হয়েছে`
          : `আপনার ওয়ালেট থেকে ৳${numericAmount} কর্তন করা হয়েছে`,
      message:
        type === "credit"
          ? `এডমিন আপনার একাউন্টে ৳${numericAmount} যোগ করেছেন। ট্রানজেকশন আইডি: ${trxId}।${
              note ? ` নোট: ${note}` : ""
            }`
          : `এডমিন আপনার একাউন্ট থেকে ৳${numericAmount} কেটে নিয়েছেন। ট্রানজেকশন আইডি: ${trxId}।${
              note ? ` নোট: ${note}` : ""
            }`,
      link: "/user/earnings",
      isRead: false,
    });
  } catch (notifyErr) {
    console.error("Failed to insert notification for balance adjustment:", notifyErr);
  }

  return {
    message: `Successfully ${type === "credit" ? "credited" : "deducted"} ৳${numericAmount}`,
    user: updatedUser,
    transaction,
  };
};

/**
 * Get transactions for a user
 */
const getUserTransactions = async (userId, limit = 100) => {
  return await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 100)
    .populate("adminUser", "name username avatar role")
    .lean();
};

/**
 * Helper to record a transaction from other services if balance changes
 */
const recordTransaction = async ({
  userId,
  amount,
  type,
  category = "admin_adjustment",
  title,
  note = "",
  adminId = null,
  balanceBefore = 0,
  balanceAfter = 0,
}) => {
  const trxId = generateTrxId();
  const effectiveType = type || (amount >= 0 ? "credit" : "debit");
  const effectiveAmount = Math.abs(Number(amount));
  const trx = await Transaction.create({
    user: userId,
    amount: effectiveAmount,
    type: effectiveType,
    category,
    title: title || (effectiveType === "credit" ? "Balance Credit" : "Balance Deduction"),
    note,
    trxId,
    adminUser: adminId,
    balanceBefore,
    balanceAfter,
    status: "completed",
  });

  try {
    const Notification = require("../Notification/notification.model");
    await Notification.create({
      user: userId,
      category: "payments",
      type: effectiveType === "credit" ? "balance_credited" : "balance_deducted",
      title:
        effectiveType === "credit"
          ? `আপনার ওয়ালেটে ৳${effectiveAmount} যোগ হয়েছে`
          : `আপনার ওয়ালেট থেকে ৳${effectiveAmount} কর্তন করা হয়েছে`,
      message:
        effectiveType === "credit"
          ? `এডমিন আপনার একাউন্টে ৳${effectiveAmount} যোগ করেছেন। ট্রানজেকশন আইডি: ${trxId}।${
              note ? ` নোট: ${note}` : ""
            }`
          : `এডমিন আপনার একাউন্ট থেকে ৳${effectiveAmount} কেটে নিয়েছেন। ট্রানজেকশন আইডি: ${trxId}।${
              note ? ` নোট: ${note}` : ""
            }`,
      link: "/user/earnings",
      isRead: false,
    });
  } catch (notifyErr) {
    console.error("Failed to insert notification in recordTransaction:", notifyErr);
  }

  return trx;
};

module.exports = {
  adjustBalance,
  getUserTransactions,
  recordTransaction,
};
