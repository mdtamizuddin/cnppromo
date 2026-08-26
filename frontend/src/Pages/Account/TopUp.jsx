import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Card, Button, Input } from "@material-tailwind/react";
import {
  BanknotesIcon,
  PhoneIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  LightBulbIcon,
  CreditCardIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import HistoryTable from "./HistoryTable";
import Loader from "../../Components/Loader";

const paymentMethods = [
  {
    id: "Bkash",
    name: "বিকাশ (bKash)",
    subtitle: "Send Money (Personal)",
    icon: "🌸",
    accountKey: "bkash",
    color: "from-pink-500 to-rose-600",
    badge: "bg-pink-50 text-pink-600 border-pink-100",
    activeRing: "ring-2 ring-pink-500 border-pink-500 bg-pink-50/40",
  },
  {
    id: "Nagad",
    name: "নগদ (Nagad)",
    subtitle: "Send Money (Personal)",
    icon: "🔥",
    accountKey: "nagad",
    color: "from-orange-500 to-amber-600",
    badge: "bg-orange-50 text-orange-600 border-orange-100",
    activeRing: "ring-2 ring-orange-500 border-orange-500 bg-orange-50/40",
  },
  {
    id: "Rocket",
    name: "রকেট (Rocket)",
    subtitle: "Send Money (DBBL)",
    icon: "🚀",
    accountKey: "rocket",
    color: "from-purple-500 to-indigo-600",
    badge: "bg-purple-50 text-purple-600 border-purple-100",
    activeRing: "ring-2 ring-purple-500 border-purple-500 bg-purple-50/40",
  },
  {
    id: "Payeer",
    name: "পেইয়ার (Payeer)",
    subtitle: "USD / RUB Wallet",
    icon: "🌐",
    accountKey: "payeer",
    color: "from-blue-500 to-cyan-600",
    badge: "bg-blue-50 text-blue-600 border-blue-100",
    activeRing: "ring-2 ring-blue-500 border-blue-500 bg-blue-50/40",
  },
];

const TopUp = () => {
  const [selected, setSelected] = useState("Bkash");
  const [currency, setCurrency] = useState("bdt");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, settings } = useSelector((state) => state.user);

  const activeMethod =
    paymentMethods.find((m) => m.id === selected) || paymentMethods[0];

  const adminNumber = settings?.accounts?.[activeMethod.accountKey] || "N/A";

  const handleCopy = () => {
    if (!adminNumber || adminNumber === "N/A") return;
    navigator.clipboard.writeText(adminNumber);
    setCopied(true);
    toast.success("অফিশিয়াল অ্যাকাউন্ট নম্বর কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = e.target.amount.value;
      const trx = e.target.trx.value;
      const account = e.target.account.value;

      const newData = {
        amount,
        trx: trx.trim().toUpperCase(),
        account: account.trim(),
        method: selected,
        currency,
        user: user?._id,
      };

      await api.post("/topup", newData);
      toast.success("টপ-আপ রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে! খুব শীঘ্রই ব্যালেন্সে যোগ হবে।");
      e.target.reset();
      setLoading(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "টপ-আপ সাবমিট করতে সমস্যা হয়েছে"
      );
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      
      {/* 📥 Main Top-Up Form Card */}
      <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-[#0b0c2a] flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-[#5a32fa]" />
              <span>ব্যালেন্স টপ-আপ ফরম</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              অফিশিয়াল নম্বরে টাকা পাঠিয়ে Transaction ID এবং আপনার নম্বর দিয়ে সাবমিট করুন
            </p>
          </div>
        </div>

        {/* Step 1: Select Payment Method Cards */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-gray-700">
            ১. পেমেন্ট মেথড নির্বাচন করুন:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {paymentMethods.map((m) => {
              const isSelected = selected === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? m.activeRing
                      : "border-gray-200 bg-gray-50/40 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${m.badge}`}>
                      {m.name}
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

        {/* Step 2: Display Official Number to Send Money */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-blue-50/40 border border-purple-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a32fa] flex items-center gap-1.5">
              <span>{activeMethod.icon}</span>
              <span>অফিশিয়াল {activeMethod.name} অ্যাকাউন্ট নম্বর (Send Money):</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1 p-3 bg-white rounded-xl border border-purple-200/80 font-mono font-black text-sm text-[#0b0c2a] tracking-wider select-all shadow-sm">
              {adminNumber}
            </div>

            <Button
              onClick={handleCopy}
              disabled={adminNumber === "N/A"}
              className="w-full sm:w-auto bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-3 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-emerald-300" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>নম্বর কপি করুন</span>
                </>
              )}
            </Button>
          </div>

          {selected === "Payeer" && (
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-gray-700">কারেন্সি নির্বাচন:</span>
              <div className="flex gap-2">
                {["usd", "rub"].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                      currency === curr
                        ? "bg-[#5a32fa] text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Top Up Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              টপ-আপের পরিমাণ (BDT):
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                ৳
              </span>
              <input
                type="number"
                name="amount"
                placeholder="কত টাকা পাঠিয়েছেন তা লিখুন"
                required
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Transaction ID (TrxID):
            </label>
            <div className="relative">
              <KeyIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="trx"
                placeholder="যেমন: BKA1234567"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono uppercase font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Phone Number):
            </label>
            <div className="relative">
              <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="account"
                placeholder="01XXXXXXXXX"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-3.5 bg-[#5a32fa] hover:bg-[#4b26e0] text-white rounded-2xl normal-case font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              <span>টপ-আপ রিকোয়েস্ট সাবমিট করুন</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </form>

      </Card>

      {/* 💡 Guidelines Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50/60 border border-purple-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[#5a32fa] font-bold text-sm">
          <LightBulbIcon className="w-5 h-5" />
          <span>টপ-আপ করার সহজ ৩ ধাপ:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
          <div className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-sm flex items-start gap-2">
            <span className="text-[#5a32fa] font-black">১.</span>
            <span>প্রদত্ত অফিশিয়াল নম্বরে আপনার বিকাশ/নগদ/রকেট অ্যাপ থেকে "Send Money" করুন।</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-sm flex items-start gap-2">
            <span className="text-[#5a32fa] font-black">২.</span>
            <span>টাকা সফলভাবে পাঠানোর পর মেসেজে আসা Transaction ID কপি করুন।</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-sm flex items-start gap-2">
            <span className="text-[#5a32fa] font-black">৩.</span>
            <span>ফরমটিতে সঠিক তথ্য দিয়ে সাবমিট করলেই এডমিন ভেরিফাই করে ব্যালেন্স যুক্ত করে দেবেন।</span>
          </div>
        </div>
      </div>

      {/* 📜 Top-Up History Table */}
      <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-[#0b0c2a]">
            আপনার পূর্ববর্তী টপ-আপ হিস্ট্রি
          </h3>
        </div>

        <HistoryTable historyType="topup" />
      </Card>

    </div>
  );
};

export default TopUp;