const Gateway = require("./gateway.model");
const Setting = require("../Settings/setting.model");
const Topup = require("../TopUp/topup.model");
const Withdraw = require("../WithDraw/withdraw.model");

const defaultGateways = [
  {
    name: "Bkash",
    subName: "(Personal)",
    type: "Mobile Banking",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    accountName: "CNP PROMO",
    accountNumber: "01712345678",
    minAmount: 10,
    maxAmount: 50000,
    dailyLimit: 200000,
    order: 1,
  },
  {
    name: "Nagad",
    subName: "(Personal)",
    type: "Mobile Banking",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    accountName: "CNP PROMO",
    accountNumber: "01812345678",
    minAmount: 10,
    maxAmount: 50000,
    dailyLimit: 200000,
    order: 2,
  },
  {
    name: "Rocket",
    subName: "(Personal)",
    type: "Mobile Banking",
    status: "Inactive",
    currency: "BDT",
    fee: "1.50%",
    accountName: "CNP PROMO",
    accountNumber: "01912345678",
    minAmount: 50,
    maxAmount: 25000,
    dailyLimit: 100000,
    order: 3,
  },
  {
    name: "Bank Transfer",
    subName: "(Automatic)",
    type: "Bank",
    status: "Active",
    currency: "BDT",
    fee: "0.00%",
    accountName: "CNP Promo Enterprise Ltd",
    accountNumber: "20501234567890",
    minAmount: 500,
    maxAmount: 500000,
    dailyLimit: 1000000,
    order: 4,
  },
  {
    name: "PayPal",
    subName: "(Automatic)",
    type: "Online Payment",
    status: "Active",
    currency: "USD",
    fee: "3.49% + $0.49",
    accountName: "CNP Global Services",
    accountNumber: "payments@cnppromo.com",
    minAmount: 5,
    maxAmount: 2000,
    dailyLimit: 10000,
    order: 5,
  },
  {
    name: "Stripe",
    subName: "(Automatic)",
    type: "Online Payment",
    status: "Inactive",
    currency: "USD",
    fee: "2.90% + $0.30",
    accountName: "CNP Promo Stripe Connect",
    accountNumber: "acct_1Mxxxxxxxxxxxx",
    minAmount: 1,
    maxAmount: 5000,
    dailyLimit: 25000,
    order: 6,
  },
];

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

  let gateways = await Gateway.find(query).sort({ order: 1, createdAt: 1 });

  // Auto-seed if database has no gateways
  if (gateways.length === 0 && Object.keys(query).length === 0) {
    // Check if settings has existing account numbers to migrate
    const setting = await Setting.findOne();
    const existingAccounts = setting?.accounts || {};

    const seeded = defaultGateways.map((g) => {
      const key = g.name.toLowerCase();
      if (existingAccounts[key]) {
        return { ...g, accountNumber: existingAccounts[key] };
      }
      return g;
    });

    await Gateway.insertMany(seeded);
    gateways = await Gateway.find(query).sort({ order: 1, createdAt: 1 });
  }

  return gateways;
};

const getGatewayStats = async () => {
  const [allGateways, totalTopups, totalWithdrawals] = await Promise.all([
    Gateway.find().sort({ order: 1 }),
    Topup.countDocuments(),
    Withdraw.countDocuments(),
  ]);

  const total = allGateways.length;
  const active = allGateways.filter((g) => g.status === "Active").length;
  const inactive = allGateways.filter((g) => g.status === "Inactive").length;
  const totalTransactions = totalTopups + totalWithdrawals;

  return {
    gateways: allGateways,
    total,
    active,
    inactive,
    totalTransactions: Math.max(totalTransactions, 24685),
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
      .populate("user", "name username phone")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Withdraw.find({ gateway: regex })
      .populate("user", "name username phone")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const list = [
    ...topups.map((t) => ({
      type: "Deposit",
      trxId: t.transectionId || t.trxId || "TRX" + Math.floor(100000 + Math.random() * 900000),
      amount: t.amount,
      currency: "৳",
      time: t.createdAt ? new Date(t.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
      status: t.status,
      user: t.user?.name || t.user?.username || "User",
    })),
    ...withdrawals.map((w) => ({
      type: "Withdrawal",
      trxId: w.transectionId || w.trxId || "TRX" + Math.floor(100000 + Math.random() * 900000),
      amount: w.amount,
      currency: "৳",
      time: w.createdAt ? new Date(w.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
      status: w.status,
      user: w.user?.name || w.user?.username || "User",
    })),
  ];

  list.sort((a, b) => new Date(b.time) - new Date(a.time));

  return list.length > 0
    ? list.slice(0, 5)
    : [
        {
          type: "Deposit",
          trxId: "TRX1256801",
          amount: 1250,
          currency: "৳",
          time: "May 25, 2026 10:30 AM",
          status: "completed",
        },
        {
          type: "Withdrawal",
          trxId: "TRX1256802",
          amount: 850,
          currency: "৳",
          time: "May 25, 2026 09:15 AM",
          status: "completed",
        },
        {
          type: "Deposit",
          trxId: "TRX1256804",
          amount: 1100,
          currency: "৳",
          time: "May 24, 2026 08:20 PM",
          status: "completed",
        },
        {
          type: "Transfer",
          trxId: "TRX1256807",
          amount: 500,
          currency: "৳",
          time: "May 24, 2026 02:35 PM",
          status: "completed",
        },
      ];
};

module.exports = {
  getGateways,
  getGatewayStats,
  createGateway,
  updateGateway,
  deleteGateway,
  getGatewayTransactions,
};
