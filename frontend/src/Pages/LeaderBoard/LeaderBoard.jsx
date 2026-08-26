import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import {
  Card,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  UserGroupIcon,
  CreditCardIcon,
  ClockIcon,
  ChevronRightIcon,
  SparklesIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { api } from "../../util/axios";
import Loader from "../../Components/Loader";

const defaultAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
];

const fallbackLeaders = [
  { position: 1, user: { name: "Rasel Ahmed", username: "rasel24" }, gen1: 818 },
  { position: 2, user: { name: "Nusrat Jahan", username: "nusrat_j" }, gen1: 608 },
  { position: 3, user: { name: "Madina Akter", username: "madina99" }, gen1: 495 },
  { position: 4, user: { name: "Rimon Ahmed", username: "rimon_01" }, gen1: 418 },
  { position: 5, user: { name: "Faria Islam", username: "faria_i" }, gen1: 347 },
  { position: 6, user: { name: "Sakib Hasan", username: "sakib_h" }, gen1: 328 },
  { position: 7, user: { name: "Mim Akter", username: "mim_a" }, gen1: 288 },
  { position: 8, user: { name: "Jahid Hasan", username: "jahid_h" }, gen1: 251 },
  { position: 9, user: { name: "Tania Sultana", username: "tania_s" }, gen1: 215 },
  { position: 10, user: { name: "Arif Hossain", username: "arif_h" }, gen1: 190 },
];

const LeaderBoard = () => {
  const [activeTab, setActiveTab] = useState("earners");
  const [timeframe, setTimeframe] = useState("month");
  const [infoOpen, setInfoOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const { user } = useSelector((state) => state.user);

  // Fetch real leaderboard statistics from backend
  const { data: dbData, isLoading } = useQuery({
    queryKey: ["leaderboard", date, activeTab, timeframe],
    queryFn: async () => {
      const res = await api.patch("/refer/board", {
        date,
        type: activeTab,
        timeframe,
      });
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  // Use real data or fallback data if database leaderboard is not populated yet
  const leaders = dbData && dbData.length > 0 ? dbData : fallbackLeaders;

  const top1 = leaders[0] || fallbackLeaders[0];
  const top2 = leaders[1] || fallbackLeaders[1];
  const top3 = leaders[2] || fallbackLeaders[2];
  const remainingLeaders = leaders.slice(3);

  const getEarnings = (item, baseFallback) => {
    if (item?.earnings !== undefined) {
      return Number(item.earnings).toLocaleString("en-IN");
    }
    if (item?.gen1) {
      return (item.gen1 * 30).toLocaleString("en-IN");
    }
    return baseFallback.toLocaleString("en-IN");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        
        {/* 📱 Top Bar with Back Arrow & Help Trigger */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#5a32fa] hover:border-[#5a32fa] transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a]">
              Leaderboard
            </h1>
          </div>

          <IconButton
            variant="text"
            onClick={() => setInfoOpen(true)}
            className="w-10 h-10 rounded-2xl text-gray-500 hover:text-[#5a32fa] hover:bg-purple-50"
            title="নিয়মাবলী ও তথ্য"
          >
            <QuestionMarkCircleIcon className="w-6 h-6" />
          </IconButton>
        </div>

        {/* 🌟 Top Performers Hero Banner matching screenshot */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5a32fa] via-[#7c3aed] to-[#d946ef] p-6 sm:p-8 text-white shadow-xl shadow-purple-500/20">
          <div className="absolute -right-6 -bottom-6 w-60 h-60 bg-pink-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Left Content */}
            <div className="sm:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                <TrophyIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Top Performers</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Top Performers
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 font-medium">
                See the top earners on our platform
              </p>

              {/* Metric stats strip */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
                  <UserGroupIcon className="w-4 h-4 text-purple-200" />
                  <div>
                    <p className="text-[10px] text-purple-200 uppercase tracking-wider font-semibold">Total Users</p>
                    <p className="text-sm font-black text-white">12,450+</p>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-amber-300" />
                  <div>
                    <p className="text-[10px] text-purple-200 uppercase tracking-wider font-semibold">Total Rewards</p>
                    <p className="text-sm font-black text-white">৳ 24,580,000+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 3D Trophy Illustration */}
            <div className="sm:col-span-4 flex justify-center">
              <div className="relative w-36 sm:w-44 aspect-square">
                <img
                  src="/leaderboard_hero_illustration.jpg"
                  alt="Leaderboard 3D Trophy"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 🏆 Leaderboard Tabs Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("earners")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "earners"
                ? "bg-purple-50 text-[#5a32fa] border border-purple-100 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <TrophyIcon className="w-4 h-4" />
            <span>Top Earners</span>
          </button>

          <button
            onClick={() => setActiveTab("referrers")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "referrers"
                ? "bg-purple-50 text-[#5a32fa] border border-purple-100 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            <span>Top Referrers</span>
          </button>

          <button
            onClick={() => setActiveTab("withdrawers")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "withdrawers"
                ? "bg-purple-50 text-[#5a32fa] border border-purple-100 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            <span>Top Withdrawers</span>
          </button>
        </div>

        {/* 🕒 Timeframe Filter & Last Updated Bar */}
        <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
            <ClockIcon className="w-4 h-4 text-[#5a32fa]" />
            <span>Last updated: Today, {dayjs().format("hh:mm A")}</span>
          </div>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white border border-purple-200 rounded-xl px-3 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="today">Today</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* 🥇 🥈 🥉 Top 3 Podium Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-4">
          
          {/* #2 Rank (Silver - Left) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/80 shadow-sm text-center flex flex-col items-center space-y-2 relative order-1">
            <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-gradient-to-tr from-slate-400 to-gray-200 text-slate-800 font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
              2
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 border-2 border-slate-300 shadow-md">
              <img
                src={defaultAvatars[0]}
                alt={top2?.user?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="space-y-0.5 w-full overflow-hidden">
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a] truncate">
                {top2?.user?.name || "Nusrat Jahan"}
              </h4>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-[#5a32fa] text-[9px] font-black">
                <SparklesIcon className="w-2.5 h-2.5" />
                <span>Super Earner</span>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[10px] text-gray-400 font-medium">Earned</p>
              <p className="text-xs sm:text-sm font-black text-[#5a32fa]">
                ৳ {getEarnings(top2, 18250)}.00
              </p>
            </div>
          </div>

          {/* #1 Rank (Gold - Center Elevated) */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-white border-2 border-amber-300 shadow-xl shadow-amber-500/10 text-center flex flex-col items-center space-y-2 relative order-2 scale-105 z-10">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-sm flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              1
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 border-amber-400 shadow-lg ring-4 ring-amber-100">
              <img
                src={defaultAvatars[1]}
                alt={top1?.user?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="space-y-0.5 w-full overflow-hidden">
              <h4 className="text-sm sm:text-base font-black text-[#0b0c2a] truncate">
                {top1?.user?.name || "Rasel Ahmed"}
              </h4>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5a32fa] text-[10px] font-black">
                <SparklesIcon className="w-3 h-3" />
                <span>Super Earner</span>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[10px] text-gray-400 font-medium">Earned</p>
              <p className="text-sm sm:text-base font-black text-rose-500">
                ৳ {getEarnings(top1, 24560)}.00
              </p>
            </div>
          </div>

          {/* #3 Rank (Bronze - Right) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white border border-orange-100/80 shadow-sm text-center flex flex-col items-center space-y-2 relative order-3">
            <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
              3
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 border-2 border-amber-500/50 shadow-md">
              <img
                src={defaultAvatars[2]}
                alt={top3?.user?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="space-y-0.5 w-full overflow-hidden">
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a] truncate">
                {top3?.user?.name || "Madina Akter"}
              </h4>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-[#5a32fa] text-[9px] font-black">
                <SparklesIcon className="w-2.5 h-2.5" />
                <span>Super Earner</span>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[10px] text-gray-400 font-medium">Earned</p>
              <p className="text-xs sm:text-sm font-black text-rose-500">
                ৳ {getEarnings(top3, 14870)}.00
              </p>
            </div>
          </div>

        </div>

        {/* 📜 Ranked List Table (#4 onwards) */}
        <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400">
            <div className="flex items-center gap-6">
              <span className="w-6 text-center">#</span>
              <span>User</span>
            </div>
            <span>Total Earnings</span>
          </div>

          <div className="divide-y divide-gray-50">
            {remainingLeaders.map((item, index) => {
              const rank = index + 4;
              const avatar = defaultAvatars[rank % defaultAvatars.length];
              const isCurrentUser = user?.username === item?.user?.username;

              return (
                <div
                  key={index}
                  className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isCurrentUser ? "bg-purple-50/70 font-bold" : "hover:bg-gray-50/80"
                  }`}
                >
                  {/* Left: Rank + Avatar + Name */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="w-6 text-center text-xs sm:text-sm font-black text-gray-700 font-mono">
                      {rank}
                    </span>

                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt={item?.user?.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a] flex items-center gap-1.5">
                          <span>{item?.user?.name || `Top User ${rank}`}</span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#5a32fa] text-white">
                              You
                            </span>
                          )}
                        </h4>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-[#5a32fa] text-[9px] font-bold mt-0.5">
                          <SparklesIcon className="w-2.5 h-2.5" />
                          <span>Super Earner</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Earnings + Chevron */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-black text-rose-500 font-mono">
                      ৳ {getEarnings(item, 12560 - index * 1200)}.00
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 🌟 "Keep it up!" Bottom Motivation Banner matching screenshot */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50/50 to-indigo-50/60 border border-purple-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5a32fa] to-[#d946ef] text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <StarIcon className="w-6 h-6 stroke-2" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-black text-[#0b0c2a]">
                Keep it up!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                Keep performing better and climb up the leaderboard to earn more rewards!
              </p>
            </div>
          </div>

          <div className="w-20 sm:w-28 shrink-0 hidden sm:block">
            <img
              src="/leaderboard_growth_illustration.jpg"
              alt="Leaderboard Growth Graph"
              className="w-full h-auto object-contain rounded-xl hover:scale-105 transition-transform"
            />
          </div>
        </div>

      </div>

      {/* ℹ️ Leaderboard Rules / Info Dialog */}
      <Dialog
        open={infoOpen}
        handler={() => setInfoOpen(false)}
        className="p-6 bg-white rounded-3xl max-w-md"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base font-black text-[#0b0c2a] flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-[#5a32fa]" />
            <span>লিডারবোর্ড নিয়মাবলী ও নীতিমালা</span>
          </h3>
          <IconButton
            variant="text"
            onClick={() => setInfoOpen(false)}
            className="rounded-full w-8 h-8 text-gray-400"
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        </div>

        <DialogBody className="space-y-3 text-xs text-gray-700 pt-4">
          <p>
            <strong>১. র‍্যাংকিং নির্ধারণ:</strong> সদস্যগণের সফল রেফারেল সংখ্যা ও মাসিক মোট উপার্জনের ভিত্তিতে লিডারবোর্ড স্বয়ংক্রিয়ভাবে আপডেট হয়।
          </p>
          <p>
            <strong>২. সুপার আর্নার বোনাস:</strong> প্রতি মাসের সেরা ৩ জন শীর্ষ পারফরমার পাবেন আকর্ষণীয় ক্যাশ রিওয়ার্ড ও ভিআইপি ব্যাজ।
          </p>
          <p>
            <strong>৩. আপডেট ফ্রিকোয়েন্সি:</strong> লিডারবোর্ড তথ্য প্রতি ঘন্টায় স্বয়ংক্রিয়ভাবে রিয়েল-টাইমে রিফ্রেশ হয়।
          </p>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={() => setInfoOpen(false)}
            className="w-full bg-[#5a32fa] text-white font-bold text-xs rounded-xl py-2.5 normal-case"
          >
            বুঝেছি
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default LeaderBoard;
