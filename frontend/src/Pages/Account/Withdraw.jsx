import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Dialog } from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  QuestionMarkCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  CheckIcon,
  ArrowPathIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "react-query";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import { refreshUser } from "../../redux/features/user/userSlice";
import HistoryTable from "./HistoryTable";
import Loader from "../../Components/Loader";

const quickAmounts = [300, 500, 1000, 2000, 5000];

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const maskAccount = (str) => {
  if (!str) return "01*********";
  if (str.length < 6) return str;
  return str.slice(0, 3) + "*".repeat(Math.max(0, str.length - 5)) + str.slice(-2);
};

const Withdraw = () => {
  const [step, setStep] = useState(1); // 1: Request, 2: Confirm, 3: Complete
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSuccessData, setLastSuccessData] = useState(null);

  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Fetch dynamic active gateways from database
  const { data: dynamicGateways = [], isLoading: isGatewayLoading } = useQuery({
    queryKey: ["active-payment-gateways"],
    queryFn: async () => {
      try {
        const res = await api.get("/gateway?status=Active");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const paymentMethods = useMemo(() => {
    if (!dynamicGateways || dynamicGateways.length === 0) return [];
    return dynamicGateways
      .filter((g) => g.status === "Active" && g.isWithdrawSupported !== false)
      .map((g) => {
        const nameLower = (g.name || "").toLowerCase();
        let logo = "/logo/bkash.png";
        let themeColor = "from-pink-500 to-rose-600";
        let accentColor = "#d9176c";
        let bgActive = "border-pink-400 bg-pink-50/30 ring-2 ring-pink-400/20";

        if (nameLower.includes("bkash")) {
          logo = "/logo/bkash.png";
          themeColor = "from-pink-500 to-rose-600";
          accentColor = "#d9176c";
          bgActive = "border-pink-400 bg-pink-50/30 ring-2 ring-pink-400/20";
        } else if (nameLower.includes("nagad")) {
          logo = "/logo/nagad.png";
          themeColor = "from-orange-500 to-amber-600";
          accentColor = "#f97316";
          bgActive = "border-orange-400 bg-orange-50/30 ring-2 ring-orange-400/20";
        } else if (nameLower.includes("rocket")) {
          logo = "/logo/rocket.png";
          themeColor = "from-purple-500 to-indigo-600";
          accentColor = "#8b5cf6";
          bgActive = "border-purple-400 bg-purple-50/30 ring-2 ring-purple-400/20";
        } else if (nameLower.includes("bank")) {
          logo = "/logo/bank.png";
          themeColor = "from-blue-600 to-indigo-700";
          accentColor = "#2563eb";
          bgActive = "border-blue-400 bg-blue-50/30 ring-2 ring-blue-400/20";
        } else if (nameLower.includes("upay")) {
          logo = "/logo/upay.png";
          themeColor = "from-amber-600 to-yellow-700";
          accentColor = "#d97706";
          bgActive = "border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/20";
        } else if (nameLower.includes("recharge")) {
          logo = "/logo/recharge.png";
          themeColor = "from-emerald-600 to-teal-700";
          accentColor = "#059669";
          bgActive = "border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400/20";
        } else if (nameLower.includes("paypal")) {
          logo = "/logo/paypal.svg";
          themeColor = "from-sky-600 to-blue-700";
          accentColor = "#0284c7";
          bgActive = "border-sky-400 bg-sky-50/30 ring-2 ring-sky-400/20";
        } else if (nameLower.includes("stripe")) {
          logo = "/logo/stripe.svg";
          themeColor = "from-indigo-600 to-purple-700";
          accentColor = "#4f46e5";
          bgActive = "border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-400/20";
        } else if (nameLower.includes("payeer")) {
          logo = "/logo/payeer.svg";
          themeColor = "from-sky-500 to-cyan-600";
          accentColor = "#0ea5e9";
          bgActive = "border-sky-400 bg-sky-50/30 ring-2 ring-sky-400/20";
        } else if (nameLower.includes("binance") || nameLower.includes("usdt") || nameLower.includes("crypto")) {
          logo = "/logo/binance.svg";
          themeColor = "from-amber-500 to-yellow-600";
          accentColor = "#f59e0b";
          bgActive = "border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/20";
        }

        return {
          id: g.name,
          name: g.name,
          subtitle: g.subName || "ক্যাশআউট",
          logo: g.icon || logo,
          minAmount: Number(g.minAmount) || 300,
          maxAmount: Number(g.maxAmount) || 25000,
          dailyLimit: Number(g.dailyLimit) || 200000,
          fee: g.fee || "1.50%",
          currency: g.currency || "BDT",
          themeColor,
          accentColor,
          bgActive,
        };
      });
  }, [dynamicGateways]);

  // Sync selected method with active gateways or user preference
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const match = paymentMethods.find(
        (m) => m.id.toLowerCase() === (user?.paymentMethod || "").toLowerCase()
      );
      if (match) {
        setSelectedMethod(match.id);
      } else if (!paymentMethods.some((m) => m.id === selectedMethod)) {
        setSelectedMethod(paymentMethods[0].id);
      }
    }
  }, [paymentMethods, user?.paymentMethod]);

  // Auto-fill account number from user profile if available
  useEffect(() => {
    if (user?.account && user.account !== "0000000" && !account) {
      setAccount(user.account);
    }
  }, [user?.account]);

  // Fetch user's pending withdrawals to show accurate pending balance
  const { data: pendingData, refetch: refetchPending } = useQuery({
    queryKey: ["user-pending-withdraw", user?._id],
    queryFn: async () => {
      const res = await api.get(`/withdraw?user=${user?._id}&status=pending&limit=100`);
      return res.data;
    },
    enabled: !!user?._id,
  });

  const pendingBalance =
    pendingData?.data?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  const currentMethod =
    paymentMethods.find((m) => m.id === selectedMethod) ||
    paymentMethods[0] || {
      id: "",
      name: "Payment Method",
      subtitle: "",
      logo: "/logo/bank.png",
      minAmount: 300,
      maxAmount: 25000,
      dailyLimit: 200000,
      fee: "0%",
      currency: "BDT",
      themeColor: "from-gray-500 to-gray-700",
      accentColor: "#6b7280",
      bgActive: "",
    };

  const userBalance = Number(user?.balance || 0);
  const numAmount = Number(amount || 0);
  const withdrawCharge = 0.0;
  const netReceive = Math.max(0, numAmount - withdrawCharge);

  const isBelowMin = numAmount > 0 && numAmount < currentMethod.minAmount;
  const isAboveMax = numAmount > currentMethod.maxAmount;
  const isInsufficient = numAmount > userBalance;
  const isAccountValid = account.trim().length >= 11;

  const canProceedToConfirm =
    numAmount >= currentMethod.minAmount &&
    numAmount <= currentMethod.maxAmount &&
    numAmount <= userBalance &&
    isAccountValid;

  const handleContinueToConfirm = (e) => {
    if (e) e.preventDefault();
    if (!canProceedToConfirm) {
      if (isInsufficient) {
        toast.error("আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই");
      } else if (isBelowMin) {
        toast.error(`সর্বনিম্ন উইথড্রয়াল সীমা ৳${currentMethod.minAmount}.00`);
      } else if (!isAccountValid) {
        toast.error("সঠিক ১১ ডিজিটের অ্যাকাউন্ট নম্বর দিন");
      } else {
        toast.error("অনুগ্রহ করে সঠিক তথ্য পূরণ করুন");
      }
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmSubmit = async () => {
    if (!canProceedToConfirm) return;

    setLoading(true);
    const newData = {
      amount: numAmount,
      account: account.trim(),
      user: user?._id,
      method: selectedMethod,
    };

    try {
      const res = await api.post("/withdraw", newData);
      setLastSuccessData(res.data);
      dispatch(refreshUser(res.data._id || user?._id));
      refetchPending();
      setStep(3);
      toast.success("উইথড্র রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে!");
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "উইথড্র করতে সমস্যা হয়েছে, অনুগ্রহ করে পরে আবার চেষ্টা করুন";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setAmount("");
    setAccount("");
    setStep(1);
    setLastSuccessData(null);
  };

  if (loading) {
    return <Loader />;
  }

  // 🌟 Balance Card Component (Rendered on top for mobile, sidebar on desktop)
  const renderBalanceCard = () => (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b0852] via-[#481282] to-[#671fb8] text-white p-6 sm:p-7 shadow-xl shadow-purple-900/20 border border-purple-400/20">
      {/* Glow backgrounds */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1.5 max-w-[65%]">
          <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold">
            <span>Available Balance</span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/10"
              title={showBalance ? "ব্যালেন্স লুকান" : "ব্যালেন্স দেখুন"}
            >
              {showBalance ? (
                <EyeIcon className="w-4 h-4 text-purple-200 hover:text-white" />
              ) : (
                <EyeSlashIcon className="w-4 h-4 text-purple-300" />
              )}
            </button>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
            <span>৳</span>
            <span>{showBalance ? formatCurrency(userBalance) : "••••••"}</span>
          </div>

          <div className="text-[11px] font-medium text-purple-200/90 pt-0.5">
            Minimum Withdraw: ৳{formatCurrency(currentMethod.minAmount)}
          </div>
        </div>

        {/* 3D Purple Wallet Visual */}
        <div className="relative shrink-0 -mt-2 -mr-1">
          <img
            src="/wallet_3d_illustration.png"
            alt="Wallet 3D"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl select-none pointer-events-none transform hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Pending Balance Capsule */}
      <div className="mt-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 text-xs text-purple-100">
          <ClockIcon className="w-4 h-4 text-purple-300" />
          <span className="font-medium">Pending Balance</span>
          <span className="font-bold text-white ml-2">৳{formatCurrency(pendingBalance)}</span>
        </div>
      </div>
    </div>
  );

  // 🌟 Summary Breakdown Card
  const renderSummaryCard = () => (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
      <h2 className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight flex items-center justify-between">
        <span>3. Withdraw Summary</span>
        {numAmount > 0 && (
          <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
            লাইভ হিসাব
          </span>
        )}
      </h2>

      <div className="space-y-2.5 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Available Balance</span>
          <span className="font-bold text-gray-900">৳{formatCurrency(userBalance)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Withdraw Amount</span>
          <span className="font-bold text-gray-900">৳{formatCurrency(numAmount)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Withdraw Charge</span>
          <span className="font-bold text-emerald-600">৳{formatCurrency(withdrawCharge)}</span>
        </div>

        <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-sm">You Will Receive</span>
          <span className="font-black text-[#e81c78] text-base sm:text-lg">
            ৳{formatCurrency(netReceive)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 transition-all">
      {/* 📱 Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : window.history.back())}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            title="পূর্ববর্তী ধাপে ফিরুন"
          >
            <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Withdraw
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              টাকা উত্তোলনের রিকোয়েস্ট করুন সরাসরি বিকাশ, নগদ, রকেটে
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold"
          title="উইথড্র সহায়তা ও নিয়মাবলি"
        >
          <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600 stroke-[2]" />
          <span className="hidden sm:inline">সহায়তা ও নিয়মাবলি</span>
        </button>
      </div>

      {/* 📱 Top Balance Card (Visible only on mobile/tablet screens < lg) */}
      <div className="block lg:hidden">{renderBalanceCard()}</div>

      {/* ========================================================================= */}
      {/* 🚀 RESPONSIVE 2-COLUMN GRID (Desktop: Left Form + Right Sticky Balance/Summary) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: Steps (Request -> Confirm -> Complete) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5">
          
          {/* STEP 1: REQUEST FORM */}
          {step === 1 && (
            isGatewayLoading ? (
              <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-3">
                <ArrowPathIcon className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs text-gray-500 font-semibold">পেমেন্ট মেথড লোড হচ্ছে...</p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <BuildingLibraryIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    বর্তমানে কোনো উইথড্রয়াল গেটওয়ে সচল নেই
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                    সিস্টেমে এই মুহূর্তে কোনো উইথড্রয়াল মেথড অ্যাক্টিভ নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা সরাসরি সাপোর্টে যোগাযোগ করুন।
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <a
                    href="https://wa.me/+8801731686679"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    সাপোর্টে যোগাযোগ করুন
                  </a>
                </div>
              </div>
            ) : (
            <div className="space-y-5 animate-fadeIn">
              {/* 1. Select Payment Method Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight">
                    1. Select Payment Method
                  </h2>
                  <span className="text-[11px] font-semibold text-purple-600">
                    মেথড নির্বাচন করুন
                  </span>
                </div>

                {/* Responsive Grid: 1 col on mobile, 2 cols on sm/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? m.bgActive
                            : "border-gray-200/90 bg-white hover:bg-gray-50/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                            <img
                              src={m.logo}
                              alt={m.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = "/logo/bank.png";
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{m.name}</div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {account && isSelected ? maskAccount(account) : m.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Radio circle */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#e81c78] text-white shadow-sm ring-4 ring-pink-100"
                              : "border-2 border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Account Number Input */}
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    আপনার {currentMethod.name} অ্যাকাউন্ট নম্বর লিখুন:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={account}
                      onChange={(e) => setAccount(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                    />
                    {account.length === 11 && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1">
                        <span className="text-[11px] font-bold hidden sm:inline text-emerald-600">
                          সঠিক নম্বর
                        </span>
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info note */}
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-2 text-xs text-purple-900 font-medium">
                  <InformationCircleIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Withdraw only to your own account number.</span>
                </div>
              </div>

              {/* 2. Enter Withdraw Amount Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight">
                    2. Enter Withdraw Amount
                  </h2>
                  <span className="text-[11px] font-semibold text-gray-400">
                    সীমা: ৳{currentMethod.minAmount} — ৳{currentMethod.maxAmount}
                  </span>
                </div>

                {/* Amount input with Currency Symbol and "All" button */}
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-700 font-bold text-base select-none">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-16 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(userBalance > 0 ? userBalance.toString() : "")}
                    className="absolute right-2.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-black active:scale-95 transition-all"
                  >
                    All
                  </button>
                </div>

                {/* Quick Amount Pills */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                  {quickAmounts.map((qa) => {
                    const isSelected = Number(amount) === qa;
                    return (
                      <button
                        key={qa}
                        type="button"
                        onClick={() => setAmount(qa.toString())}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20 scale-[1.02]"
                            : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100/80"
                        }`}
                      >
                        ৳{qa.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                {/* Validation Alerts */}
                {isBelowMin && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 pt-1">
                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                    <span>সর্বনিম্ন উত্তোলনের পরিমাণ ৳{currentMethod.minAmount}.00</span>
                  </p>
                )}
                {isInsufficient && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 pt-1">
                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                    <span>আপনার পর্যাপ্ত ব্যালেন্স নেই (বর্তমান ব্যালেন্স: ৳{userBalance})</span>
                  </p>
                )}

                {/* Minimum withdraw note */}
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-2 text-xs text-purple-900 font-medium">
                  <InformationCircleIcon className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p>Minimum withdraw amount is ৳{formatCurrency(currentMethod.minAmount)}.</p>
                    <p className="text-purple-600/80 text-[11px]">Withdraw charges may apply.</p>
                  </div>
                </div>
              </div>

              {/* 3. Withdraw Summary (Rendered on mobile directly inside form flow) */}
              <div className="block lg:hidden">{renderSummaryCard()}</div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleContinueToConfirm}
                disabled={!canProceedToConfirm}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
                  canProceedToConfirm
                    ? "bg-gradient-to-r from-[#d9176c] via-[#b81da8] to-[#6d25d9] hover:from-[#c41360] hover:to-[#5e1ec2] text-white shadow-pink-500/25 active:scale-[0.99]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Continue</span>
                <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            )
          )}

          {/* STEP 2: CONFIRM VIEW */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Stepper Progress Bar */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between max-w-sm mx-auto relative">
                  {/* Connector line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 border-t-2 border-dashed border-purple-200 -z-0" />

                  {/* Step 1: Request (Completed) */}
                  <div className="flex flex-col items-center space-y-1.5 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#e81c78] text-white text-xs font-black flex items-center justify-center shadow-sm">
                      1
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">Request</span>
                  </div>

                  {/* Step 2: Confirm (Active) */}
                  <div className="flex flex-col items-center space-y-1.5 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-600 text-purple-700 text-xs font-black flex items-center justify-center shadow-md">
                      2
                    </div>
                    <span className="text-[11px] font-bold text-purple-700">Confirm</span>
                  </div>

                  {/* Step 3: Complete (Pending) */}
                  <div className="flex flex-col items-center space-y-1.5 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 text-gray-400 text-xs font-bold flex items-center justify-center">
                      3
                    </div>
                    <span className="text-[11px] font-medium text-gray-400">Complete</span>
                  </div>
                </div>
              </div>

              {/* Selected Method Pill Card with Change button */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img
                      src={currentMethod.logo}
                      alt={currentMethod.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/logo/bank.png";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{currentMethod.name}</h3>
                    <p className="text-xs font-mono font-bold text-gray-500">{account}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-1.5 rounded-xl border border-purple-200 text-purple-600 text-xs font-bold hover:bg-purple-50 active:scale-95 transition-all"
                >
                  Change
                </button>
              </div>

              {/* Amount & Charge Summary Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Withdraw Amount</span>
                  <span className="font-bold text-gray-900">৳{formatCurrency(numAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Withdraw Charge</span>
                  <span className="font-bold text-emerald-600">৳{formatCurrency(withdrawCharge)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-sm">You Will Receive</span>
                  <span className="font-black text-[#e81c78] text-base sm:text-lg">
                    ৳{formatCurrency(netReceive)}
                  </span>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">Important Notes</h4>

                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-pink-100 text-[#e81c78] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Please check your number carefully before confirming.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-pink-100 text-[#e81c78] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>You will receive the money within 1-2 working days.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-pink-100 text-[#e81c78] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Contact support if you face any issues.</span>
                  </div>
                </div>
              </div>

              {/* Confirm Withdraw Button */}
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d9176c] via-[#b81da8] to-[#6d25d9] hover:from-[#c41360] hover:to-[#5e1ec2] text-white font-black text-sm tracking-wide shadow-lg shadow-pink-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>প্রসেসিং হচ্ছে...</span>
                  </div>
                ) : (
                  <span>Confirm Withdraw</span>
                )}
              </button>

              {/* Trust & Security Badge */}
              <div className="pt-2 flex flex-col items-center text-center space-y-2 block lg:hidden">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/20 border border-purple-200 flex items-center justify-center text-purple-600 shadow-inner">
                  <ShieldCheckIcon className="w-7 h-7" />
                </div>
                <h5 className="text-xs font-bold text-gray-800">Your security is our priority</h5>
                <p className="text-[11px] text-gray-400 max-w-xs leading-tight">
                  All transactions are encrypted and 100% secure.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETE / SUCCESS VIEW */}
          {step === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center space-y-5 animate-fadeIn">
              {/* Animated Success Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 shadow-md">
                <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  উইথড্র রিকোয়েস্ট সফল হয়েছে!
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  আপনার উইথড্র রিকোয়েস্টটি গ্রহণ করা হয়েছে। পরবর্তী ২৪-৪৮ ঘণ্টার মধ্যে আপনার {selectedMethod} অ্যাকাউন্টে টাকা পৌঁছে যাবে।
                </p>
              </div>

              {/* Receipt Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Payment Method:</span>
                  <span className="font-bold text-gray-900">{selectedMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Account Number:</span>
                  <span className="font-mono font-bold text-gray-900">{account}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Requested Amount:</span>
                  <span className="font-bold text-emerald-600">৳{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[10px] uppercase">
                    Pending Approval
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full py-3.5 rounded-2xl bg-[#e81c78] hover:bg-[#d01568] text-white font-bold text-xs shadow-md transition-all"
                >
                  আরেকটি উইথড্র রিকোয়েস্ট করুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: Sticky Balance Card + Live Summary + Security Badge (Desktop) */}
        {/* ======================================================================= */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-5 space-y-5 sticky top-6">
          {/* Desktop Top Balance Hero Card */}
          {renderBalanceCard()}

          {/* Desktop Live Summary Card */}
          {renderSummaryCard()}

          {/* Desktop Trust & Security Priority Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/20 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-gray-900">Your security is our priority</h5>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                All transactions are 256-bit encrypted and 100% secure.
              </p>
            </div>
          </div>

          {/* Quick FAQ / Guidelines Card on Desktop */}
          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-3xl p-5 border border-purple-100/60 space-y-3">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <SparklesIcon className="w-4 h-4 text-purple-600" />
              <span>জরুরি তথ্য</span>
            </div>
            <ul className="text-[11px] text-gray-600 space-y-2 list-disc pl-4">
              <li>সর্বনিম্ন উত্তোলনের সীমা ৳১০০ (রিচার্জ) / ৳৩০০ (বিকাশ/নগদ/রকেট)।</li>
              <li>পেমেন্ট পৌঁছাতে সর্বোচ্চ ২৪ থেকে ৪৮ ঘণ্টা সময় লাগতে পারে।</li>
              <li>ভুল অ্যাকাউন্ট নম্বরের ক্ষেত্রে দ্রুত সাপোর্টে জানান।</li>
            </ul>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📜 WITHDRAWAL HISTORY TABLE (Full Width) */}
      {/* ========================================================================= */}
      <div className="pt-6">
        <Card className="p-5 sm:p-7 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-purple-600" />
              <span>আপনার পূর্ববর্তী উইথড্রয়াল হিস্ট্রি</span>
            </h3>
            <span className="text-[11px] text-gray-400">সর্বশেষ লেনদেন সমূহ</span>
          </div>

          <HistoryTable historyType="withdraw" />
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* ❓ HELP & FAQ MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={isHelpOpen}
        handler={() => setIsHelpOpen(false)}
        size="sm"
        className="rounded-3xl p-6 bg-white space-y-4 max-w-md"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-black text-base">
            <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600" />
            <span>উইথড্র সংক্রান্ত নিয়ম ও সহায়তা</span>
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-gray-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
            <p className="font-bold text-purple-900 mb-1">১. টাকা পেতে কত সময় লাগে?</p>
            <p>উইথড্র রিকোয়েস্ট সাবমিট করার পর সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে পেমেন্ট প্রসেস করা হয়।</p>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
            <p className="font-bold text-purple-900 mb-1">২. সর্বনিম্ন উইথড্রয়াল সীমা কত?</p>
            <p>বিকাশ/নগদ/রকেটে সর্বনিম্ন ৳৩০০.০০ এবং মোবাইল রিচার্জে সর্বনিম্ন ৳১০০.০০ উত্তোলন করা যায়।</p>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
            <p className="font-bold text-purple-900 mb-1">৩. ভুল একাউন্ট নম্বর দিলে কী করব?</p>
            <p>উইথড্র সাবমিট করার আগেই সঠিক পার্সোনাল নম্বর নিশ্চিত করুন। ভুল নম্বরে টাকা পাঠালে কর্তৃপক্ষ দায়ী থাকবে না।</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsHelpOpen(false)}
          className="w-full py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all"
        >
          বুঝেছি
        </button>
      </Dialog>
    </div>
  );
};

export default Withdraw;
