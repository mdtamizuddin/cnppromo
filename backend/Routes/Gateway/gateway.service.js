const Gateway = require("./gateway.model");
const Setting = require("../Settings/setting.model");
const Topup = require("../TopUp/topup.model");
const Withdraw = require("../WithDraw/withdraw.model");

const defaultGateways = [
  {
    name: "Bkash",
    subName: "Personal Send Money",
    type: "Mobile Banking",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    feeType: "percentage",
    accountName: "CNP Official bKash",
    accountNumber: "01712345678",
    accountType: "Personal",
    branchName: "",
    qrCode: "",
    minAmount: 100,
    maxAmount: 25000,
    dailyLimit: 200000,
    monthlyLimit: 5000000,
    processingTime: "5-15 Minutes",
    instructions: "১. *247# ডায়াল করে অথবা বিকাশ অ্যাপ থেকে 'Send Money' অপশন সিলেক্ট করুন।\n২. উপরের অফিশিয়াল বিকাশ নম্বরে প্রয়োজনীয় পরিমাণ টাকা পাঠান।\n৩. সফলভাবে টাকা পাঠানোর পর প্রাপ্ত Transaction ID (TrxID) ও প্রেরক নম্বরটি ফর্মে সাবমিট করুন।",
    notice: "বিকাশ সেন্ড মানি (Personal) ২৪ ঘণ্টা সচল আছে।",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/bkash.png",
    tags: ["Instant", "Popular", "24/7"],
    order: 1,
  },
  {
    name: "Nagad",
    subName: "Personal Send Money",
    type: "Mobile Banking",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    feeType: "percentage",
    accountName: "CNP Official Nagad",
    accountNumber: "01812345678",
    accountType: "Personal",
    branchName: "",
    qrCode: "",
    minAmount: 100,
    maxAmount: 25000,
    dailyLimit: 200000,
    monthlyLimit: 5000000,
    processingTime: "5-15 Minutes",
    instructions: "১. *167# ডায়াল করে অথবা নগদ অ্যাপ থেকে 'Send Money' অপশন সিলেক্ট করুন।\n২. উপরের নগদ নম্বরে টাকা পাঠান।\n৩. টাকা পাঠানোর পর প্রাপ্ত TrxID ও প্রেরক নম্বরটি সাবমিট করুন।",
    notice: "নগদ অ্যাপ দিয়ে দ্রুত লেনদেন সম্পন্ন করুন।",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/nagad.png",
    tags: ["Fast", "Popular"],
    order: 2,
  },
  {
    name: "Rocket",
    subName: "DBBL Mobile Banking",
    type: "Mobile Banking",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    feeType: "percentage",
    accountName: "CNP Official Rocket",
    accountNumber: "019123456789",
    accountType: "Personal",
    branchName: "",
    qrCode: "",
    minAmount: 100,
    maxAmount: 25000,
    dailyLimit: 100000,
    monthlyLimit: 3000000,
    processingTime: "10-20 Minutes",
    instructions: "১. *322# অথবা রকেট অ্যাপের মাধ্যমে সেন্ড মানি করুন।\n২. ১২ ডিজিটের রকেট নম্বর সঠিকভাবে দিন।\n৩. TrxID ফর্মে এন্ট্রি করুন।",
    notice: "",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/rocket.png",
    tags: ["DBBL"],
    order: 3,
  },
  {
    name: "Bank Transfer",
    subName: "Online Bank Account",
    type: "Bank",
    status: "Active",
    currency: "BDT",
    fee: "0.00%",
    feeType: "percentage",
    accountName: "CNP Promo Enterprise Ltd",
    accountNumber: "20501234567890",
    accountType: "Current",
    branchName: "Gulshan Branch, Dhaka | Routing: 125271892",
    qrCode: "",
    minAmount: 500,
    maxAmount: 500000,
    dailyLimit: 1000000,
    monthlyLimit: 20000000,
    processingTime: "1-2 Hours",
    instructions: "যেকোনো ব্যাংক থেকে NPSB/BEFTN/RTGS এর মাধ্যমে ফান্ড ট্রান্সফার করুন এবং ডিপোজিট স্লিপ বা ট্রানজেকশন রেফারেন্স নম্বর দিন।",
    notice: "ব্যাংক ট্রান্সফারে কোনো চার্জ প্রযোজ্য নয় (0% Fee)।",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/bank.png",
    tags: ["0% Fee", "High Limit"],
    order: 4,
  },
  {
    name: "Upay",
    subName: "UCB Mobile Banking",
    type: "Mobile Banking",
    status: "Active",
    currency: "BDT",
    fee: "1.00%",
    feeType: "percentage",
    accountName: "CNP Official Upay",
    accountNumber: "01312345678",
    accountType: "Personal",
    branchName: "",
    qrCode: "",
    minAmount: 50,
    maxAmount: 25000,
    dailyLimit: 100000,
    monthlyLimit: 3000000,
    processingTime: "5-15 Minutes",
    instructions: "উপায় অ্যাপ থেকে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি দিন।",
    notice: "",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/upay.png",
    tags: ["Low Fee"],
    order: 5,
  },
  {
    name: "Binance Pay",
    subName: "USDT / Crypto Transfer",
    type: "Crypto",
    status: "Active",
    currency: "USDT",
    fee: "0.00%",
    feeType: "percentage",
    accountName: "CNP Crypto Pay",
    accountNumber: "284918290 (Binance Pay ID)",
    accountType: "Crypto Wallet",
    branchName: "BEP20 / TRC20",
    qrCode: "",
    minAmount: 5,
    maxAmount: 10000,
    dailyLimit: 50000,
    monthlyLimit: 1000000,
    processingTime: "Instant",
    instructions: "Send USDT via Binance Pay ID or BEP20 network. Submit your Pay Order ID / TxID.",
    notice: "Crypto deposits are verified instantly 24/7.",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/binance.svg",
    tags: ["Instant", "Global", "Crypto"],
    order: 6,
  },
  {
    name: "PayPal",
    subName: "International Payment",
    type: "Online Payment",
    status: "Active",
    currency: "USD",
    fee: "3.49% + $0.49",
    feeType: "percentage",
    accountName: "CNP Global Services",
    accountNumber: "payments@cnppromo.com",
    accountType: "Merchant",
    branchName: "",
    qrCode: "",
    minAmount: 5,
    maxAmount: 2000,
    dailyLimit: 10000,
    monthlyLimit: 100000,
    processingTime: "Instant - 30 Mins",
    instructions: "Send payment via PayPal Friends & Family or Goods & Services to our official email.",
    notice: "",
    isDepositSupported: true,
    isWithdrawSupported: true,
    icon: "/logo/paypal.svg",
    tags: ["Global", "USD"],
    order: 7,
  },
  {
    name: "Stripe",
    subName: "Credit / Debit Cards",
    type: "Online Payment",
    status: "Inactive",
    currency: "USD",
    fee: "2.90% + $0.30",
    feeType: "percentage",
    accountName: "CNP Promo Stripe Connect",
    accountNumber: "acct_1Mxxxxxxxxxxxx",
    accountType: "Merchant",
    branchName: "",
    qrCode: "",
    minAmount: 1,
    maxAmount: 5000,
    dailyLimit: 25000,
    monthlyLimit: 250000,
    processingTime: "Instant",
    instructions: "Pay using Visa, MasterCard, or American Express.",
    notice: "",
    isDepositSupported: true,
    isWithdrawSupported: false,
    icon: "/logo/stripe.svg",
    tags: ["Card", "Global"],
    order: 8,
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
    totalTransactions: Math.max(totalTransactions, 100),
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
      trxId: t.transectionId || t.trx || "TRX" + Math.floor(100000 + Math.random() * 900000),
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
      trxId: w.transectionId || w.trx || "TRX" + Math.floor(100000 + Math.random() * 900000),
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
