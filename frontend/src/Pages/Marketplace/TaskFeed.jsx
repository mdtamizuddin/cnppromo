import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { Card, Button } from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, ClockIcon, ArrowRightIcon, BanknotesIcon,
  SparklesIcon, ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

const PLATFORM_LABELS = {
  youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook", instagram: "Instagram",
  twitter: "X / Twitter", telegram: "Telegram", whatsapp: "WhatsApp", linkedin: "LinkedIn",
  website: "Website", app: "App", other: "Other",
};

const TaskFeed = () => {
  const { user } = useSelector((state) => state.user);
  const [taskType, setTaskType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { data: types } = useQuery({
    queryKey: ["task-types"],
    queryFn: async () => (await api.get("tasks/meta/types")).data,
    staleTime: 60 * 60 * 1000,
  });

  const { data: feed, isLoading } = useQuery({
    queryKey: ["task-feed", taskType, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (taskType !== "all") params.set("taskType", taskType);
      if (search.trim()) params.set("search", search.trim());
      return (await api.get(`tasks/feed?${params.toString()}`)).data;
    },
    staleTime: 15000,
  });

  const tasks = useMemo(() => {
    const list = feed?.data || [];
    const sorted = [...list];
    if (sortBy === "highest") sorted.sort((a, b) => (b.reward || 0) - (a.reward || 0));
    else if (sortBy === "lowest") sorted.sort((a, b) => (a.reward || 0) - (b.reward || 0));
    else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted;
  }, [feed, sortBy]);

  const typeTabs = [{ key: "all", label: "All Tasks" }, ...Object.entries(types || {}).map(([key, def]) => ({ key, label: def.label }))];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#d2fbf0] via-[#e2fbf6] to-[#d6f7ff] p-6 sm:p-8 border border-teal-100/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-xs font-bold tracking-wide">
                <span>Complete Tasks & Earn</span>
                <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0b0c2a] leading-tight tracking-tight">
                Task <span className="bg-gradient-to-r from-[#0d9488] to-[#0284c7] bg-clip-text text-transparent">Marketplace</span>
              </h1>
              <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-teal-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BanknotesIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Your Balance</p>
                  <p className="text-lg font-extrabold text-[#0b0c2a]">৳ {(user?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTaskType(tab.key)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  taskType === tab.key ? "bg-[#0d9488] text-white shadow-md shadow-teal-500/20 scale-105" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a]">Available Tasks ({tasks.length})</h2>
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

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">টাস্ক লোড হচ্ছে...</p>
            </div>
          ) : tasks.length === 0 ? (
            <Card className="p-12 text-center bg-white rounded-3xl border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <ClipboardDocumentCheckIcon className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-[#0b0c2a]">কোনো টাস্ক পাওয়া যায়নি</p>
              <p className="text-xs text-gray-500 mt-1">অন্য ক্যাটাগরি নির্বাচন করুন বা পরে আবার চেক করুন।</p>
            </Card>
          ) : (
            tasks.map((task) => {
              const typeLabel = types?.[task.taskType]?.label || task.taskType;
              const minDuration = task.typeConfig?.minDurationSeconds;
              return (
                <Card key={task._id} className="p-5 sm:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-600 flex items-center justify-center text-xl font-bold shrink-0">
                      {(PLATFORM_LABELS[task.platform] || task.platform || "?").charAt(0)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[#0b0c2a]">{task.title}</h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">{typeLabel}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                          {PLATFORM_LABELS[task.platform] || task.platform}
                        </span>
                        {minDuration ? (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" /> {minDuration}s min
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-lg sm:text-xl font-black text-emerald-600">৳{(task.reward || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Per Task</p>
                    </div>
                    <Link to={`/user/tasks/${task._id}`}>
                      <Button className="bg-gradient-to-r from-[#0d9488] to-[#0284c7] text-white normal-case font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:scale-105 transition-all">
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
    </div>
  );
};

export default TaskFeed;
