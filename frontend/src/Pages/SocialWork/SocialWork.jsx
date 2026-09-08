import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Progress,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  BanknotesIcon,
  SparklesIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import SocialNav from "./components/SocialNav";

const platformPills = [
  { id: "all", label: "All Platforms", icon: "🌐" },
  { id: "youtube", label: "YouTube", icon: "▶" },
  { id: "facebook", label: "Facebook", icon: "f" },
  { id: "tiktok", label: "TikTok", icon: "♫" },
  { id: "instagram", label: "Instagram", icon: "📷" },
  { id: "telegram", label: "Telegram", icon: "✈" },
  { id: "twitter", label: "Twitter / X", icon: "𝕏" },
  { id: "other", label: "Other", icon: "★" },
];

const SocialWork = () => {
  const { user } = useSelector((state) => state.user);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch Marketplace Active Tasks
  const { data: dbWorks, isLoading } = useQuery({
    queryKey: ["social-works"],
    queryFn: async () => {
      const res = await api.get("social-works/all");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    staleTime: 3000,
    refetchOnMount: "always",
  });

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    let result = Array.isArray(dbWorks) ? [...dbWorks] : [];

    // Filter out user's own created campaigns from the worker marketplace feed
    if (user?._id) {
      result = result.filter(
        (t) => String(t.providerId?._id || t.providerId) !== String(user._id)
      );
    }

    if (selectedPlatform !== "all") {
      result = result.filter(
        (t) => (t.platform || "").toLowerCase() === selectedPlatform.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.actionType?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "highest") {
      result.sort((a, b) => (b.reward || b.price || 0) - (a.reward || a.price || 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => (a.reward || a.price || 0) - (b.reward || b.price || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [dbWorks, selectedPlatform, searchQuery, sortBy]);

  const renderPlatformIcon = (platform) => {
    const p = (platform || "").toLowerCase();
    if (p === "youtube") {
      return (
        <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold shrink-0">
          ▶
        </div>
      );
    }
    if (p === "facebook") {
      return (
        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#1877f2] flex items-center justify-center text-xl font-bold font-serif shrink-0">
          f
        </div>
      );
    }
    if (p === "tiktok") {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gray-100 text-black flex items-center justify-center text-xl font-bold shrink-0">
          ♫
        </div>
      );
    }
    if (p === "instagram") {
      return (
        <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl font-bold shrink-0">
          📷
        </div>
      );
    }
    if (p === "telegram") {
      return (
        <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center text-xl font-bold shrink-0">
          ✈
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold shrink-0">
        ★
      </div>
    );
  };

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-3 sm:pt-4">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl space-y-4 sm:space-y-6">
        {/* Shared Sub-Navigation Bar */}
        <SocialNav />

        {/* 🌟 Hero Banner - Compact & Engaging on Mobile */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#d2fbf0] via-[#e2fbf6] to-[#d6f7ff] p-4 sm:p-8 lg:p-10 border border-teal-100/80 shadow-xs">
          <div className="absolute right-0 top-0 w-64 sm:w-80 h-64 sm:h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center relative z-10">
            {/* Left Content */}
            <div className="sm:col-span-8 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-[11px] sm:text-xs font-bold tracking-wide">
                <span>Microtask Marketplace</span>
                <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0b0c2a] leading-tight tracking-tight">
                  Small Tasks{" "}
                  <span className="bg-gradient-to-r from-[#0d9488] to-[#0284c7] bg-clip-text text-transparent">
                    Real Earnings
                  </span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1.5 sm:mt-2 max-w-lg font-medium leading-relaxed">
                  Earn BDT by subscribing, liking, and watching content, or post tasks to grow your own channels.
                </p>
              </div>

              <div className="flex flex-row items-center gap-2.5 sm:gap-4 pt-1">
                <Link to="/user/social-works/create" className="flex-1 xs:flex-none">
                  <Button
                    className="w-full xs:w-auto min-h-[42px] bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                    <span>Post a Task</span>
                  </Button>
                </Link>

                <Link
                  to="/user/social-works/my-tasks"
                  className="flex-1 xs:flex-none min-h-[42px] px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/90 text-gray-700 font-bold text-xs sm:text-sm border border-gray-200 hover:bg-white transition-all shadow-2xs text-center flex items-center justify-center active:scale-95"
                >
                  My Campaigns
                </Link>
              </div>
            </div>

            {/* Right Illustration (Hidden on extra small screens to keep tasks above the fold) */}
            <div className="hidden sm:flex sm:col-span-4 justify-center">
              <div className="relative w-36 sm:w-48 lg:w-56 aspect-square">
                <img
                  src="/works_hero_illustration.jpg"
                  alt="Tasks & Rewards"
                  className="w-full h-full object-contain drop-shadow-xl rounded-3xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Search & Filters Bar */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, platform, or action..."
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl text-base sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 sm:py-3 bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-xs cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Reward</option>
                <option value="lowest">Lowest Reward</option>
              </select>
            </div>
          </div>

          {/* Platform Filter Pills - Touch Scrolling with momentum */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth touch-pan-x">
            {platformPills.map((pill) => {
              const isSelected = selectedPlatform === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedPlatform(pill.id)}
                  className={`min-h-[38px] flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shrink-0 border whitespace-nowrap active:scale-95 touch-tap-none ${
                    isSelected
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50"
                  }`}
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🛒 Task Cards Feed */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-xs sm:text-sm text-gray-400 font-medium">
              Loading available tasks…
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm bg-white">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                🔍
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-800">No active tasks found</h4>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Check back soon or post your own task to get workers for your social media channels.
              </p>
              <div className="mt-5">
                <Link to="/user/social-works/create">
                  <Button className="bg-teal-600 hover:bg-teal-700 normal-case text-xs sm:text-sm px-5 py-2.5 rounded-xl text-white font-bold active:scale-95">
                    Post a Task Now
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const reward = task.reward || task.price || 0;
              const completed = task.completedQuantity || 0;
              const total = task.targetQuantity || 1;
              const progress = Math.min(100, Math.round((completed / total) * 100));

              return (
                <Card
                  key={task._id}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-5"
                >
                  {/* Left: Platform Icon & Details */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full min-w-0">
                    <div className="shrink-0">
                      {renderPlatformIcon(task.platform)}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 sm:line-clamp-1 break-words">
                          {task.title}
                        </h3>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full capitalize shrink-0">
                          {task.actionType?.replace("_", " ")}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed break-words">
                          {task.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="max-w-xs space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                          <span>Capacity: <strong className="text-teal-700">{completed}</strong> / {total} done</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} size="sm" color="teal" />
                      </div>
                    </div>
                  </div>

                  {/* Right / Bottom on Mobile: Net Earnings & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-gray-100 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-lg sm:text-xl font-black text-emerald-600 leading-tight">
                        ৳{reward.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">You Earn</p>
                    </div>

                    <Link to={`/user/social-works/${task._id}`} className="shrink-0">
                      <Button
                        className="min-h-[40px] bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <span>Start Task</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* 🔄 How It Works 4-Step Process Section - 2x2 Grid on Mobile */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-xs mt-8 sm:mt-12">
          <div className="flex items-center gap-2 mb-5 sm:mb-8">
            <SparklesIcon className="w-5 h-5 text-teal-600" />
            <h3 className="text-base sm:text-lg font-bold text-[#0b0c2a]">How Social Tasks Work</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50/50 sm:bg-transparent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 shadow-2xs">
                🎯
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">1. Pick Task</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Select an active task that interests you.</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50/50 sm:bg-transparent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 shadow-2xs">
                ⚡
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">2. Complete</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Perform the action & take screenshot proof.</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50/50 sm:bg-transparent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 shadow-2xs">
                🛡️
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">3. Escrow</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Task rewards are guaranteed in escrow.</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50/50 sm:bg-transparent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 shadow-2xs">
                💰
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">4. Get Paid</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Earned BDT credits instantly to your balance.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialWork;
