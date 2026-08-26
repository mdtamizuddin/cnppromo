import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Button, Input } from "@material-tailwind/react";
import {
  BanknotesIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  SparklesIcon,
  LightBulbIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import { refreshUser } from "../../redux/features/user/userSlice";
import HistoryTable from "./HistoryTable";
import Loader from "../../Components/Loader";

const paymentMethods = [
  {
    id: "Bkash",
    name: "বিকাশ (bKash)",
    subtitle: "পার্সোনাল অ্যাকাউন্ট",
    icon: "🌸",
    minAmount: 200,
    maxAmount: 6000,
    color: "from-pink-500 to-rose-600",
    badge: "bg-pink-50 text-pink-600 border-pink-100",
    activeRing: "ring-2 ring-pink-500 border-pink-500 bg-pink-50/40",
  },
  {
    id: "Nagad",
    name: "নগদ (Nagad)",
    subtitle: "পার্সোনাল অ্যাকাউন্ট",
    icon: "🔥",
    minAmount: 200,
    maxAmount: 6000,
    color: "from-orange-500 to-amber-600",
    badge: "bg-orange-50 text-orange-600 border-orange-100",
    activeRing: "ring-2 ring-orange-500 border-orange-500 bg-orange-50/40",
  },
  {
    id: "Rocket",
    name: "রকেট (Rocket)",
    subtitle: "DBBL অ্যাকাউন্ট",
    icon: "🚀",
    minAmount: 200,
    maxAmount: 6000,
    color: "from-purple-500 to-indigo-600",
    badge: "bg-purple-50 text-purple-600 border-purple-100",
    activeRing: "ring-2 ring-purple-500 border-purple-500 bg-purple-50/40",
  },
  {
    id: "Mobile Recharge",
    name: "মোবাইল রিচার্জ",
    subtitle: "সকল অপারেটর (Grameenphone, Banglalink, Robi, Airtel, Teletalk)",
    icon: "📱",
    minAmount: 60,
    maxAmount: 6000,
    color: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
    activeRing: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40",
  },
];

const quickAmounts = [60, 100, 200, 500, 1000, 2000, 5000];

const Withdraw = () => {
  const [selectedMethod, setSelectedMethod] = useState("Bkash");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const currentMethod =
    paymentMethods.find((m) => m.id === selectedMethod) || paymentMethods[0];

  const userBalance = Number(user?.balance || 0);
  const numAmount = Number(amount || 0);

  const isBelowMin = numAmount > 0 && numAmount < currentMethod.minAmount;
  const isAboveMax = numAmount > currentMethod.maxAmount;
  const isInsufficient = numAmount > userBalance;
  const canSubmit =
    numAmount >= currentMethod.minAmount &&
    numAmount <= currentMethod.maxAmount &&
    numAmount <= userBalance &&
    account.trim().length >= 11;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      if (isInsufficient) {
        toast.error("আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই");
      } else if (isBelowMin) {
        toast.error(`সর্বনিম্ন উইথড্রয়াল সীমা ৳${currentMethod.minAmount}`);
      } else {
        toast.error("অনুগ্রহ করে সঠিক তথ্য প্রদান করুন");
      }
      return;
    }

    setLoading(true);
    const newData = {
      amount: numAmount,
      account,
      user: user?._id,
      method: selectedMethod,
    };

    try {
      const res = await api.post("/withdraw", newData);
      toast.success(
        "আপনার উইথড্র রিকোয়েস্ট সফল হয়েছে! পরবর্তী ২৪-৪৮ ঘণ্টার মধ্যে পেমেন্ট পেয়ে যাবেন।"
      );
      dispatch(refreshUser(res.data._id));
      setAmount("");
      setAccount("");
      setLoading(false);
    } catch (error) {
      if (
        error?.response?.data?.message ===
        "Error: You can't withdraw again today. Your Dayly withdraw limit is exceeded"
      ) {
        toast.error(
          "আপনি আজ ইতিমধ্যে উইথড্র করেছেন। দৈনিক উইথড্রয়াল সীমা অতিক্রম করেছে।"
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "উইথড্র করতে সমস্যা হয়েছে, পরে চেষ্টা করুন"
        );
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      
      {/* 💸 Main Withdraw Form Card */}
      <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-[#0b0c2a] flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-[#5a32fa]" />
              <span>টাকা উত্তোলনের ফরম</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              পেমেন্ট মেথড নির্বাচন করে আপনার বিকাশ/নগদ/রিচার্জ একাউন্ট নম্বর দিন
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">উত্তোলনযোগ্য ব্যালেন্স:</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-black rounded-xl border border-emerald-100">
              ৳{userBalance}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Select Payment Method Cards */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-700">
              ১. পেমেন্ট মেথড নির্বাচন করুন:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {paymentMethods.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? m.activeRing
                        : "border-gray-200 bg-gray-50/40 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{m.icon}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${m.badge}`}>
                        Min: ৳{m.minAmount}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#0b0c2a]">{m.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{m.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Enter Amount with Quick Shortcut Pills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">
                ২. উত্তোলনের পরিমাণ (৳):
              </label>
              <span className="text-[11px] text-gray-400">
                সীমা: ৳{currentMethod.minAmount} — ৳{currentMethod.maxAmount}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                ৳
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={currentMethod.minAmount}
                max={currentMethod.maxAmount}
                placeholder={`উইথড্র করার পরিমাণ লিখুন (যেমন: ${currentMethod.minAmount})`}
                required
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-gray-400 font-semibold shrink-0">দ্রুত নির্বাচন:</span>
              {quickAmounts
                .filter((qa) => qa >= currentMethod.minAmount)
                .map((qa) => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAmount(qa.toString())}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      Number(amount) === qa
                        ? "bg-[#5a32fa] text-white shadow-sm"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    ৳{qa}
                  </button>
                ))}
            </div>

            {/* Warning alerts */}
            {isBelowMin && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                <span>{currentMethod.name} এর জন্য সর্বনিম্ন উইথড্রয়াল সীমা ৳{currentMethod.minAmount}</span>
              </p>
            )}
            {isInsufficient && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                <span>আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই (বর্তমান: ৳{userBalance})</span>
              </p>
            )}
          </div>

          {/* Step 3: Account Number Input */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-700">
              ৩. আপনার {currentMethod.name} নম্বর:
            </label>

            <div className="relative">
              <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-2xl normal-case font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                canSubmit
                  ? "bg-[#5a32fa] hover:bg-[#4b26e0] text-white shadow-indigo-500/25 hover:scale-[1.01]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              <span>উইথড্র রিকোয়েস্ট পাঠান</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>

        </form>

      </Card>

      {/* 💡 Guidelines & Security Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50/40 border border-amber-200/60 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <LightBulbIcon className="w-5 h-5 text-amber-600 shrink-0" />
          <span>উইথড্রয়াল সংক্রান্ত জরুরি নিয়মাবলি:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
          <div className="p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 flex items-start gap-2">
            <span className="text-amber-500 font-black">১.</span>
            <span>সঠিক পার্সোনাল একাউন্ট নম্বর দিন। ভুল নম্বরে টাকা পাঠালে কর্তৃপক্ষ দায়ী নয়।</span>
          </div>
          <div className="p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 flex items-start gap-2">
            <span className="text-amber-500 font-black">২.</span>
            <span>উইথড্র রিকোয়েস্ট দেওয়ার পর সর্বোচ্চ ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ব্যালেন্স ক্লিয়ার হবে।</span>
          </div>
          <div className="p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 flex items-start gap-2">
            <span className="text-amber-500 font-black">৩.</span>
            <span>প্রতিদিন একবার উইথড্রয়াল সীমা প্রযোজ্য। কোনো সমস্যা হলে সাপোর্টে যোগাযোগ করুন।</span>
          </div>
        </div>
      </div>

      {/* 📜 Withdrawal History Table */}
      <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-[#0b0c2a]">
            আপনার পূর্ববর্তী উইথড্রয়াল হিস্ট্রি
          </h3>
        </div>

        <HistoryTable historyType="withdraw" />
      </Card>

    </div>
  );
};

export default Withdraw;
