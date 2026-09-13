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

  // Create transaction record in the unified ledger
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
    method: "Admin Adjustment",
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
 * Helper to record a transaction from other services into the unified ledger
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
  referenceId = null,
  trxId: customTrxId = null,
  method = "",
  account = "",
  image = "",
  status = "completed",
  referredUser = null,
  gen = null,
  taskTitle = "",
  skipNotification = false,
}) => {
  // If referenceId is provided, check if already recorded
  if (referenceId) {
    const existing = await Transaction.findOne({ referenceId: String(referenceId) });
    if (existing) {
      if (status && existing.status !== status) {
        existing.status = status;
        if (note) existing.note = note;
        if (image) existing.image = image;
        await existing.save();
      }
      return existing;
    }
  }

  const trxId = customTrxId || generateTrxId();
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
    status,
    referenceId: referenceId ? String(referenceId) : undefined,
    method,
    account,
    image,
    referredUser,
    gen,
    taskTitle,
  });

  if (!skipNotification) {
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
  }

  return trx;
};

/**
 * Helper to batch insert records in chunks of 500
 */
const batchInsertMissingTransactions = async (docs) => {
  if (!docs || docs.length === 0) return 0;
  const CHUNK_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const existingRefIds = new Set(
      (
        await Transaction.find({
          referenceId: { $in: chunk.map((d) => d.referenceId) },
        })
          .select("referenceId")
          .lean()
      ).map((d) => d.referenceId)
    );

    const toInsert = chunk.filter((d) => !existingRefIds.has(d.referenceId));
    if (toInsert.length > 0) {
      await Transaction.insertMany(toInsert, { ordered: false }).catch(() => {});
      inserted += toInsert.length;
    }
  }

  return inserted;
};

/**
 * One-time backfill/sync of existing legacy records into the unified Transaction ledger
 */
const syncHistoricalTransactions = async (targetUserId = null) => {
  const Withdraw = require("../WithDraw/withdraw.model");
  const ExternalWithdraw = require("../external-withdraw/external.model");
  const Topup = require("../TopUp/topup.model");
  const Refer = require("../Refer/refer.model");
  const { WorkSubmit } = require("../social-works/work.model");

  const filter = targetUserId ? { user: targetUserId } : {};
  const refferFilter = targetUserId ? { reffer: targetUserId } : {};
  const workSubmitFilter = targetUserId ? { userId: targetUserId } : {};

  const [withdrawals, extWithdrawals, topups, refers, workSubmits] = await Promise.all([
    Withdraw.find(filter).lean(),
    ExternalWithdraw.find(filter).lean(),
    Topup.find(filter).lean(),
    Refer.find(refferFilter).lean(),
    WorkSubmit.find({ ...workSubmitFilter, status: "completed" }).populate("workId", "title price amount reward").lean(),
  ]);

  let totalInserted = 0;

  // 1. Process Withdrawals
  const withdrawDocs = withdrawals.map((w) => ({
    user: w.user,
    amount: Number(w.amount || 0),
    type: "debit",
    category: "withdraw",
    title: w.status === "completed" ? "Withdrawal Payment" : "Withdrawal Request",
    note: w.note || (w.status === "completed" ? `Payment sent to user ${w.method} number.` : ""),
    trxId: `TRX${String(w._id).slice(-7).toUpperCase()}`,
    referenceId: String(w._id),
    method: w.method || "Local Banking",
    account: w.account || "",
    image: w.image || "",
    status: w.status === "completed" ? "completed" : w.status === "rejected" ? "rejected" : "pending",
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  }));
  totalInserted += await batchInsertMissingTransactions(withdrawDocs);

  // 2. Process External Withdrawals
  const extWithdrawDocs = extWithdrawals.map((ew) => ({
    user: ew.user,
    amount: Number(ew.amount || 0),
    type: "debit",
    category: "withdraw",
    title: ew.status === "completed" ? "External Withdrawal Payment" : "External Withdrawal Request",
    note: ew.note || "External Gateway Withdrawal",
    trxId: `TRX${String(ew._id).slice(-7).toUpperCase()}`,
    referenceId: String(ew._id),
    method: ew.method || "External Gateway",
    account: ew.account || "",
    image: ew.image || "",
    status: ew.status === "completed" ? "completed" : ew.status === "rejected" ? "rejected" : "pending",
    createdAt: ew.createdAt,
    updatedAt: ew.updatedAt,
  }));
  totalInserted += await batchInsertMissingTransactions(extWithdrawDocs);

  // 3. Process Topups
  const topupDocs = topups.map((tp) => ({
    user: tp.user,
    amount: Number(tp.amount || 0),
    type: "credit",
    category: "topup",
    title: tp.status === "completed" ? "Wallet TopUp Completed" : tp.status === "pending" ? "Wallet TopUp Pending" : "Wallet TopUp Rejected",
    trxId: tp.trx || `TRX${String(tp._id).slice(-7).toUpperCase()}`,
    referenceId: String(tp._id),
    method: tp.method || "TopUp",
    account: tp.account || "",
    image: tp.image || "",
    status: tp.status === "completed" ? "completed" : tp.status === "rejected" ? "rejected" : "pending",
    createdAt: tp.createdAt,
    updatedAt: tp.updatedAt,
  }));
  totalInserted += await batchInsertMissingTransactions(topupDocs);

  // 4. Process Refers
  const referDocs = refers.map((r) => ({
    user: r.reffer,
    amount: Number(r.commition || (r.gen === 1 ? 50 : 20)),
    type: "credit",
    category: "referral",
    title: `Referral Bonus (Gen ${r.gen || 1})`,
    trxId: `TRX${String(r._id).slice(-7).toUpperCase()}`,
    referenceId: String(r._id),
    referredUser: r.user,
    gen: r.gen || 1,
    status: "completed",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  totalInserted += await batchInsertMissingTransactions(referDocs);

  // 5. Process Work Submits
  const workSubmitDocs = workSubmits.map((ws) => {
    const taskReward = Number(ws.amount || ws.workId?.reward || ws.workId?.amount || ws.workId?.price || 20);
    return {
      user: ws.userId,
      amount: taskReward,
      type: "credit",
      category: "task",
      title: ws.workId?.title || "Task Completed",
      taskTitle: ws.workId?.title || "",
      trxId: `TRX${String(ws._id).slice(-7).toUpperCase()}`,
      referenceId: String(ws._id),
      image: ws.proofImage || ws.image || "",
      status: "completed",
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
    };
  });
  totalInserted += await batchInsertMissingTransactions(workSubmitDocs);

  return {
    success: true,
    totalWithdrawals: withdrawals.length,
    totalExternalWithdrawals: extWithdrawals.length,
    totalTopups: topups.length,
    totalRefers: refers.length,
    totalWorkSubmits: workSubmits.length,
    totalProcessed:
      withdrawals.length +
      extWithdrawals.length +
      topups.length +
      refers.length +
      workSubmits.length,
    newTransactionsInserted: totalInserted,
  };
};

/**
 * Update existing transaction by its referenceId
 */
const updateTransactionByReference = async (referenceId, updates = {}) => {
  if (!referenceId) return null;
  return await Transaction.findOneAndUpdate(
    { referenceId: String(referenceId) },
    { $set: updates },
    { new: true }
  );
};

/**
 * Unified, high-performance earnings feed with native MongoDB pagination & indexes
 */
const getUserEarningsFeed = async (userId, query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const mainTab = query.mainTab || "all";
  const statusFilter = query.statusFilter || "All";
  const searchQuery = (query.search || "").trim();

  // If user has no transactions in unified ledger yet, backfill existing records in background
  const countAny = await Transaction.countDocuments({ user: userId });
  if (countAny === 0) {
    await syncHistoricalTransactions(userId);
  }

  const filter = { user: userId };

  if (mainTab === "withdrawals") {
    filter.category = "withdraw";
  }

  if (statusFilter !== "All") {
    if (statusFilter === "Credit") {
      filter.type = "credit";
    } else if (statusFilter === "Debit") {
      filter.type = "debit";
    } else if (statusFilter === "Pending") {
      filter.status = "pending";
    } else if (statusFilter === "Success") {
      filter.status = "completed";
    } else if (statusFilter === "Rejected") {
      filter.status = "rejected";
    }
  }

  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i");
    filter.$or = [
      { trxId: regex },
      { title: regex },
      { method: regex },
      { note: regex },
      { account: regex },
    ];
  }

  // Fast single-query indexed pagination
  const [rawDocs, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("adminUser", "name username avatar")
      .populate("referredUser", "name username email")
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  // Map to unified format expected by the frontend
  const data = rawDocs.map((tx) => {
    const isCredit = tx.type === "credit";
    const isCompleted = tx.status === "completed";
    const isPending = tx.status === "pending";

    let displayStatus = "Completed";
    if (tx.category === "withdraw") {
      displayStatus = isCompleted ? "Paid" : isPending ? "Pending" : "Rejected";
    } else if (tx.type === "credit") {
      displayStatus = isCompleted ? "Credit" : isPending ? "Pending" : "Rejected";
    } else {
      displayStatus = isCompleted ? "Debit" : isPending ? "Pending" : "Rejected";
    }

    return {
      id: String(tx._id),
      trxId: tx.trxId,
      rawType: tx.category,
      title: tx.title,
      amount: Number(tx.amount || 0),
      flow: tx.type, // 'credit' | 'debit'
      status: displayStatus,
      statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      method: tx.method || (tx.category.includes("admin") ? "Admin Adjustment" : tx.category),
      account: tx.account || (tx.adminUser?.name ? tx.adminUser.name : ""),
      note: tx.note,
      image: tx.image,
      adminUser: tx.adminUser?.name || "Admin User",
      referredUser: tx.referredUser,
      gen: tx.gen,
      balanceBefore: tx.balanceBefore,
      balanceAfter: tx.balanceAfter,
    };
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};

module.exports = {
  adjustBalance,
  getUserTransactions,
  recordTransaction,
  updateTransactionByReference,
  syncHistoricalTransactions,
  getUserEarningsFeed,
};
