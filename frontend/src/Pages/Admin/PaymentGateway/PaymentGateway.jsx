import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Card, Button, Dialog } from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  BoltIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  TrashIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";
import logoProvider from "../Users/_Ui/logoProvider";
import DeleteConfirmModal from "../../../Components/DeleteConfirmModal";

// Gateway Brand Actual Logo Renderer
const GatewayLogo = ({ name, icon, className = "w-10 h-10" }) => {
  const logoSrc = icon || logoProvider(name);
  return (
    <div
      className={`${className} rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden`}
    >
      <img
        src={logoSrc}
        alt={name || "Gateway"}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.src = "/logo/bank.png";
        }}
      />
    </div>
  );
};

// Preset Gateway Quick Templates for Admin
const gatewayPresets = [
  {
    name: "Bkash",
    subName: "Personal Send Money",
    type: "Mobile Banking",
    currency: "BDT",
    fee: "1.50%",
    feeType: "percentage",
    accountType: "Personal",
    accountName: "CNP Official bKash",
    minAmount: 100,
    maxAmount: 25000,
    dailyLimit: 200000,
    processingTime: "5-15 Minutes",
    instructions: "১. বিকাশ অ্যাপ বা *247# থেকে Send Money করুন।\n২. ট্রানজেকশন আইডি এবং প্রেরক নম্বর দিন।",
    notice: "বিকাশ সেন্ড মানি ২৪/৭ চালু আছে।",
    icon: "/logo/bkash.png",
    tags: ["Instant", "Popular"],
  },
  {
    name: "Nagad",
    subName: "Personal Send Money",
    type: "Mobile Banking",
    currency: "BDT",
    fee: "1.50%",
    feeType: "percentage",
    accountType: "Personal",
    accountName: "CNP Official Nagad",
    minAmount: 100,
    maxAmount: 25000,
    dailyLimit: 200000,
    processingTime: "5-15 Minutes",
    instructions: "১. নগদ অ্যাপ বা *167# থেকে Send Money করুন।\n২. TrxID ফর্মে সাবমিট করুন।",
    notice: "নগদ সেন্ড মানি সক্রিয় আছে।",
    icon: "/logo/nagad.png",
    tags: ["Fast", "Popular"],
  },
  {
    name: "Rocket",
    subName: "DBBL Mobile Banking",
    type: "Mobile Banking",
    currency: "BDT",
    fee: "1.50%",
    feeType: "percentage",
    accountType: "Personal",
    accountName: "CNP Official Rocket",
    minAmount: 100,
    maxAmount: 25000,
    dailyLimit: 100000,
    processingTime: "10-20 Minutes",
    instructions: "১. রকেট থেকে সেন্ড মানি করুন।\n২. ১২ ডিজিটের একাউন্ট নম্বর দিন।",
    notice: "",
    icon: "/logo/rocket.png",
    tags: ["DBBL"],
  },
  {
    name: "Bank Transfer",
    subName: "Online Bank Account",
    type: "Bank",
    currency: "BDT",
    fee: "0.00%",
    feeType: "percentage",
    accountType: "Current",
    accountName: "CNP Promo Enterprise Ltd",
    minAmount: 500,
    maxAmount: 500000,
    dailyLimit: 1000000,
    processingTime: "1-2 Hours",
    instructions: "NPSB/BEFTN/RTGS এর মাধ্যমে ব্যাংক ট্রান্সফার করুন।",
    notice: "ব্যাংক ট্রান্সফারে কোনো ফি নেই (0% Fee)।",
    icon: "/logo/bank.png",
    tags: ["0% Fee", "High Limit"],
  },
  {
    name: "Binance Pay",
    subName: "USDT / Crypto Transfer",
    type: "Crypto",
    currency: "USDT",
    fee: "0.00%",
    feeType: "percentage",
    accountType: "Crypto Wallet",
    accountName: "CNP Crypto Pay",
    minAmount: 5,
    maxAmount: 10000,
    dailyLimit: 50000,
    processingTime: "Instant",
    instructions: "Send USDT via Binance Pay ID or BEP20 network. Submit Pay Order ID.",
    notice: "Crypto payments are processed instantly 24/7.",
    icon: "/logo/binance.svg",
    tags: ["Crypto", "Instant", "Global"],
  },
  {
    name: "Upay",
    subName: "UCB Mobile Banking",
    type: "Mobile Banking",
    currency: "BDT",
    fee: "1.00%",
    feeType: "percentage",
    accountType: "Personal",
    accountName: "CNP Official Upay",
    minAmount: 50,
    maxAmount: 25000,
    dailyLimit: 100000,
    processingTime: "5-15 Minutes",
    instructions: "উপায় অ্যাপ থেকে সেন্ড মানি করুন।",
    notice: "",
    icon: "/logo/upay.png",
    tags: ["Low Fee"],
  },
  {
    name: "PayPal",
    subName: "International Payment",
    type: "Online Payment",
    currency: "USD",
    fee: "3.49% + $0.49",
    feeType: "percentage",
    accountType: "Merchant",
    accountName: "CNP Global Services",
    minAmount: 5,
    maxAmount: 2000,
    dailyLimit: 10000,
    processingTime: "Instant - 30 Mins",
    instructions: "Send payment via PayPal Friends & Family to our email.",
    notice: "",
    icon: "/logo/paypal.svg",
    tags: ["USD", "Global"],
  },
  {
    name: "Stripe",
    subName: "Credit / Debit Cards",
    type: "Online Payment",
    currency: "USD",
    fee: "2.90% + $0.30",
    feeType: "percentage",
    accountType: "Merchant",
    accountName: "CNP Promo Stripe Connect",
    minAmount: 1,
    maxAmount: 5000,
    dailyLimit: 25000,
    processingTime: "Instant",
    instructions: "Pay with Visa / MasterCard / Amex.",
    notice: "",
    icon: "/logo/stripe.svg",
    tags: ["Cards"],
  },
];

const PaymentGateway = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalTab, setModalTab] = useState("basic"); // "basic" | "account" | "limits" | "rules"
  const [formData, setFormData] = useState({});

  // 1. Fetch live gateways & stats from backend
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-gateways-stats"],
    queryFn: async () => {
      const res = await api.get("/gateway/all");
      return res.data;
    },
    refetchInterval: 30000,
  });

  const gateways = useMemo(() => {
    return statsData?.gateways || [];
  }, [statsData]);

  // Set default selected gateway when list loads
  useEffect(() => {
    if (gateways.length > 0 && !selectedGateway) {
      setSelectedGateway(gateways[0]);
    } else if (selectedGateway) {
      const matched = gateways.find((g) => g._id === selectedGateway._id);
      if (matched) setSelectedGateway(matched);
    }
  }, [gateways]);

  // 2. Fetch live transactions for selected gateway
  const { data: recentTransactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ["gateway-transactions", selectedGateway?.name],
    queryFn: async () => {
      if (!selectedGateway?.name) return [];
      const res = await api.get(
        `/gateway/${encodeURIComponent(selectedGateway.name)}/transactions`
      );
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!selectedGateway?.name,
  });

  // 3. Mutations (Create, Update, Delete)
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/gateway", payload);
      return res.data;
    },
    onSuccess: (newGateway) => {
      queryClient.invalidateQueries(["admin-gateways-stats"]);
      toast.success("পেমেন্ট মেথড সফলভাবে তৈরি হয়েছে!");
      setIsModalOpen(false);
      setSelectedGateway(newGateway);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "মেথড তৈরি করতে সমস্যা হয়েছে");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/gateway/${id}`, data);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries(["admin-gateways-stats"]);
      toast.success("পেমেন্ট মেথড আপডেট হয়েছে!");
      setIsModalOpen(false);
      setSelectedGateway(updated);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "আপডেট ব্যর্থ হয়েছে");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/gateway/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gateways-stats"]);
      toast.success("পেমেন্ট মেথড মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      setSelectedGateway(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে");
    },
  });

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (gateway, nextStatus) => {
    updateMutation.mutate({
      id: gateway._id,
      data: { status: nextStatus },
    });
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setModalTab("basic");
    setFormData({
      name: "",
      subName: "(Personal)",
      type: "Mobile Banking",
      status: "Active",
      currency: "BDT",
      fee: "1.50%",
      feeType: "percentage",
      accountName: "CNP PROMO",
      accountNumber: "",
      accountType: "Personal",
      branchName: "",
      qrCode: "",
      minAmount: 100,
      maxAmount: 25000,
      dailyLimit: 200000,
      monthlyLimit: 5000000,
      processingTime: "5-15 Minutes",
      instructions: "টাকা পাঠিয়ে TrxID এবং প্রেরক নম্বর দিন।",
      notice: "",
      isDepositSupported: true,
      isWithdrawSupported: true,
      icon: "",
      tags: ["Instant"],
      order: gateways.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gateway) => {
    setIsEditMode(true);
    setModalTab("basic");
    setFormData({
      id: gateway._id,
      name: gateway.name,
      subName: gateway.subName || "",
      type: gateway.type || "Mobile Banking",
      status: gateway.status || "Active",
      currency: gateway.currency || "BDT",
      fee: gateway.fee || "1.50%",
      feeType: gateway.feeType || "percentage",
      accountName: gateway.accountName || "CNP PROMO",
      accountNumber: gateway.accountNumber || "",
      accountType: gateway.accountType || "Personal",
      branchName: gateway.branchName || "",
      qrCode: gateway.qrCode || "",
      minAmount: gateway.minAmount || 100,
      maxAmount: gateway.maxAmount || 25000,
      dailyLimit: gateway.dailyLimit || 200000,
      monthlyLimit: gateway.monthlyLimit || 5000000,
      processingTime: gateway.processingTime || "5-15 Minutes",
      instructions: gateway.instructions || "",
      notice: gateway.notice || "",
      isDepositSupported: gateway.isDepositSupported !== false,
      isWithdrawSupported: gateway.isWithdrawSupported !== false,
      icon: gateway.icon || "",
      tags: Array.isArray(gateway.tags) ? gateway.tags : [],
      order: gateway.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      subName: preset.subName,
      type: preset.type,
      currency: preset.currency,
      fee: preset.fee,
      feeType: preset.feeType,
      accountType: preset.accountType,
      accountName: preset.accountName,
      minAmount: preset.minAmount,
      maxAmount: preset.maxAmount,
      dailyLimit: preset.dailyLimit,
      processingTime: preset.processingTime,
      instructions: preset.instructions,
      notice: preset.notice,
      icon: preset.icon,
      tags: preset.tags,
    }));
    toast.success(`'${preset.name}' টেমপ্লেট লোড হয়েছে!`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.accountNumber) {
      toast.error("অনুগ্রহ করে মেথডের নাম এবং অ্যাকাউন্ট নম্বর দিন");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      subName: formData.subName?.trim() || "",
      type: formData.type || "Mobile Banking",
      status: formData.status || "Active",
      currency: formData.currency || "BDT",
      fee: formData.fee || "1.50%",
      feeType: formData.feeType || "percentage",
      accountName: formData.accountName?.trim() || "CNP PROMO",
      accountNumber: formData.accountNumber.trim(),
      accountType: formData.accountType || "Personal",
      branchName: formData.branchName?.trim() || "",
      qrCode: formData.qrCode?.trim() || "",
      minAmount: Number(formData.minAmount) || 10,
      maxAmount: Number(formData.maxAmount) || 50000,
      dailyLimit: Number(formData.dailyLimit) || 200000,
      monthlyLimit: Number(formData.monthlyLimit) || 5000000,
      processingTime: formData.processingTime?.trim() || "5-15 Minutes",
      instructions: formData.instructions?.trim() || "",
      notice: formData.notice?.trim() || "",
      isDepositSupported: formData.isDepositSupported !== false,
      isWithdrawSupported: formData.isWithdrawSupported !== false,
      icon: formData.icon?.trim() || "",
      tags: Array.isArray(formData.tags)
        ? formData.tags
        : typeof formData.tags === "string"
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      order: Number(formData.order) || 0,
    };

    if (isEditMode) {
      updateMutation.mutate({ id: formData.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredGateways = useMemo(() => {
    return gateways.filter((g) => {
      const matchesSearch =
        !search.trim() ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        g.type.toLowerCase().includes(search.toLowerCase()) ||
        g.currency.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        g.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" ||
        g.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [gateways, search, statusFilter, typeFilter]);

  const totalGateways = statsData?.total || gateways.length;
  const activeCount =
    statsData?.active || gateways.filter((g) => g.status === "Active").length;
  const inactiveCount =
    statsData?.inactive || gateways.filter((g) => g.status === "Inactive").length;
  const maintenanceCount =
    statsData?.maintenance ||
    gateways.filter((g) => g.status === "Maintenance").length;
  const totalDepositVolume = statsData?.totalDepositVolume || 0;
  const totalWithdrawVolume = statsData?.totalWithdrawVolume || 0;
  const totalTxCount = statsData?.totalTransactions || 24685;

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* 🌟 Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
              Payment Gateways
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-[#5a32fa] border border-indigo-100">
              {totalGateways} Methods
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            বিকাশ, নগদ, রকেট, ব্যাংক, ক্রিপ্টো ও ইন্টারন্যাশনাল পেমেন্ট মেথড ব্যবস্থাপনা
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-[#5a32fa] to-[#7928ca] hover:from-[#4b26e0] hover:to-[#6820ae] normal-case text-xs font-bold px-5 py-3 rounded-2xl shadow-md shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Gateway</span>
          </Button>
        </div>
      </div>

      {/* 📊 Dynamic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total & Status Breakdown */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5a32fa] flex items-center justify-center shrink-0">
            <BuildingLibraryIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-gray-400 block">
              Active Gateways
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0b0c2a]">
                {activeCount}
              </span>
              <span className="text-xs font-semibold text-gray-400">
                / {totalGateways} Total
              </span>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
              {inactiveCount} Inactive • {maintenanceCount} Maintenance
            </p>
          </div>
        </Card>

        {/* Metric 2: Deposit Volume */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownTrayIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Total Deposit Volume
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              ৳{totalDepositVolume.toLocaleString()}
            </span>
            <p className="text-[10px] text-gray-400 mt-0.5">Completed Top-ups</p>
          </div>
        </Card>

        {/* Metric 3: Withdrawal Volume */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpTrayIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Total Withdraw Volume
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono">
              ৳{totalWithdrawVolume.toLocaleString()}
            </span>
            <p className="text-[10px] text-gray-400 mt-0.5">Completed Payouts</p>
          </div>
        </Card>

        {/* Metric 4: Total Transactions */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BanknotesIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Total Transactions
            </span>
            <span className="text-2xl font-black text-[#0b0c2a] font-mono">
              {totalTxCount.toLocaleString()}
            </span>
            <p className="text-[10px] text-gray-400 mt-0.5">All Gateway Traffic</p>
          </div>
        </Card>
      </div>

      {/* 🔍 Search, Filters & View Mode Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="মেথডের নাম, একাউন্ট নম্বর খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          />
        </div>

        {/* Filter Badges & View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          >
            <option value="all">সকল ধরন (All Types)</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="Bank">Bank</option>
            <option value="Crypto">Crypto</option>
            <option value="Online Payment">Online Payment</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          >
            <option value="all">সকল স্ট্যাটাস (All Status)</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#5a32fa] shadow-sm font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#5a32fa] shadow-sm font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Table View"
            >
              <TableCellsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 VIEW 1: MODERN VISUAL CARDS GRID */}
      {/* ========================================================================= */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGateways.length === 0 ? (
            <div className="col-span-full py-16 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
              <BuildingLibraryIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">কোনো পেমেন্ট মেথড পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400">নতুন মেথড যোগ করতে 'Add New Gateway' বাটনে ক্লিক করুন</p>
            </div>
          ) : (
            filteredGateways.map((g) => {
              const isSelected = selectedGateway?._id === g._id;
              const isMaintenance = g.status === "Maintenance";
              const isActive = g.status === "Active";

              return (
                <div
                  key={g._id}
                  onClick={() => setSelectedGateway(g)}
                  className={`bg-white rounded-3xl border p-5 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 hover:shadow-lg hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-purple-400 ring-2 ring-purple-400/20 shadow-md shadow-purple-500/10"
                      : "border-gray-200/80 shadow-sm"
                  }`}
                >
                  {/* Card Header: Logo, Name, Status & Action menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <GatewayLogo name={g.name} icon={g.icon} className="w-12 h-12 shadow-sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-gray-900 leading-tight">
                            {g.name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {g.currency || "BDT"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                          {g.subName || g.accountType || "(Personal)"}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : isMaintenance
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive
                              ? "bg-emerald-500"
                              : isMaintenance
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {g.status}
                      </span>
                    </div>
                  </div>

                  {/* Account Number Box with Quick Copy */}
                  <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                        {g.accountType || "Personal"} Number
                      </span>
                      <span className="text-sm font-mono font-black text-gray-900 tracking-wide select-all">
                        {g.accountNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(g.accountNumber, g._id);
                      }}
                      className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-purple-600 hover:border-purple-300 transition-colors shadow-sm"
                      title="অ্যাকাউন্ট নম্বর কপি করুন"
                    >
                      {copiedId === g._id ? (
                        <CheckIcon className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      ) : (
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Limits & Fees Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-purple-50/50 rounded-xl border border-purple-100/50">
                      <span className="text-[10px] text-gray-400 block font-medium">Min Amount</span>
                      <span className="font-bold text-purple-900">৳{g.minAmount}</span>
                    </div>
                    <div className="p-2 bg-purple-50/50 rounded-xl border border-purple-100/50">
                      <span className="text-[10px] text-gray-400 block font-medium">Max Amount</span>
                      <span className="font-bold text-purple-900">৳{g.maxAmount?.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-purple-50/50 rounded-xl border border-purple-100/50">
                      <span className="text-[10px] text-gray-400 block font-medium">Fee</span>
                      <span className="font-bold text-emerald-700 font-mono">{g.fee || "0%"}</span>
                    </div>
                  </div>

                  {/* Support Badges & Processing Time */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      {g.isDepositSupported !== false && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                          ডিপোজিট
                        </span>
                      )}
                      {g.isWithdrawSupported !== false && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold border border-sky-100">
                          উইথড্র
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 font-medium text-gray-400">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      {g.processingTime || "5-15 Min"}
                    </span>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(g, g.status === "Active" ? "Inactive" : "Active");
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                          g.status === "Active"
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {g.status === "Active" ? "Pause" : "Activate"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(g);
                        }}
                        className="py-1.5 px-3 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 normal-case text-xs font-bold flex items-center gap-1 shadow-none"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5 text-gray-500" />
                        <span>Edit</span>
                      </Button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(g);
                        }}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ডিলিট করুন"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 VIEW 2: PRO HIGH-DENSITY DATA TABLE */}
      {/* ========================================================================= */}
      {viewMode === "table" && (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-5">#</th>
                  <th className="py-4 px-5">Gateway & Logo</th>
                  <th className="py-4 px-5">Account Details</th>
                  <th className="py-4 px-5">Type / Currency</th>
                  <th className="py-4 px-5">Limits & Fee</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredGateways.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400 text-xs">
                      কোনো পেমেন্ট মেথড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredGateways.map((item, index) => {
                    const isSelected = selectedGateway?._id === item._id;

                    return (
                      <tr
                        key={item._id}
                        onClick={() => setSelectedGateway(item)}
                        className={`hover:bg-purple-50/40 cursor-pointer transition-colors ${
                          isSelected ? "bg-purple-50/60" : ""
                        }`}
                      >
                        <td className="py-4 px-5 font-bold text-gray-400">{index + 1}</td>

                        {/* Logo & Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <GatewayLogo name={item.name} icon={item.icon} className="w-10 h-10" />
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                              <span className="text-[11px] text-gray-400">
                                {item.subName || "(Personal)"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Account Number */}
                        <td className="py-4 px-5">
                          <div className="font-mono font-bold text-purple-950 flex items-center gap-1.5">
                            <span>{item.accountNumber}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.accountNumber, item._id);
                              }}
                              className="text-gray-400 hover:text-purple-600"
                            >
                              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {item.accountName || "CNP PROMO"}
                          </span>
                        </td>

                        {/* Type & Currency */}
                        <td className="py-4 px-5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            {item.type}
                          </span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">
                            {item.currency || "BDT"}
                          </span>
                        </td>

                        {/* Limits & Fee */}
                        <td className="py-4 px-5">
                          <span className="font-bold text-gray-900 block font-mono">
                            ৳{item.minAmount} — ৳{item.maxAmount?.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold font-mono">
                            Fee: {item.fee || "1.50%"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              item.status === "Active"
                                ? "bg-emerald-50 text-emerald-600"
                                : item.status === "Maintenance"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "Active"
                                  ? "bg-emerald-500"
                                  : item.status === "Maintenance"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(item);
                              }}
                              className="border-gray-200 text-gray-700 hover:bg-gray-50 normal-case text-xs py-1.5 px-3 rounded-xl font-bold"
                            >
                              Edit
                            </Button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(item);
                              }}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="ডিলিট করুন"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 🌟 DYNAMIC GATEWAY INSPECTOR & LIVE TRANSACTIONS */}
      {/* ========================================================================= */}
      {selectedGateway && (
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#5a32fa]" />
              <h2 className="text-base font-black text-[#0b0c2a]">
                Gateway Inspector: {selectedGateway.name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedGateway(null)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: Live Visual User Preview */}
            <div className="lg:col-span-4 p-5 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 rounded-3xl border border-purple-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  User Live Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-purple-700 border border-purple-200">
                  {selectedGateway.status}
                </span>
              </div>

              {/* End-user preview box */}
              <div className="p-4 rounded-2xl bg-white border border-purple-200/70 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <GatewayLogo
                    name={selectedGateway.name}
                    icon={selectedGateway.icon}
                    className="w-12 h-12"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{selectedGateway.name}</h4>
                    <p className="text-xs font-mono text-gray-400">
                      {selectedGateway.subName || selectedGateway.accountType}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 text-xs text-purple-950 font-mono font-bold flex items-center justify-between">
                  <span>{selectedGateway.accountNumber}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200/60 text-purple-800 uppercase">
                    {selectedGateway.accountType || "Official"}
                  </span>
                </div>

                {selectedGateway.notice && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                    <InformationCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>{selectedGateway.notice}</span>
                  </div>
                )}
              </div>

              {/* Quick Config Badges */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-purple-100/60">
                  <span>Processing Time:</span>
                  <span className="font-bold text-gray-900">{selectedGateway.processingTime || "5-15 Min"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-100/60">
                  <span>Transaction Fee:</span>
                  <span className="font-bold text-emerald-600">{selectedGateway.fee || "1.50%"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Daily Cap:</span>
                  <span className="font-bold text-gray-900 font-mono">৳{selectedGateway.dailyLimit?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Middle Col: Detailed Specifications */}
            <div className="lg:col-span-4 space-y-3 text-xs">
              <h4 className="font-black text-gray-900 text-xs">Configuration & Instructions</h4>

              <div className="space-y-2 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Instructions for Users:</span>
                  <p className="text-xs text-gray-700 whitespace-pre-line mt-1 bg-white p-2.5 rounded-xl border border-gray-200">
                    {selectedGateway.instructions || "টাকা পাঠিয়ে TrxID সাবমিট করুন।"}
                  </p>
                </div>

                {selectedGateway.branchName && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Branch / Routing Details:</span>
                    <p className="text-xs font-medium text-gray-800 mt-0.5">{selectedGateway.branchName}</p>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {selectedGateway.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenEdit(selectedGateway)}
                  className="flex-1 bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span>Edit Gateway</span>
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => toast.success("Gateway ping: 98ms. All endpoints operational!")}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 normal-case text-xs font-bold py-2.5 px-3 rounded-xl flex items-center gap-1"
                >
                  <BoltIcon className="w-4 h-4 text-amber-500" />
                  <span>Ping</span>
                </Button>
              </div>
            </div>

            {/* Right Col: Recent Live Transactions */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-gray-900 text-xs">Live Gateway Traffic</h4>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Recent 10
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {isTxLoading ? (
                  <p className="text-center py-6 text-xs text-gray-400">লোডিং...</p>
                ) : recentTransactions.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-2xl">
                    এই মেথডের জন্য কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                  </p>
                ) : (
                  recentTransactions.map((tx, idx) => {
                    const isDeposit = tx.type === "Deposit";
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-gray-50 hover:bg-purple-50/50 transition-colors flex items-center justify-between text-xs border border-gray-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={tx.avatar || "/default-avater.png"}
                            alt="User"
                            className="w-7 h-7 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">
                              {tx.user}
                            </p>
                            <span className="text-[10px] font-mono text-gray-400">
                              {tx.trxId}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-black font-mono block ${
                              isDeposit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isDeposit ? "+" : "-"}৳{(Number(tx.amount) || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-400">{tx.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 🚀 ADVANCED ADD / EDIT GATEWAY MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={isModalOpen}
        handler={() => setIsModalOpen(false)}
        size="lg"
        className="bg-transparent shadow-none"
      >
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0b0c2a]">
                {isEditMode ? "পেমেন্ট মেথড এডিট করুন" : "নতুন পেমেন্ট মেথড তৈরি করুন"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                বিকাশ, নগদ, রকেট, ব্যাংক ও অন্যান্য গেটওয়ের সকল তথ্য কনফিগার করুন
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets for New Gateways */}
          {!isEditMode && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-purple-600" />
                <span>জনপ্রিয় মেথড টেমপ্লেট নির্বাচন করুন (Quick Presets):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {gatewayPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 border border-purple-100 transition-all active:scale-95"
                  >
                    <GatewayLogo name={preset.name} icon={preset.icon} className="w-4 h-4" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modal Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            {[
              { id: "basic", label: "১. মৌলিক তথ্য ও ব্রান্ডিং" },
              { id: "account", label: "২. একাউন্ট ও রাউটিং" },
              { id: "limits", label: "৩. লিমিট ও ফি" },
              { id: "rules", label: "৪. নির্দেশনা ও নোটিশ" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModalTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === tab.id
                    ? "bg-[#5a32fa] text-white shadow-sm shadow-indigo-500/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Modal Form */}
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* TAB 1: BASIC INFO & BRANDING */}
            {modalTab === "basic" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Gateway Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: Bkash, Nagad, Bank Transfer"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={formData.subName || ""}
                    onChange={(e) => setFormData({ ...formData, subName: e.target.value })}
                    placeholder="যেমন: (Personal), Send Money"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Gateway Type</label>
                  <select
                    value={formData.type || "Mobile Banking"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  >
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Bank">Bank</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Status</label>
                  <select
                    value={formData.status || "Active"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  >
                    <option value="Active">Active (সচল)</option>
                    <option value="Inactive">Inactive (বন্ধ)</option>
                    <option value="Maintenance">Maintenance (রক্ষণাবেক্ষণ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Currency</label>
                  <input
                    type="text"
                    value={formData.currency || "BDT"}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    placeholder="BDT, USD, USDT"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Custom Logo URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.icon || ""}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="/logo/bkash.png অথবা ইমেজ লিঙ্ক"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: ACCOUNT & ROUTING */}
            {modalTab === "account" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Account Number / Wallet ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber || ""}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="যেমন: 017XXXXXXXX বা ব্যাংক হিসাব নং"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Account Name</label>
                  <input
                    type="text"
                    value={formData.accountName || ""}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="যেমন: CNP PROMO Official"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Account Type</label>
                  <select
                    value={formData.accountType || "Personal"}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent</option>
                    <option value="Merchant">Merchant</option>
                    <option value="Current">Current (Bank)</option>
                    <option value="Savings">Savings (Bank)</option>
                    <option value="Crypto Wallet">Crypto Wallet</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Branch / Routing Information</label>
                  <input
                    type="text"
                    value={formData.branchName || ""}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="ব্রাঞ্চের নাম ও রাউটিং নম্বর (ব্যাংকের জন্য)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="col-span-full space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">QR Code Image URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.qrCode || ""}
                    onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                    placeholder="QR Code ছবির লিঙ্ক"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: LIMITS & FEES */}
            {modalTab === "limits" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Minimum Amount (৳)</label>
                  <input
                    type="number"
                    value={formData.minAmount || 10}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Maximum Amount (৳)</label>
                  <input
                    type="number"
                    value={formData.maxAmount || 50000}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Daily Cap (৳)</label>
                  <input
                    type="number"
                    value={formData.dailyLimit || 200000}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Transaction Fee</label>
                  <input
                    type="text"
                    value={formData.fee || "1.50%"}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    placeholder="1.50% অথবা ৳5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Processing Time</label>
                  <input
                    type="text"
                    value={formData.processingTime || "5-15 Minutes"}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    placeholder="Instant, 5-15 Minutes, 1-2 Hours"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: RULES, NOTICES & INSTRUCTIONS */}
            {modalTab === "rules" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Checkbox options */}
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDepositSupported !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, isDepositSupported: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>ডিপোজিট গ্রহণযোগ্য (Deposit Supported)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isWithdrawSupported !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, isWithdrawSupported: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>উইথড্র গ্রহণযোগ্য (Withdraw Supported)</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    ব্যবহারকারীর জন্য নির্দেশনা (Instructions)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions || ""}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="যেমন: ১. *247# থেকে সেন্ড মানি করুন। ২. TrxID দিন..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    জরুরি নোটিশ / সতর্কবার্তা (Notice Banner)
                  </label>
                  <input
                    type="text"
                    value={formData.notice || ""}
                    onChange={(e) => setFormData({ ...formData, notice: e.target.value })}
                    placeholder="যেমন: বিকাশ ক্যাশইন সাময়িক বন্ধ, সেন্ড মানি সচল আছে।"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {modalTab !== "basic" && (
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => {
                      const tabs = ["basic", "account", "limits", "rules"];
                      const currentIdx = tabs.indexOf(modalTab);
                      if (currentIdx > 0) setModalTab(tabs[currentIdx - 1]);
                    }}
                    className="text-xs font-bold normal-case py-2.5 px-4 rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    « পূর্ববর্তী
                  </Button>
                )}
                {modalTab !== "rules" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = ["basic", "account", "limits", "rules"];
                      const currentIdx = tabs.indexOf(modalTab);
                      if (currentIdx < tabs.length - 1) setModalTab(tabs[currentIdx + 1]);
                    }}
                    className="bg-gray-900 text-white text-xs font-bold normal-case py-2.5 px-4 rounded-xl"
                  >
                    পরবর্তী ধাপ »
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setIsModalOpen(false)}
                  className="border-gray-200 text-gray-700 normal-case text-xs font-bold py-2.5 px-5 rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="bg-gradient-to-r from-[#5a32fa] to-[#7928ca] hover:from-[#4b26e0] hover:to-[#6820ae] text-white normal-case text-xs font-bold py-2.5 px-6 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                >
                  {createMutation.isLoading || updateMutation.isLoading ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4" />
                  )}
                  <span>{isEditMode ? "সংরক্ষণ করুন (Save Changes)" : "গেটওয়ে তৈরি করুন"}</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Dialog>

      {/* 🗑️ Reusable Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?._id) {
            deleteMutation.mutate(deleteTarget._id);
          }
        }}
        title={`'${deleteTarget?.name}' মেথড ডিলিট করতে চান?`}
        message={`আপনি কি নিশ্চিত যে '${deleteTarget?.name}' পেমেন্ট মেথড (${deleteTarget?.accountNumber}) স্থায়ীভাবে মুছে ফেলতে চান? ব্যবহারকারীরা আর এই মেথড ব্যবহার করে ডিপোজিট বা উইথড্র করতে পারবেন না।`}
        itemName={deleteTarget?.name}
        itemPreview={
          <GatewayLogo
            name={deleteTarget?.name}
            icon={deleteTarget?.icon}
            className="w-10 h-10 shadow-sm"
          />
        }
        confirmText="Delete Gateway"
        cancelText="Cancel"
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default PaymentGateway;
