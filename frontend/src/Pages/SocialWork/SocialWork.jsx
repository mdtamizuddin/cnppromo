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
  FunnelIcon,
  ClockIcon,
  ArrowRightIcon,
  BanknotesIcon,
  SparklesIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  InboxIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import { api } from "../../util/axios";
import CreateTaskModal from "./components/CreateTaskModal";
import MyTasksTab from "./components/MyTasksTab";

const platformPills = [
  { id: "all", label: "All Tasks", icon: "🌐" },
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
  const [mainTab, setMainTab] = useState("browse"); // "browse" | "my-tasks" | "submissions"
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filters for browse
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter for worker submissions tab
  const [submitStatusFilter, setSubmitStatusFilter] = useState("all");

  // 1. Fetch Marketplace Available Tasks
  const { data: dbWorks, isLoading: worksLoading } = useQuery({
    queryKey: ["social-works"],
    queryFn: async () => {
      const res = await api.get("social-works/all");
      return res.data;
    },
    staleTime: 15000,
  });

  // 2. Fetch User's Own Submissions (as Worker)
  const { data: mySubmissions, isLoading: submitsLoading } = useQuery({
    queryKey: ["user-social-submits", user?._id],
    queryFn: async () => {
      const res = await api.get(`social-works/submit/${user._id}`);
      return res.data;
    },
    enabled: !!user?._id && mainTab === "submissions",
  });

  // Filter & Sort for Browse Tasks
  const filteredTasks = useMemo(() => {
    let result = Array.isArray(dbWorks) ? [...dbWorks] : [];

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

  // Filter for Submissions tab
  const filteredSubmissions = useMemo(() => {
    if (!Array.isArray(mySubmissions)) return [];
    if (submitStatusFilter === "all") return mySubmissions;
    return mySubmissions.filter((s) => {
      const st = (s.status || "").toLowerCase();
      if (submitStatusFilter === "pending") return st === "pending";
      if (submitStatusFilter === "approved") return st === "approved" || st === "completed";
      if (submitStatusFilter === "rejected") return st === "rejected";
      return true;
    });
  }, [mySubmissions, submitStatusFilter]);

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
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#d2fbf0] via-[#e2fbf6] to-[#d6f7ff] p-6 sm:p-8 lg:p-10 border border-teal-100/80 shadow-sm">
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-xs font-bold tracking-wide">
                <span>Microtask Marketplace</span>
                <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b0c2a] leading-tight tracking-tight">
                  Small Tasks{" "}
                  <span className="bg-gradient-to-r from-[#0d9488] to-[#0284c7] bg-clip-text text-transparent">
                    Real Earnings
                  </span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-lg font-medium">
                  Complete social media tasks to earn BDT, or post tasks to grow your own channels with real people.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                {/* Balance Display */}
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

                {/* Post Task CTA */}
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                >
                  <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>Post a Task</span>
                </Button>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square">
                <img
                  src="/works_hero_illustration.jpg"
                  alt="Tasks & Rewards"
                  className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 rounded-3xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🎛️ Primary Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setMainTab("browse")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              mainTab === "browse"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50"
            }`}
          >
            <span>🛒 Browse Tasks</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              mainTab === "browse" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {Array.isArray(dbWorks) ? dbWorks.length : 0}
            </span>
          </button>

          <button
            onClick={() => setMainTab("my-tasks")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              mainTab === "my-tasks"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50"
            }`}
          >
            <span>📋 My Created Tasks</span>
          </button>

          <button
            onClick={() => setMainTab("submissions")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              mainTab === "submissions"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50"
            }`}
          >
            <span>📜 My Submissions</span>
          </button>
        </div>

        {/* ── TAB 1: BROWSE TASKS (WORKER MARKETPLACE) ── */}
        {mainTab === "browse" && (
          <div className="space-y-6">
            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, platform, or action..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200/80 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-200/80 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-xs"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Reward</option>
                  <option value="lowest">Lowest Reward</option>
                </select>
              </div>
            </div>

            {/* Platform Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {platformPills.map((pill) => {
                const isSelected = selectedPlatform === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedPlatform(pill.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50"
                    }`}
                  >
                    <span>{pill.icon}</span>
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Task Card Grid */}
            <div className="space-y-4">
              {worksLoading ? (
                <div className="py-20 text-center text-xs text-gray-400 font-medium">
                  Loading tasks…
                </div>
              ) : filteredTasks.length === 0 ? (
                <Card className="p-12 text-center rounded-3xl border border-gray-100 shadow-sm bg-white">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                    🔍
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">No active tasks found</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Check back soon or post your own task to get workers for your social media channels.
                  </p>
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
                      className="p-5 rounded-3xl border border-gray-200/80 bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                    >
                      {/* Left: Platform Icon & Details */}
                      <div className="flex items-start gap-4 flex-1">
                        {renderPlatformIcon(task.platform)}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                              {task.title}
                            </h3>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full capitalize">
                              {task.actionType?.replace("_", " ")}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Progress bar */}
                          <div className="max-w-xs space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                              <span>Capacity: <strong>{completed}</strong> / {total} done</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} size="sm" color="teal" />
                          </div>
                        </div>
                      </div>

                      {/* Right: Net Earnings & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-xl font-black text-emerald-600">
                            ৳{reward.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">You Earn</p>
                        </div>

                        <Link to={`/user/social-works/${task._id}`}>
                          <Button
                            className="bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
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
          </div>
        )}

        {/* ── TAB 2: MY CREATED TASKS (PROVIDER VIEW) ── */}
        {mainTab === "my-tasks" && (
          <MyTasksTab onOpenCreateModal={() => setCreateModalOpen(true)} />
        )}

        {/* ── TAB 3: MY SUBMISSIONS (WORKER HISTORY) ── */}
        {mainTab === "submissions" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Your Submitted Tasks</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track the review and approval status of all tasks you submitted
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {["all", "pending", "approved", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSubmitStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      submitStatusFilter === st
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {submitsLoading ? (
              <div className="py-20 text-center text-xs text-gray-400 font-medium">
                Loading your submissions…
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border border-gray-100 shadow-sm bg-white">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                  📜
                </div>
                <h4 className="text-sm font-bold text-gray-800">No submissions found</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Complete tasks from the Browse tab and your submission progress will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((sub) => {
                  const isApproved = ["APPROVED", "completed"].includes(sub.status);
                  const isRejected = ["REJECTED", "rejected"].includes(sub.status);
                  const isPending = ["PENDING", "pending"].includes(sub.status);

                  return (
                    <Card
                      key={sub._id}
                      className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-teal-200 transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            {sub.workId?.title || "Social Task"}
                          </h4>
                          <p className="text-[11px] text-gray-400">
                            Submitted {moment(sub.createdAt).fromNow()} · ID: {sub._id.slice(-6).toUpperCase()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-emerald-600">
                            ৳{(sub.netAmount || sub.workId?.reward || sub.workId?.price || 0).toFixed(2)}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-700"
                                : isRejected
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {isApproved ? "Approved & Credited" : isRejected ? "Rejected" : "Under Review"}
                          </span>
                        </div>
                      </div>

                      {/* Rejection Message if Rejected */}
                      {isRejected && sub.rejectionReason && (
                        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                          <strong>Rejection Reason:</strong> {sub.rejectionReason}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 🔄 How It Works 4-Step Process Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm mt-12">
          <div className="flex items-center gap-2 mb-8">
            <SparklesIcon className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-[#0b0c2a]">How Social Tasks Work</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
                🎯
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">1. Pick or Post</h4>
              <p className="text-xs text-gray-500 mt-1">Select a task to earn, or post one to grow your channel.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
                ⚡
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">2. Complete & Verify</h4>
              <p className="text-xs text-gray-500 mt-1">Perform the action (subscribe, watch, like) and take a screenshot.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
                🛡️
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">3. Escrow Protected</h4>
              <p className="text-xs text-gray-500 mt-1">Task funds are safely held in escrow before tasks go live.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
                💰
              </div>
              <h4 className="text-sm font-bold text-[#0b0c2a]">4. Instant Payout</h4>
              <p className="text-xs text-gray-500 mt-1">Once approved by the task owner, net earnings credit directly to your balance.</p>
            </div>
          </div>
        </section>

      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};

export default SocialWork;
