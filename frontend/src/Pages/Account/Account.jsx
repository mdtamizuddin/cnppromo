import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Card, Button } from "@material-tailwind/react";
import {
  BanknotesIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

const Account = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const isWithdraw = location.pathname.includes("/withdraw");

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        
        {/* 🌟 Top Hero Banner & Live Wallet Status */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold tracking-wide">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>অফিশিয়াল পেমেন্ট ও ওয়ালেট সেন্টার</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                আপনার ওয়ালেট ও <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  ব্যালেন্স উইথড্রয়াল ⚡
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-md leading-relaxed">
                আপনার অর্জিত ব্যালেন্স সরাসরি বিকাশ, নগদ, রকেট অথবা মোবাইল রিচার্জের মাধ্যমে নিরাপদে উইথড্র করুন।
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                  ১০০% নিরাপদ ট্রানজেকশন
                </div>
                <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-sky-400" />
                  ২৪-৪৮ ঘণ্টার মধ্যে পেমেন্ট
                </div>
              </div>
            </div>

            {/* Right 3D Illustration & Big Balance Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
              <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-center space-y-2 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <WalletIcon className="w-4 h-4" />
                  <span>বর্তমান ওয়ালেট ব্যালেন্স</span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1">
                  <span>৳</span>
                  <span>{user?.balance || 0}</span>
                </div>

                <p className="text-[11px] text-indigo-200/80">
                  সর্বনিম্ন উইথড্রয়াল: ৳৬০ (রিচার্জ) / ৳২০০ (বিকাশ/নগদ)
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 🏷️ Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm gap-1.5">
            <Link
              to="/account/withdraw"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isWithdraw
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/25"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ArrowUpRightIcon className="w-4 h-4" />
              <span>টাকা উত্তোলন (Withdraw)</span>
            </Link>

            <Link
              to="/account"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isWithdraw
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/25"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ArrowDownLeftIcon className="w-4 h-4" />
              <span>টপ-আপ ব্যালেন্স (Top Up)</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Outlet Content */}
        <Outlet />

      </div>
    </div>
  );
};

export default Account;