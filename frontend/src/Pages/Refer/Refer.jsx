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
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
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
    } else if (user?._id) {
      setRefLink(`${window.location.origin}/register?ref=${user._id}`);
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

  // Real data calculations
  const totalReferrals = stats?.totalReferrals ?? (
    (stats?.gen1 || 0) +
    (stats?.gen2 || 0) +
    (stats?.gen3 || 0) +
    (stats?.gen4 || 0) +
    (stats?.gen5 || 0) +
    (stats?.gen6 || 0)
  );

  const activeReferrals = stats?.activeReferrals ?? 0;
  const directReferrals = stats?.gen1 || 0;
  const totalEarnings = stats?.totalEarnings ?? (
    (stats?.commGen1 || 0) +
    (stats?.commGen2 || 0) +
    (stats?.commGen3 || 0) +
    (stats?.commGen4 || 0) +
    (stats?.commGen5 || 0) +
    (stats?.commGen6 || 0)
  );

  // Real 6-Generation breakdown
  const genStats = useMemo(() => {
    const rates = settings?.ref_comm || {
      gen1: 30,
      gen2: 15,
      gen3: 10,
      gen4: 5,
      gen5: 2,
      gen6: 1,
    };

    return [
      {
        gen: 1,
        title: "১ম জেনারেশন (সরাসরি)",
        count: stats?.gen1 || 0,
        activeCount: stats?.activeGen1 || 0,
        rate: rates.gen1 || 30,
        earned: stats?.commGen1 || (stats?.gen1 || 0) * (rates.gen1 || 30),
        color: "bg-teal-500 text-white",
        badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      },
      {
        gen: 2,
        title: "২য় জেনারেশন",
        count: stats?.gen2 || 0,
        activeCount: stats?.activeGen2 || 0,
        rate: rates.gen2 || 15,
        earned: stats?.commGen2 || (stats?.gen2 || 0) * (rates.gen2 || 15),
        color: "bg-emerald-500 text-white",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      {
        gen: 3,
        title: "৩য় জেনারেশন",
        count: stats?.gen3 || 0,
        activeCount: stats?.activeGen3 || 0,
        rate: rates.gen3 || 10,
        earned: stats?.commGen3 || (stats?.gen3 || 0) * (rates.gen3 || 10),
        color: "bg-cyan-500 text-white",
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
      },
      {
        gen: 4,
        title: "৪র্থ জেনারেশন",
        count: stats?.gen4 || 0,
        activeCount: stats?.activeGen4 || 0,
        rate: rates.gen4 || 5,
        earned: stats?.commGen4 || (stats?.gen4 || 0) * (rates.gen4 || 5),
        color: "bg-sky-500 text-white",
        badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      },
      {
        gen: 5,
        title: "৫ম জেনারেশন",
        count: stats?.gen5 || 0,
        activeCount: stats?.activeGen5 || 0,
        rate: rates.gen5 || 2,
        earned: stats?.commGen5 || (stats?.gen5 || 0) * (rates.gen5 || 2),
        color: "bg-indigo-500 text-white",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
      {
        gen: 6,
        title: "৬ষ্ঠ জেনারেশন",
        count: stats?.gen6 || 0,
        activeCount: stats?.activeGen6 || 0,
        rate: rates.gen6 || 1,
        earned: stats?.commGen6 || (stats?.gen6 || 0) * (rates.gen6 || 1),
        color: "bg-violet-500 text-white",
        badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
      },
    ];
  }, [stats, settings]);

  const handleCopy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("রেফারেল লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    `CNP-Promo তে জয়েন করুন এবং প্রতিদিন কাজ করে নিশ্চিত ইনকাম করুন! আমার রেফারেল লিংক: ${refLink}`
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

  // Real recent referrals from API
  const recentReferrals = userReferralsData || [];

  if (isStatsLoading) {
    return <Loader />;
  }

  // ── Render Screen 1: Overview Component ──────────────────────────────────────
  const renderOverviewTab = () => (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Top Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#0284c7] text-white p-6 sm:p-7 shadow-xl shadow-teal-900/20 border border-teal-400/20">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2 max-w-[65%]">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Refer Friends <br />
              <span className="text-amber-300">Earn More</span>
            </h2>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              বন্ধুদের ইনভাইট করুন এবং ৬ জেনারেশন পর্যন্ত ইনস্ট্যান্ট রেফার কমিশন উপভোগ করুন!
            </p>
          </div>

          <div className="relative shrink-0 -mr-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <UserGroupIcon className="w-10 h-10 sm:w-12 sm:h-12 text-teal-200" />
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Split Real Stats Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 divide-x divide-gray-100">
        {/* Left: Total Earnings */}
        <div className="pr-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <span>Total Earnings</span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="hover:text-primary transition-colors"
            >
              {showBalance ? (
                <EyeIcon className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <EyeSlashIcon className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-lg sm:text-2xl font-black text-primary">
            ৳{showBalance ? formatCurrency(totalEarnings) : "••••••"}
          </p>
        </div>

        {/* Right: Total Referrals */}
        <div className="pl-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <UserGroupIcon className="w-3.5 h-3.5 text-primary" />
            <span>Total Referrals</span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-gray-900 flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-primary" />
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
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                <ShareIcon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-primary text-primary text-[10px] font-black flex items-center justify-center">
                1
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Share</h4>
              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                আপনার রেফারেল লিংক বন্ধুদের শেয়ার করুন
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
                বন্ধুরা আপনার লিংকে অ্যাকাউন্ট খুলবে
              </p>
            </div>
          </div>

          {/* Step 3: Earn */}
          <div className="flex flex-col items-center text-center space-y-2 relative">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <BanknotesIcon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-amber-500 text-amber-600 text-[10px] font-black flex items-center justify-center">
                3
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Earn</h4>
              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                অ্যাকাউন্ট সক্রিয় হলে কমিশন পাবেন
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

        <div className="flex items-center justify-between p-3 bg-primary-light/50 border border-teal-100 rounded-2xl">
          <span className="text-xs font-mono text-gray-700 truncate pr-2">
            {refLink || "Loading referral link..."}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-xl hover:bg-white text-primary transition-colors shrink-0"
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
          className="w-full py-3.5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <ShareIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Share Now</span>
        </button>
      </div>

      {/* 💎 Real 6-Generation Rates Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
            ৬-জেনারেশন রেফারেল কমিশন রেট
          </h3>
          <span className="text-[11px] font-semibold text-primary">অ্যাক্টিভেশন বোনাস</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {genStats.map((item) => (
            <div
              key={item.gen}
              className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">Gen {item.gen}</span>
                <span className="text-[10px] font-semibold text-gray-400">
                  {item.count} মেম্বার
                </span>
              </div>
              <div className="text-sm font-black text-emerald-600">
                +৳{formatCurrency(item.rate)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render Screen 2: Statistics & Breakdown Component ────────────────────────
  const renderBreakdownTab = () => (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Top Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#0284c7] text-white p-6 sm:p-7 shadow-xl shadow-teal-900/20 border border-teal-400/20">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1.5 max-w-[65%]">
            <div className="flex items-center gap-2 text-teal-100 text-xs font-semibold">
              <span>Total Referral Earnings</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="hover:text-white transition-colors"
              >
                {showBalance ? (
                  <EyeIcon className="w-4 h-4 text-teal-200" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4 text-teal-300" />
                )}
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
              <span>৳</span>
              <span>{showBalance ? formatCurrency(totalEarnings) : "••••••"}</span>
            </div>

            <div className="text-[11px] font-medium text-teal-100/90 pt-0.5">
              Last updated: Today, {dayjs().format("hh:mm A")}
            </div>
          </div>

          <div className="relative shrink-0 -mt-2 -mr-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <BanknotesIcon className="w-10 h-10 sm:w-12 sm:h-12 text-teal-200" />
            </div>
          </div>
        </div>
      </div>

      {/* 📊 3 Real Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Total Referrals */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto">
            <UserGroupIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold">Total Referrals</p>
          <p className="text-base sm:text-lg font-black text-gray-900">{totalReferrals}</p>
        </div>

        {/* Card 2: Active Referrals */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold">Active Members</p>
          <p className="text-base sm:text-lg font-black text-emerald-600">{activeReferrals}</p>
        </div>

        {/* Card 3: Direct Gen 1 */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <UserIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold">Direct (Gen 1)</p>
          <p className="text-base sm:text-lg font-black text-teal-600">
            {directReferrals}
          </p>
        </div>
      </div>

      {/* 💎 6-Generation Real Income Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
            জেনারেশন ভিত্তিক আয় বিবরণী
          </h3>
          <span className="text-[11px] font-bold text-emerald-600">
            মোট: ৳{formatCurrency(totalEarnings)}
          </span>
        </div>

        <div className="space-y-3">
          {genStats.map((item) => {
            const percentage =
              totalEarnings > 0
                ? Math.min(100, Math.round((item.earned / totalEarnings) * 100))
                : 0;

            return (
              <div
                key={item.gen}
                className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-light text-primary font-black text-[11px] flex items-center justify-center">
                      {item.gen}
                    </span>
                    <span className="font-bold text-gray-800">{item.title}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">
                      ৳{formatCurrency(item.earned)}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1.5">
                      ({item.count} জন)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔗 Referral Link & Social Sharing Icons */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
          Your Referral Link
        </h3>

        <div className="flex items-center justify-between p-3 bg-primary-light/50 border border-teal-100 rounded-2xl">
          <span className="text-xs font-mono text-gray-700 truncate pr-2">
            {refLink || "Loading referral link..."}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-xl hover:bg-white text-primary transition-colors shrink-0"
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
          className="w-full py-3.5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
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

      {/* 👥 Real Recent Referrals */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
            Recent Referrals
          </h3>
          <Link
            to="/user/refer-info"
            className="text-xs font-bold text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        {recentReferrals.length === 0 ? (
          <div className="py-6 text-center text-gray-400 space-y-1">
            <UserGroupIcon className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-semibold text-gray-600">এখনো কোনো রেফারেল হয়নি</p>
            <p className="text-[11px] text-gray-400">
              রেফারেল লিংক শেয়ার করে নতুন মেম্বার যুক্ত করুন।
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentReferrals.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50/80 transition-colors border border-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs uppercase">
                    {(item.user?.name || item.user?.username || "U")[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {item.user?.name || item.user?.username || "Member"}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {item.createdAt ? dayjs(item.createdAt).format("DD MMM, YYYY") : "Recently"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
                    +৳{formatCurrency(item.commition || 0)}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Gen {item.gen || 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <QuestionMarkCircleIcon className="w-5 h-5 text-primary stroke-[2]" />
          </button>
        </div>

        {/* 🌟 Segmented Switcher Tabs (Overview & Breakdown) */}
        <div className="p-1.5 bg-[#f0f2f8] rounded-2xl flex items-center gap-1.5 max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-primary text-white shadow-md shadow-teal-500/20"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview & Link
          </button>
          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "breakdown"
                ? "bg-primary text-white shadow-md shadow-teal-500/20"
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
                <UserGroupIcon className="w-5 h-5 text-primary" />
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
              <QuestionMarkCircleIcon className="w-5 h-5 text-primary" />
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
            <div className="p-3 bg-primary-light/60 rounded-2xl border border-teal-100">
              <p className="font-bold text-teal-900 mb-1">১. কীভাবে রেফারেল বোনাস পাব?</p>
              <p>আপনার ইউনিক রেফারেল লিংক বন্ধুদের শেয়ার করুন। তারা একাউন্ট খুলে অ্যাক্টিভ হলেই আপনার ওয়ালেটে সরাসরি কমিশন যুক্ত হবে।</p>
            </div>

            <div className="p-3 bg-primary-light/60 rounded-2xl border border-teal-100">
              <p className="font-bold text-teal-900 mb-1">২. ৬-জেনারেশন কমিশন কীভাবে কাজ করে?</p>
              <p>আপনার সরাসরি রেফারেল ১ম জেনারেশন। তাদের রেফারেল ২য় জেনারেশন—এভাবে ৬ষ্ঠ জেনারেশন পর্যন্ত আপনার নেটওয়ার্কের প্রতিটি জয়েনিং থেকে আপনি কমিশন পাবেন।</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all"
          >
            বুঝেছি
          </button>
        </Dialog>
      </div>
    </div>
  );
};

export default Refer;