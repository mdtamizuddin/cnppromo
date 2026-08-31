const Gateway = require("./gateway.model");
const Setting = require("../Settings/setting.model");
const Topup = require("../TopUp/topup.model");
const Withdraw = require("../WithDraw/withdraw.model");

// Helper to sync account numbers to legacy settings.accounts
const syncToSettings = async (gateways) => {
  try {
    const accounts = {};
    gateways.forEach((g) => {
      const key = g.name.toLowerCase().replace(/\s+/g, "_");
      accounts[key] = g.accountNumber;
    });

    const setting = await Setting.findOne();
    if (setting) {
      setting.accounts = { ...(setting.accounts || {}), ...accounts };
      await setting.save();
    }
  } catch (error) {
    console.error("Failed to sync gateway to settings:", error.message);
  }
};

const getGateways = async (filter = {}) => {
  let query = {};
  if (filter.status) query.status = filter.status;
  if (filter.type && filter.type !== "all") query.type = filter.type;

  const gateways = await Gateway.find(query).sort({ order: 1, createdAt: 1 });
  return gateways;
};

const getGatewayStats = async () => {
  const [
    allGateways,
    totalTopups,
    totalWithdrawals,
    completedTopups,
    completedWithdrawals,
  ] = await Promise.all([
    Gateway.find().sort({ order: 1, createdAt: 1 }),
    Topup.countDocuments(),
    Withdraw.countDocuments(),
    Topup.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Withdraw.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  const total = allGateways.length;
  const active = allGateways.filter((g) => g.status === "Active").length;
  const inactive = allGateways.filter((g) => g.status === "Inactive").length;
  const maintenance = allGateways.filter((g) => g.status === "Maintenance").length;
  const totalTransactions = totalTopups + totalWithdrawals;

  const totalDepositVolume = completedTopups[0]?.total || 0;
  const totalWithdrawVolume = completedWithdrawals[0]?.total || 0;

  return {
    gateways: allGateways,
    total,
    active,
    inactive,
    maintenance,
    totalTransactions,
    totalDepositVolume,
    totalWithdrawVolume,
  };
};

const createGateway = async (data) => {
  const gateway = new Gateway(data);
  await gateway.save();

  const all = await Gateway.find();
  await syncToSettings(all);

  return gateway;
};

const updateGateway = async (id, data) => {
  const gateway = await Gateway.findByIdAndUpdate(id, data, { new: true });

  const all = await Gateway.find();
  await syncToSettings(all);

  return gateway;
};

const deleteGateway = async (id) => {
  await Gateway.findByIdAndDelete(id);

  const all = await Gateway.find();
  await syncToSettings(all);

  return { message: "Gateway deleted successfully" };
};

const getGatewayTransactions = async (gatewayName) => {
  if (!gatewayName) return [];

  const regex = new RegExp(gatewayName, "i");

  const [topups, withdrawals] = await Promise.all([
    Topup.find({ method: regex })
      .populate("user", "name username phone avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Withdraw.find({ gateway: regex })
      .populate("user", "name username phone avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const list = [
    ...topups.map((t) => ({
      type: "Deposit",
      trxId: t.transectionId || t.trx || "",
      amount: t.amount,
      currency: "৳",
      time: t.createdAt
        ? new Date(t.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently",
      status: t.status,
      user: t.user?.name || t.user?.username || "User",
      avatar: t.user?.avatar || "/default-avater.png",
      account: t.account,
    })),
    ...withdrawals.map((w) => ({
      type: "Withdrawal",
      trxId: w.transectionId || w.trx || "",
      amount: w.amount,
      currency: "৳",
      time: w.createdAt
        ? new Date(w.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently",
      status: w.status,
      user: w.user?.name || w.user?.username || "User",
      avatar: w.user?.avatar || "/default-avater.png",
      account: w.account,
    })),
  ];

  list.sort((a, b) => new Date(b.time) - new Date(a.time));

  return list;
};

module.exports = {
  getGateways,
  getGatewayStats,
  createGateway,
  updateGateway,
  deleteGateway,
  getGatewayTransactions,
};
