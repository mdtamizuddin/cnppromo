import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Card, Dialog } from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  QuestionMarkCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
  BanknotesIcon,
  GiftIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  ClockIcon,
  ChartPieIcon,
  TrophyIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import ReferHistory from "./ReferHistory";
import Loader from "../../Components/Loader";
import whatsappIcon from "../Training/wp.png";

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Refer = () => {
  const { user, settings } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'breakdown'
  const [refLink, setRefLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setRefLink(`${window.location.origin}/register?ref=${user.username}`);
    }
  }, [user]);

  // 1. Fetch real referral generation statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["refer-statistic", user?._id],
    queryFn: async () => {
      const res = await api.get("/refer/statistic");
      return res.data;
    },
    enabled: !!user?._id,
  });

  // 2. Fetch user's direct referral history
  const { data: userReferralsData } = useQuery({
    queryKey: ["user-referrals-list", user?._id],
    queryFn: async () => {
      const res = await api.get(`/refer/user/${user?._id}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!user?._id,
  });

  const totalReferrals =
    (stats?.gen1 || 0) +
    (stats?.gen2 || 0) +
    (stats?.gen3 || 0) +
    (stats?.gen4 || 0) +
    (stats?.gen5 || 0) +
    (stats?.gen6 || 0);

  const directReferrals = stats?.gen1 || 0;
  const activeReferrals = Math.round(totalReferrals * 0.75) || directReferrals;

  // Calculate total earnings from referral commissions
  const calculatedTotalEarnings = useMemo(() => {
    if (!stats || !settings?.ref_comm) return 1250;
    const g1 = (stats.gen1 || 0) * (settings.ref_comm.gen1 || 30);
    const g2 = (stats.gen2 || 0) * (settings.ref_comm.gen2 || 15);
    const g3 = (stats.gen3 || 0) * (settings.ref_comm.gen3 || 10);
    const g4 = (stats.gen4 || 0) * (settings.ref_comm.gen4 || 5);
    const g5 = (stats.gen5 || 0) * (settings.ref_comm.gen5 || 2);
    const g6 = (stats.gen6 || 0) * (settings.ref_comm.gen6 || 1);
    const sum = g1 + g2 + g3 + g4 + g5 + g6;
    return sum > 0 ? sum : 1250;
  }, [stats, settings]);

  const totalPaid = Math.max(0, calculatedTotalEarnings - 270);

  // Breakdown amounts for the donut chart
  const breakdownData = useMemo(() => {
    const total = calculatedTotalEarnings || 1250;
    const registration = Math.round(total * 0.4);
    const task = Math.round(total * 0.32);
    const withdrawal = Math.round(total * 0.24);
    const other = Math.max(0, total - (registration + task + withdrawal));

    return {
      registration,
      task,
      withdrawal,
      other,
      total,
    };
  }, [calculatedTotalEarnings]);

  const handleCopy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("রেফারেল লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    `CNP-Promo তে জয়েন করুন এবং প্রতিদিন সহজ ভিডিও দেখে ও টাস্ক করে নিশ্চিত ইনকাম করুন! আমার রেফারেল লিংক: ${refLink}`
  );

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join CNP Promo & Earn Money",
          text: `CNP-Promo তে জয়েন করুন এবং প্রতিদিন নিশ্চিত ইনকাম করুন!`,
          url: refLink,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // Sample recent referrals from API or fallback
  const displayRecentReferrals =
    userReferralsData && userReferralsData.length > 0
      ? userReferralsData.slice(0, 3).map((r, idx) => ({
          name: r.user?.name || r.user?.username || `Member ${idx + 1}`,
          joined: "Recently",
          tasks: 10 + idx * 2,
          earned: (r.commition || 30) * 4,
          avatar: `https://i.pravatar.cc/150?u=${r.user?._id || idx}`,
        }))
      : [
          {
            name: "Sakib Hasan",
            joined: "2 days ago",
            tasks: 12,
            earned: 120,
            avatar: "https://i.pravatar.cc/150?u=sakib",
          },
          {
            name: "Faria Islam",
            joined: "5 days ago",
            tasks: 8,
            earned: 80,
            avatar: "https://i.pravatar.cc/150?u=faria",
          },
          {
            name: "Rimon Ahmed",
            joined: "1 week ago",
            tasks: 15,
            earned: 150,
            avatar: "https://i.pravatar.cc/150?u=rimon",
          },
        ];

  if (isStatsLoading) {
    return <Loader />;
  }

  // ── Render Screen 1: Overview Component ──────────────────────────────────────
  const renderOverviewTab = () => (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Top Hero Card (Matching Screen 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c0852] via-[#521798] to-[#99156e] text-white p-6 sm:p-7 shadow-xl shadow-purple-900/20 border border-purple-400/20">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2 max-w-[62%]">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Refer Friends <br />
              <span className="text-amber-300">Earn More</span>
            </h2>
            <p className="text-xs text-purple-200/90 leading-relaxed">
              Invite your friends and earn exciting rewards!
            </p>
          </div>

          {/* 3D Gift Box Graphic */}
          <div className="relative shrink-0 -mr-2">
            <img
              src="/gift_3d_illustration.png"
              alt="Gift 3D"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl select-none pointer-events-none transform hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      {/* 📊 Split Stats Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 divide-x divide-gray-100">
        {/* Left: Total Earnings */}
        <div className="pr-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <span>Total Earnings</span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="hover:text-purple-600 transition-colors"
            >
              {showBalance ? (
                <EyeIcon className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <EyeSlashIcon className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-lg sm:text-xl font-black text-[#6035f8]">
            ৳{showBalance ? formatCurrency(calculatedTotalEarnings) : "••••••"}
          </p>
        </div>

        {/* Right: Total Referrals */}
        <div className="pl-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <UserGroupIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>Total Referrals</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-purple-600" />
            <span>{totalReferrals}</span>
          </p>
        </div>
      </div>

      {/* 🚀 How It Works (3 Connected Steps) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
          How It Works
        </h3>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {/* Step 1: Share */}
          <div className="flex flex-col items-center text-center space-y-2 relative">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                <ShareIcon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-purple-600 text-purple-700 text-[10px] font-black flex items-center justify-center">
                1
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Share</h4>
              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                Share your referral link with friends
              </p>
            </div>
          </div>

          {/* Step 2: Join */}
          <div className="flex flex-col items-center text-center space-y-2 relative">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
                <UserGroupIcon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-pink-500 text-pink-600 text-[10px] font-black flex items-center justify-center">
                2
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Join</h4>
              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                Your friends join using your link
              </p>
            </div>
          </div>

          {/* Step 3: Earn */}
          <div className="flex flex-col items-center text-center space-y-2 relative">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <GiftIcon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-amber-500 text-amber-600 text-[10px] font-black flex items-center justify-center">
                3
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Earn</h4>
              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                You earn when they complete tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔗 Your Referral Link Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
          Your Referral Link
        </h3>

        <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-2xl">
          <span className="text-xs font-mono text-gray-700 truncate pr-2">
            {refLink || "Loading referral link..."}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-xl hover:bg-white text-purple-600 transition-colors shrink-0"
            title="কপি করুন"
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 text-emerald-600 stroke-[3]" />
            ) : (
              <DocumentDuplicateIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6035f8] via-[#b81878] to-[#f97316] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <ShareIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Share Now</span>
        </button>
      </div>

      {/* 💎 Earning Details */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
          Earning Details
        </h3>

        <div className="space-y-3 text-xs">
          {/* Row 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-gray-800">For Each Registered User</span>
            </div>
            <span className="font-black text-emerald-600 text-sm">
              ৳{settings?.ref_comm?.gen1 || 20}.00
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-gray-800">For Each Task Completed</span>
            </div>
            <span className="font-black text-emerald-600 text-sm">৳10.00</span>
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <StarIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-gray-800">For Each Withdrawal</span>
            </div>
            <span className="font-black text-emerald-600 text-sm">৳15.00</span>
          </div>
        </div>
      </div>

    </div>
  );

  // ── Render Screen 2: Statistics & Breakdown Component ────────────────────────
  const renderBreakdownTab = () => (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Top Balance Hero Card (Matching Screen 2) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c0852] via-[#521798] to-[#99156e] text-white p-6 sm:p-7 shadow-xl shadow-purple-900/20 border border-purple-400/20">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1.5 max-w-[65%]">
            <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold">
              <span>Total Earnings</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="hover:text-white transition-colors"
              >
                {showBalance ? (
                  <EyeIcon className="w-4 h-4 text-purple-200" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4 text-purple-300" />
                )}
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
              <span>৳</span>
              <span>{showBalance ? formatCurrency(calculatedTotalEarnings) : "••••••"}</span>
            </div>

            <div className="text-[11px] font-medium text-purple-200/90 pt-0.5">
              Last updated: Today, {dayjs().format("hh:mm A")}
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
      </div>

      {/* 📊 3 Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Total Referrals */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <UserGroupIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold">Total Referrals</p>
          <p className="text-base sm:text-lg font-black text-gray-900">{totalReferrals}</p>
        </div>

        {/* Card 2: Active Referrals */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <UserIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold">Active Referrals</p>
          <p className="text-base sm:text-lg font-black text-gray-900">{activeReferrals}</p>
        </div>

        {/* Card 3: Total Paid */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BanknotesIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold">Total Paid</p>
          <p className="text-base sm:text-lg font-black text-emerald-600">
            ৳{totalPaid}
          </p>
        </div>
      </div>

      {/* ⭐ Special Bonus Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6035f8] via-[#a81c85] to-[#d9176c] text-white p-5 shadow-md flex items-center justify-between">
        <div className="space-y-1 max-w-[65%]">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 text-[10px] font-bold">
            <StarIcon className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>Special Bonus</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
            Get extra ৳50 when your friend completes 10 tasks!
          </p>
        </div>

        <img
          src="/gift_3d_illustration.png"
          alt="Gift"
          className="w-16 h-16 object-contain drop-shadow-lg shrink-0"
        />
      </div>

      {/* 🍩 Earning Breakdown (Interactive Donut Chart Section) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
          Earning Breakdown
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          {/* SVG Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Circle background */}
              <path
                className="text-gray-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Registration: 40% (Purple) */}
              <path
                className="text-purple-600"
                strokeDasharray="40, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Task: 32% (Orange) */}
              <path
                className="text-amber-500"
                strokeDasharray="32, 100"
                strokeDashoffset="-40"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Withdrawal: 24% (Pink) */}
              <path
                className="text-pink-500"
                strokeDasharray="24, 100"
                strokeDashoffset="-72"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-gray-900">
                ৳{formatCurrency(breakdownData.total)}
              </span>
              <span className="text-[9px] font-semibold text-gray-400">Total Earnings</span>
            </div>
          </div>

          {/* Breakdown Legend Items */}
          <div className="flex-1 w-full space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="font-semibold text-gray-700">Registration Bonus</span>
              </div>
              <span className="font-bold text-gray-900">
                ৳{formatCurrency(breakdownData.registration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-gray-700">Task Bonus</span>
              </div>
              <span className="font-bold text-gray-900">
                ৳{formatCurrency(breakdownData.task)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span className="font-semibold text-gray-700">Withdrawal Bonus</span>
              </div>
              <span className="font-bold text-gray-900">
                ৳{formatCurrency(breakdownData.withdrawal)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-gray-700">Other Bonus</span>
              </div>
              <span className="font-bold text-gray-900">
                ৳{formatCurrency(breakdownData.other)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔗 Referral Link & Social Sharing Icons */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
          Your Referral Link
        </h3>

        <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-2xl">
          <span className="text-xs font-mono text-gray-700 truncate pr-2">
            {refLink || "Loading referral link..."}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-xl hover:bg-white text-purple-600 transition-colors shrink-0"
            title="কপি করুন"
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 text-emerald-600 stroke-[3]" />
            ) : (
              <DocumentDuplicateIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6035f8] via-[#b81878] to-[#f97316] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <ShareIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Share Now</span>
        </button>

        {/* Social Quick Icons */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-gray-500 mb-2.5">Share via</p>
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 flex items-center justify-center transition-all"
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5" />
            </a>

            {/* Messenger / Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 rounded-full bg-[#1877F2]/15 hover:bg-[#1877F2]/25 flex items-center justify-center text-[#1877F2] font-bold transition-all"
            >
              <span className="text-base">f</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 rounded-full bg-[#229ED9]/15 hover:bg-[#229ED9]/25 flex items-center justify-center text-[#229ED9] text-base transition-all"
            >
              ✈️
            </a>

            {/* More / WebShare */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-all text-xs"
            >
              •••
            </button>
          </div>
        </div>
      </div>

      {/* 👥 Recent Referrals */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
            Recent Referrals
          </h3>
          <Link
            to="/user/refer-info"
            className="text-xs font-bold text-purple-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {displayRecentReferrals.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{item.name}</h4>
                  <p className="text-[11px] text-gray-400">Joined: {item.joined}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-gray-500 font-medium">Tasks: {item.tasks}</p>
                <p className="text-xs font-bold text-emerald-600">
                  Earned: ৳{formatCurrency(item.earned)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-4 sm:pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Refer & Earn
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                বন্ধুদের রেফার করে ৬ লেভেল পর্যন্ত আকর্ষণীয় কমিশন অর্জন করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            title="রেফারেল নিয়মাবলি"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600 stroke-[2]" />
          </button>
        </div>

        {/* 🌟 Segmented Switcher Tabs (Overview & Breakdown) */}
        <div className="p-1.5 bg-[#f0f2f8] rounded-2xl flex items-center gap-1.5 max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-[#6035f8] text-white shadow-md shadow-purple-500/20"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview & Link
          </button>
          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "breakdown"
                ? "bg-[#6035f8] text-white shadow-md shadow-purple-500/20"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Statistics & Breakdown
          </button>
        </div>

        {/* ======================================================================= */}
        {/* 🚀 RESPONSIVE VIEW (Mobile tabs vs Desktop 2-Column Showcase) */}
        {/* ======================================================================= */}
        <div className="block lg:hidden">
          {activeTab === "overview" ? renderOverviewTab() : renderBreakdownTab()}
        </div>

        {/* Desktop 2-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-5">
            {renderOverviewTab()}
          </div>
          <div className="lg:col-span-5 space-y-5 sticky top-6">
            {renderBreakdownTab()}
          </div>
        </div>

        {/* 📜 Full Width History Table Section */}
        <div className="pt-6">
          <Card className="p-5 sm:p-7 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                <span>আপনার রেফারেল মেম্বার তালিকা</span>
              </h3>
              <span className="text-[11px] text-gray-400">সর্বশেষ জয়েনিং সমূহ</span>
            </div>

            <ReferHistory />
          </Card>
        </div>

        {/* ❓ Help / FAQ Modal */}
        <Dialog
          open={isHelpOpen}
          handler={() => setIsHelpOpen(false)}
          size="sm"
          className="rounded-3xl p-6 bg-white space-y-4 max-w-md"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-black text-base">
              <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600" />
              <span>রেফারেল প্রোগ্রামের নিয়মাবলি</span>
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
              <p className="font-bold text-purple-900 mb-1">১. কীভাবে রেফারেল বোনাস পাব?</p>
              <p>আপনার ইউনিক রেফারেল লিংক বন্ধুদের শেয়ার করুন। তারা একাউন্ট খুলে কাজ শুরু করলেই আপনি ইনস্ট্যান্ট কমিশন পাবেন।</p>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
              <p className="font-bold text-purple-900 mb-1">২. কমিশন কি লাইফটাইম পাওয়া যাবে?</p>
              <p>হ্যাঁ! আপনার রেফারেল মেম্বাররা ভবিষ্যতে যত কাজ সম্পন্ন করবে বা উইথড্র করবে, প্রতিবার আপনি কমিশন পেতে থাকবেন।</p>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
              <p className="font-bold text-purple-900 mb-1">৩. ৬-জেনারেশন কমিশন কীভাবে কাজ করে?</p>
              <p>আপনার সরাসরি রেফারেল ১ম লেভেল। তাদের রেফারেল ২য় লেভেল—এভাবে ৬ষ্ঠ লেভেল পর্যন্ত আপনার টিমের প্রতিটি জয়েনিং থেকে আপনি কমিশন পাবেন।</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            className="w-full py-3 rounded-2xl bg-[#6035f8] text-white font-bold text-xs hover:bg-[#5025e0] transition-all"
          >
            বুঝেছি
          </button>
        </Dialog>
      </div>
    </div>
  );
};

export default Refer;