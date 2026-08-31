import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ArrowRightIcon,
  BanknotesIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  EllipsisHorizontalIcon,
  HandThumbUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

const categoryTabs = [
  { id: "all", label: "All Tasks", icon: ClipboardDocumentCheckIcon },
  { id: "social", label: "Social Media", icon: HandThumbUpIcon },
  { id: "surveys", label: "Surveys", icon: DocumentTextIcon },
  { id: "apps", label: "Apps", icon: DevicePhoneMobileIcon },
  { id: "website", label: "Website", icon: GlobeAltIcon },
  { id: "others", label: "Others", icon: EllipsisHorizontalIcon },
];

const SocialWork = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch real social works from backend API
  const { data: dbWorks, isLoading } = useQuery({
    queryKey: ["social-works"],
    queryFn: async () => {
      const res = await api.get("social-works/all");
      return res.data;
    },
    staleTime: 30000,
  });

  const allTasks = useMemo(() => {
    if (Array.isArray(dbWorks)) {
      return dbWorks.map((work) => ({
        ...work,
        difficulty: work.difficulty || (work.duration > 180 ? "Medium" : "Easy"),
        categoryLabel: work.category || "Social Media",
        category: (work.category || "social").toLowerCase(),
      }));
    }
    return [];
  }, [dbWorks]);

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    let result = [...allTasks];

    if (activeCategory !== "all") {
      result = result.filter((task) => {
        const cat = (task.category || "").toLowerCase();
        const title = (task.title || "").toLowerCase();
        if (activeCategory === "social") {
          return cat.includes("social") || title.includes("youtube") || title.includes("facebook") || title.includes("tiktok");
        }
        if (activeCategory === "surveys") return cat.includes("survey") || title.includes("survey");
        if (activeCategory === "apps") return cat.includes("app") || title.includes("app");
        if (activeCategory === "website") return cat.includes("website") || title.includes("visit") || title.includes("web");
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "highest") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [allTasks, activeCategory, searchQuery, sortBy]);

  const renderIcon = (task) => {
    const title = (task.title || "").toLowerCase();
    if (title.includes("youtube")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-red-100/70 text-red-600 flex items-center justify-center text-2xl font-black shrink-0">
          ▶
        </div>
      );
    }
    if (title.includes("facebook")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-[#1877f2] flex items-center justify-center text-2xl font-bold font-serif shrink-0">
          f
        </div>
      );
    }
    if (title.includes("survey")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center text-xl shrink-0">
          📋
        </div>
      );
    }
    if (title.includes("app")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-orange-600 flex items-center justify-center text-xl shrink-0">
          📲
        </div>
      );
    }
    if (title.includes("visit") || title.includes("website")) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center text-xl shrink-0">
          🌐
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-600 flex items-center justify-center text-xl shrink-0">
        🎬
      </div>
    );
  };

  const formatDuration = (sec) => {
    if (!sec) return "1 min";
    if (sec >= 60) {
      const min = Math.floor(sec / 60);
      const rem = sec % 60;
      return rem > 0 ? `${min} min ${rem}s` : `${min} min`;
    }
    return `${sec} sec`;
  };

  const getBtnGradient = (task) => {
    const title = (task.title || "").toLowerCase();
    if (title.includes("youtube")) return "bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] shadow-red-500/20";
    if (title.includes("facebook")) return "bg-gradient-to-r from-[#2193b0] to-[#6dd5ed] shadow-blue-500/20";
    if (title.includes("survey")) return "bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] shadow-purple-500/20";
    if (title.includes("app")) return "bg-gradient-to-r from-[#f12711] to-[#f5af19] shadow-orange-500/20";
    return "bg-gradient-to-r from-[#11998e] to-[#38ef7d] shadow-emerald-500/20";
  };

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#d2fbf0] via-[#e2fbf6] to-[#d6f7ff] p-6 sm:p-8 lg:p-10 border border-teal-100/80 shadow-sm">
          {/* Ambient Glows */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-xs font-bold tracking-wide">
                <span>Complete Tasks & Earn</span>
                <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b0c2a] leading-tight tracking-tight">
                  Small Tasks{" "}
                  <span className="bg-gradient-to-r from-[#0d9488] to-[#0284c7] bg-clip-text text-transparent">
                    Big Rewards
                  </span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-lg font-medium">
                  Choose a task you like, complete it and earn exciting rewards!
                </p>
              </div>

              {/* Floating Balance Container */}
              <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-teal-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BanknotesIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Your Balance</p>
                  <p className="text-lg font-extrabold text-[#0b0c2a]">
                    ৳ {(user?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-52 sm:w-60 lg:w-72 aspect-square">
                <img
                  src="/works_hero_illustration.jpg"
                  alt="Tasks & Rewards"
                  className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 rounded-3xl"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 🔍 Search & Category Filter Bar */}
        <div className="space-y-4">
          
          {/* Top Search Input & Filter Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all"
              />
            </div>

            <Button
              variant="outlined"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-gray-200/80 text-gray-700 bg-white shadow-sm flex items-center justify-center gap-2 normal-case text-xs font-bold"
            >
              <FunnelIcon className="w-4 h-4 text-teal-600" />
              Filter
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                    isActive
                      ? "bg-[#0d9488] text-white shadow-md shadow-teal-500/20 scale-105"
                      : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* 📋 Available Tasks List Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a]">
            All Available Tasks ({filteredTasks.length})
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none cursor-pointer shadow-sm"
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Reward</option>
              <option value="lowest">Lowest Reward</option>
            </select>
          </div>
        </div>

        {/* 🎴 Stacked Task Cards List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-gray-500">টাস্ক লোড হচ্ছে...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-12 text-center bg-white rounded-3xl border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <ClipboardDocumentCheckIcon className="w-8 h-8" />
              </div>
              <Typography variant="h6" className="text-[#0b0c2a] font-bold">
                কোনো টাস্ক পাওয়া যায়নি
              </Typography>
              <p className="text-xs text-gray-500 mt-1">
                অন্য ক্যাটাগরি নির্বাচন করুন বা পরবর্তীতে আবার চেক করুন।
              </p>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task._id}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                {/* Left Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  {renderIcon(task)}

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[#0b0c2a] group-hover:text-teal-600 transition-colors">
                        {task.title}
                      </h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          task.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {task.difficulty || "Easy"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-normal line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                        {task.categoryLabel || "Social Media"}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {formatDuration(task.duration)}
                      </span>
                      {user?.role === "admin" && task.count !== undefined && (
                        <span className="text-[10px] text-teal-600 font-semibold">
                          • {task.count} Submits Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Reward & Action */}
                <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <p className="text-lg sm:text-xl font-black text-emerald-600">
                      ৳{(task.price || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Per Task</p>
                  </div>

                  {task.status !== 'inactive' ? (
                    <Link to={`/user/social-works/${task._id}`}>
                      <Button
                        className={`${getBtnGradient(task)} text-white normal-case font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105`}
                      >
                        <span>Start Task</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Inactive</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 🔄 How It Works 4-Step Process Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm mt-12">
          <div className="flex items-center gap-2 mb-8">
            <SparklesIcon className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-[#0b0c2a]">How It Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                  📋
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0d9488] text-white text-xs font-bold flex items-center justify-center shadow-md">
                  1
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">Choose a Task</h4>
              <p className="text-xs text-gray-500 mt-1">Pick a task you like</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                  🚀
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  2
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">Complete It</h4>
              <p className="text-xs text-gray-500 mt-1">Follow the instructions carefully</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                  🛡️
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  3
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">Get Verified</h4>
              <p className="text-xs text-gray-500 mt-1">We verify your completion</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                  🎁
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  4
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">Earn Rewards</h4>
              <p className="text-xs text-gray-500 mt-1">Rewards will be added to your balance</p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default SocialWork;
