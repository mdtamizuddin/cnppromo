import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import moment from "moment";
import { Card, Button } from "@material-tailwind/react";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  BanknotesIcon,
  ClockIcon,
  StarIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  UserGroupIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  TrophyIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  SparklesIcon,
  InboxArrowDownIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import { api } from "../../util/axios";

const recommendedCategories = [
  {
    id: 1,
    title: "TikTok free site",
    desc: "সহজ লাইক ও ফলো করে ইনস্ট্যান্ট আয় করুন",
    to: "/user/works/category/tiktop",
    tag: "🔥 সর্বাধিক ইনকাম",
    color: "#ff0050",
    bg: "from-pink-500/10 to-rose-500/5",
    icon: "🎵",
    popular: true,
  },
  {
    id: 2,
    title: "ইউটিউব ভিডিও ভিউস (Workercash)",
    desc: "ভিডিও দেখে সহজে প্রতি মিনিটে ইনকাম করুন",
    to: "/user/works/category/youtube",
    tag: "🔥 সর্বাধিক ইনকাম",
    color: "#ff0000",
    bg: "from-red-500/10 to-rose-500/5",
    icon: "▶️",
    popular: true,
  },
  {
    id: 3,
    title: "ফেসবুক পোস্ট (অটো জেনারেশন)",
    desc: "অটো জেনারেশন পোস্ট করে ঘরে বসে আয়",
    to: "/user/works/category/facebook",
    tag: "🔥 সর্বাধিক ইনকাম",
    color: "#1877f2",
    bg: "from-blue-500/10 to-indigo-500/5",
    icon: "📱",
    popular: true,
  },
  {
    id: 4,
    title: "Like follow (Getlike)",
    desc: "সোশ্যাল ফলো ও রিঅ্যাকশন টাস্ক",
    to: "/user/works/category/likefollow",
    color: "#10b981",
    bg: "from-emerald-500/10 to-teal-500/5",
    icon: "👍",
  },
  {
    id: 5,
    title: "Payup video views",
    desc: "ভিডিও ভিউস ওয়াচ অ্যান্ড আর্ন টাস্ক",
    to: "/user/works/category/Payup-video-views",
    color: "#8b5cf6",
    bg: "from-purple-500/10 to-indigo-500/5",
    icon: "🎬",
  },
  {
    id: 6,
    title: "Bux money",
    desc: "বিজ্ঞাপন ক্লিক ও মাইক্রো ব্রাউজিং টাস্ক",
    to: "/user/works/category/Bux-money",
    color: "#f59e0b",
    bg: "from-amber-500/10 to-yellow-500/5",
    icon: "💵",
  },
  {
    id: 7,
    title: "Vk surfing",
    desc: "ভিকে সোশ্যাল সার্ফিং ও কমিউনিটি টাস্ক",
    to: "/user/works/category/Vk%20surfing",
    color: "#0077ff",
    bg: "from-sky-500/10 to-blue-500/5",
    icon: "🌐",
  },
  {
    id: 8,
    title: "IP web / Aviso",
    desc: "সার্ভে ও ওয়েব অ্যাক্টিভিটি মাইক্রো-টাস্ক",
    to: "/user/works/category/IP%20web%2FAviso",
    color: "#059669",
    bg: "from-teal-500/10 to-emerald-500/5",
    icon: "💻",
  },
];

const Welcome = () => {
  const { user, settings } = useSelector((state) => state.user);
  const [showBalance, setShowBalance] = useState(true);
  const [claimedBonus, setClaimedBonus] = useState(false);

  const { data, isLoading } = useQuery(
    ["member-dashboard"],
    () => api.get("/user/dashboard").then((r) => r.data),
    { staleTime: 60_000, refetchOnWindowFocus: true }
  );

  const summary = data?.summary || {};
  const tasks = data?.tasks || { total: 0, completed: 0, pending: 0, rejected: 0 };
  const chart = data?.chart || [];
  const recentActivity = data?.recentActivity || [];
  const payment = (data?.paymentMethods && data.paymentMethods[0]) || { method: "Bkash", account: "" };
  const maskAccount = (acc = "") => (acc.length > 4 ? `${acc.slice(0, 3)}******${acc.slice(-2)}` : acc);

  const formatTaka = (v) => `৳ ${(Number(v) || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const fmtTime = (t) => (t ? moment(t).fromNow() : "");

  const activityTone = {
    withdrawal: { bg: "bg-rose-50", color: "text-rose-600", icon: <ArrowDownTrayIcon className="w-5 h-5" /> },
    topup: { bg: "bg-emerald-50", color: "text-emerald-600", icon: <InboxArrowDownIcon className="w-5 h-5" /> },
    refer: { bg: "bg-indigo-50", color: "text-indigo-600", icon: <UserGroupIcon className="w-5 h-5" /> },
  };

  const handleClaimBonus = () => {
    if (claimedBonus) {
      toast("আপনি আজকের বোনাস ইতিমধ্যে গ্রহণ করেছেন!", { icon: "ℹ️" });
      return;
    }
    setClaimedBonus(true);
    toast.success("অভিনন্দন! আপনি আজকের ৳১০ দৈনিক বোনাস পেয়েছেন! 🎉");
  };

  const quickActions = [
    {
      id: "dashboard",
      title: "Dashboard",
      subtitle: "Overview",
      to: "/user/home",
      icon: HomeIcon,
      color: "#0D9488",
      bg: "bg-teal-50",
    },
    {
      id: "tasks",
      title: "Available Tasks",
      subtitle: "Find work",
      to: "/user/works",
      icon: ClipboardDocumentListIcon,
      color: "#0284c7",
      bg: "bg-sky-50",
    },
    {
      id: "earnings",
      title: "My Earnings",
      subtitle: "Earnings",
      to: "/user/earnings",
      icon: CurrencyDollarIcon,
      color: "#f59e0b",
      bg: "bg-amber-50",
    },
    {
      id: "withdraw",
      title: "Withdraw",
      subtitle: "Withdraw balance",
      to: "/user/account/withdraw",
      icon: CreditCardIcon,
      color: "#e11d48",
      bg: "bg-rose-50",
    },
    {
      id: "payment-methods",
      title: "Payment Methods",
      subtitle: "Gateways & limits",
      to: "/user/payment-gateway",
      icon: BanknotesIcon,
      color: "#0891b2",
      bg: "bg-cyan-50",
    },
    {
      id: "refer",
      title: "Refer & Earn",
      subtitle: "Invite & earn",
      to: "/user/refer",
      icon: UserGroupIcon,
      color: "#10b981",
      bg: "bg-emerald-50",
    },
    {
      id: "task-marketplace",
      title: "Task Marketplace",
      subtitle: "Complete tasks & earn",
      to: "/user/tasks",
      icon: PlayCircleIcon,
      color: "#0D9488",
      bg: "bg-teal-50",
      badge: "HOT",
    },
    {
      id: "training",
      title: "Training & Support",
      subtitle: "Learn & Get Support",
      to: "/user/training",
      icon: AcademicCapIcon,
      color: "#6366f1",
      bg: "bg-indigo-50",
      badge: "NEW",
    },
    {
      id: "tips",
      title: "Work Tips",
      subtitle: "Tips & tricks",
      to: "/user/tips",
      icon: LightBulbIcon,
      color: "#eab308",
      bg: "bg-yellow-50",
    },
    {
      id: "message",
      title: "Message",
      subtitle: "Send message",
      to: "/user/message",
      icon: ChatBubbleLeftRightIcon,
      color: "#0D9488",
      bg: "bg-teal-50",
      activeBorder: true,
    },
  ];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">

        {/* 🌟 Top Dark Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          {/* Ambient Glows */}
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Welcome back,</p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>{user?.name || "Member"}</span>
                  <span className="text-2xl animate-bounce">👋</span>
                </h1>
                <p className="text-indigo-200/90 text-xs sm:text-sm mt-1">
                  Let's complete tasks and earn more!
                </p>
              </div>

              {/* Glassmorphism Balance Container */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
                    <span>Available Balance</span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {showBalance ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
                    {showBalance
                      ? `৳ ${(((user?.balance || 0) + (data?.bonus?.effective || 0))).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "৳ ••••••••"}
                  </div>
                  {showBalance && data?.bonus?.effective > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-indigo-100/90">
                        <span className="font-semibold text-amber-300">Main ৳{(user?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        <span className="text-gray-400">+</span>
                        <span className="font-semibold text-amber-300">Bonus ৳{data.bonus.effective.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        {(data.bonus.startDate || data.bonus.endDate) && (
                          <span className="text-gray-400">
                            · {data.bonus.startDate && `From ${new Date(data.bonus.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                            {data.bonus.startDate && data.bonus.endDate && " to "}
                            {data.bonus.endDate && `${new Date(data.bonus.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-gray-400 text-[11px] mt-1">
                    Minimum Withdraw: ৳300.00
                  </p>
                </div>

                <Link to="/user/account/withdraw">
                  <Button className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] hover:from-[#fa5252] hover:to-[#f76707] normal-case text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105">
                    <span>Withdraw Now</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right 3D Wallet Graphic */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square">
                <img
                  src="/payment_proof_hero.jpg"
                  alt="CNP-PROMO Wallet"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 📊 5 Key Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

          {/* 1. Today's Earnings */}
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Today's Earnings</p>
              <p className="text-lg font-bold text-[#0b0c2a] mt-0.5">{isLoading ? "…" : formatTaka(summary.todayEarnings)}</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <span>Today</span>
              <span className="text-gray-400 font-normal">tasks + referrals</span>
            </p>
          </Card>

          {/* 2. This Month */}
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <ChartPieIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">This Month</p>
              <p className="text-lg font-bold text-[#0b0c2a] mt-0.5">{isLoading ? "…" : formatTaka(summary.monthEarnings)}</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <span>Monthly</span>
              <span className="text-gray-400 font-normal">total earnings</span>
            </p>
          </Card>

          {/* 3. Total Withdrawn */}
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Total Withdrawn</p>
              <p className="text-lg font-bold text-[#0b0c2a] mt-0.5">{isLoading ? "…" : formatTaka(summary.totalWithdrawn)}</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">All time</p>
          </Card>

          {/* 4. Pending Balance */}
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Pending Balance</p>
              <p className="text-lg font-bold text-[#0b0c2a] mt-0.5">{isLoading ? "…" : formatTaka(summary.pendingWithdraw)}</p>
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-2">Pending</p>
          </Card>

          {/* 5. Success Rate */}
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <StarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Success Rate</p>
              <p className="text-lg font-bold text-[#0b0c2a] mt-0.5">{isLoading ? "…" : `${summary.successRate ?? 0}%`}</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">Withdrawal success</p>
          </Card>

        </div>

        {/* 📈 Earnings Trend (Last 14 Days) */}
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0b0c2a] flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brand-gradient text-white grid place-items-center shadow-md shadow-teal-500/20">
                  <ChartPieIcon className="w-4 h-4" />
                </span>
                <span>Earnings Trend</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily tasks + referral earnings (last 14 days)</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50">
              <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
              {formatTaka(summary.monthEarnings)} this month
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="uEarn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => moment(d).format("MMM D")}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  formatter={(v) => [formatTaka(v), "Earnings"]}
                  labelFormatter={(d) => moment(d).format("MMM D, YYYY")}
                  contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#0D9488" strokeWidth={2.5} fill="url(#uEarn)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ⚡ Quick Actions (10 Card Grid) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0b0c2a]">Quick Actions</h2>
            <Link to="/user/works" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link key={action.id} to={action.to}>
                  <Card
                    className={`p-5 bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center relative group h-full justify-between ${action.activeBorder
                      ? "border-primary ring-2 ring-teal-500/10 shadow-teal-500/10"
                      : "border-gray-100"
                      }`}
                  >
                    {action.badge && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold px-1.5 py-0.5 bg-primary text-white rounded-md shadow-sm">
                        {action.badge}
                      </span>
                    )}

                    <div
                      className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      style={{ color: action.color }}
                    >
                      <ActionIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3
                        className="text-xs sm:text-sm font-bold truncate max-w-full"
                        style={{ color: action.color }}
                      >
                        {action.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{action.subtitle}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 🎯 সাজেস্টেড কাজসমূহ (Recommended Tasks Section migrated from Home2) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-bold tracking-wide mb-1">
                <SparklesIcon className="w-3.5 h-3.5" />
                সাজেস্টেড কাজসমূহ
              </div>
              <h2 className="text-lg font-bold text-[#0b0c2a]">
                বেশি আয়ের সেরা কাজগুলো নির্বাচন করুন
              </h2>
            </div>
            <Link to="/user/works" className="text-xs font-semibold text-primary hover:underline">
              সকল কাজ দেখুন →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCategories.map((item) => (
              <Link key={item.id} to={item.to}>
                <Card
                  className={`p-5 rounded-2xl border bg-gradient-to-br ${item.bg} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full border-gray-100 group relative overflow-hidden`}
                >
                  {item.popular && (
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 bg-rose-500 text-white rounded-full shadow-sm">
                      {item.tag}
                    </span>
                  )}

                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>

                    <h3 className="font-bold text-sm text-[#0b0c2a] group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100/60 flex items-center justify-between text-xs font-bold text-primary">
                    <span>কাজ শুরু করুন</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* 💡 Advisory Banner / Expert Tips Card from Home2 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50/40 border border-amber-200/60 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <LightBulbIcon className="w-5 h-5 text-amber-600 shrink-0" />
              <span>বিশেষ কাজের পরামর্শ ও নির্দেশিকা:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 font-black">১.</span>
                <span>প্রথম ৩টি সাইটে (TikTok, YouTube, Facebook) নিয়মিত কাজ করলে সবচেয়ে বেশি আয় করতে পারবেন।</span>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 font-black">২.</span>
                <span>আমাদের দেখানো সঠিক নিয়ম মেনে কাজ করলে আপনি দৈনিক ৩০০-৫০০ টাকা সহজেই ইনকাম করতে পারবেন।</span>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 font-black">৩.</span>
                <span>বন্ধুদের ইনভাইট করে ৬-জেনারেশন মাল্টি-লেভেল রেফারেল কমিশন উপভোগ করুন।</span>
              </div>
            </div>
          </div>
        </section>

        {/* 📊 Two-Column Middle Section: My Tasks & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: My Tasks */}
          <Card className="lg:col-span-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[#0b0c2a]">My Tasks</h3>
                <Link to="/user/my-submissions" className="text-xs font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>

              {/* Circular Progress Indicator + Stats */}
              <div className="flex items-center justify-around my-4">
                {/* Circular Donut Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Completed", value: tasks.completed, color: "#10b981" },
                          { name: "Pending", value: tasks.pending, color: "#f59e0b" },
                          { name: "Rejected", value: tasks.rejected, color: "#f43f5e" },
                        ]}
                        dataKey="value"
                        innerRadius={34}
                        outerRadius={44}
                        paddingAngle={2}
                        strokeWidth={0}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {[
                          { name: "Completed", value: tasks.completed, color: "#10b981" },
                          { name: "Pending", value: tasks.pending, color: "#f59e0b" },
                          { name: "Rejected", value: tasks.rejected, color: "#f43f5e" },
                        ].map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-[#0b0c2a]">{tasks.total || 0}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Total</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-emerald-600">{tasks.completed || 0}</span>
                    <span className="text-gray-500">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-amber-600">{tasks.pending || 0}</span>
                    <span className="text-gray-500">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="font-bold text-rose-600">{tasks.rejected || 0}</span>
                    <span className="text-gray-500">Rejected</span>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/user/my-submissions" className="mt-4">
              <Button
                variant="outlined"
                className="w-full rounded-xl normal-case text-xs font-bold border-primary/30 text-primary hover:bg-primary-light py-3"
              >
                Go to My Tasks
              </Button>
            </Link>
          </Card>

          {/* Right Column: Recent Activity */}
          <Card className="lg:col-span-7 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0b0c2a]">Recent Activity</h3>
              <Link to="/user/account/withdraw" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {recentActivity.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No recent activity yet</div>
              ) : recentActivity.map((act, idx) => {
                const tone = activityTone[act.type] || activityTone.topup;
                const isOut = act.type === "withdrawal";
                return (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${tone.bg} ${tone.color} flex items-center justify-center`}>
                        {tone.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0b0c2a]">{act.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {act.type === "withdrawal" ? "Withdrawal" : act.type === "topup" ? "Deposit" : "Commission"} • {act.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isOut ? "text-rose-500" : "text-emerald-600"}`}>
                        {isOut ? "−" : "+"}{formatTaka(act.amount)}
                      </p>
                      <p className="text-[10px] text-gray-400">{fmtTime(act.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

        {/* 💳 Bottom Section: Payment Methods & Daily Bonus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Payment Methods */}
          <Card className="lg:col-span-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0b0c2a]">Payment Methods</h3>
                <Link to="/user/account/withdraw" className="text-xs font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                {/* Real payment method */}
                <div className="p-3 rounded-2xl border border-pink-100 bg-pink-50/40 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-[#E2136E] flex items-center justify-center font-bold text-xs mb-2">
                    {payment.method?.slice(0, 2).toUpperCase() || "bK"}
                  </div>
                  <p className="text-xs font-bold text-gray-800">{payment.method || "bKash"}</p>
                  <p className="text-[10px] text-gray-400">{maskAccount(payment.account) || "Not set"}</p>
                </div>

                {/* Add New */}
                <Link to="/user/account/withdraw" className="p-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary flex flex-col items-center justify-center text-center transition-colors">
                  <PlusIcon className="w-5 h-5 text-gray-400 mb-1" />
                  <p className="text-[11px] font-bold text-gray-600">+ Add New</p>
                </Link>
              </div>
            </div>
          </Card>

          {/* Right Column: Daily Bonus Banner */}
          <Card className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-r from-[#0b0c2a] via-[#1a1b41] to-[#0b0c2a] text-white border border-teal-900/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-2 text-center sm:text-left z-10">
              <h3 className="text-lg font-black text-white">Daily Bonus</h3>
              <p className="text-xs text-gray-300">Login daily & claim your bonus</p>
              <p className="text-2xl font-black text-amber-400">৳0</p>

              <Button
                disabled={true}
                className="bg-gray-700/60 text-gray-400 normal-case font-bold text-xs px-6 py-2.5 rounded-xl shadow-none cursor-not-allowed border border-gray-600/40 opacity-70"
              >
                Claim Now
              </Button>
            </div>

            {/* 3D Gift Box Graphic */}
            <div className="w-24 sm:w-28 aspect-square flex items-center justify-center text-5xl relative z-10 animate-bounce">
              🎁
            </div>
          </Card>

        </div>

        {/* 📚 Help & Rules Strip (4 Info Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">

          <Link to="/how-it-works">
            <Card className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#0b0c2a]">How It Works</p>
                <p className="text-[10px] text-gray-400 truncate">Learn how to earn</p>
              </div>
            </Card>
          </Link>

          <Link to="/payment-proof">
            <Card className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#0b0c2a]">Payment Proof</p>
                <p className="text-[10px] text-gray-400 truncate">See our payments</p>
              </div>
            </Card>
          </Link>

          <Link to="/how-it-works">
            <Card className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#0b0c2a]">Withdrawal Rules</p>
                <p className="text-[10px] text-gray-400 truncate">Read before withdraw</p>
              </div>
            </Card>
          </Link>

          <a href={settings?.links?.supportMessanger || "https://m.me/1151649641374328"} target="_blank"
            rel="noopener noreferrer">
            <Card className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <QuestionMarkCircleIcon className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#0b0c2a]">Help Center</p>
                <p className="text-[10px] text-gray-400 truncate">We are here to help</p>
              </div>
            </Card>
          </a>

        </div>

      </div>
    </div>
  );
};

export default Welcome;
