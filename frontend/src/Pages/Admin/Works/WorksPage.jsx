import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { category } from "./AllWorks";
import WorkCard from "./WorkCard";
import { useQuery } from "react-query";
import Loader from "../../../Components/Loader";
import { api } from "../../../util/axios";
import { Button, Card } from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  SparklesIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const WorksPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = category.find(
    (data) => data?.path?.toLowerCase() === id?.toLowerCase()
  ) || {
    name: id === "all" ? "সকল কাজ (All Works)" : id,
    desc: "কাজের টিউটোরিয়াল, ভিডিও ও নির্দেশিকা",
    icon: "💼",
    badge: "কাজের ক্যাটাগরি",
    gradient: "from-blue-600 to-indigo-600",
    bg: "from-blue-500/10 to-indigo-500/5",
    color: "#4f46e5",
  };

  const { data, isLoading, refetch } = useQuery({
    queryFn: async () => {
      const res = await api.get(`/work?category=${encodeURIComponent(id || "all")}`);
      return res.data;
    },
    queryKey: ["All Works", id],
  });

  const dbWorks = data?.works || [];

  const filteredWorks = useMemo(() => {
    if (!searchQuery.trim()) return dbWorks;
    const q = searchQuery.toLowerCase();
    return dbWorks.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.desc?.toLowerCase().includes(q) ||
        w.category?.toLowerCase().includes(q)
    );
  }, [dbWorks, searchQuery]);

  if (isLoading) {
    return <Loader />;
  }

  // Find next category
  const currentIndex = category.findIndex((c) => c.path === id);
  const nextCategory = category[(currentIndex + 1) % category.length];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🧭 Top Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link to="/user/home" className="text-gray-400 hover:text-[#5a32fa] font-medium">
              হোম
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/user/works" className="text-gray-400 hover:text-[#5a32fa] font-medium">
              কাজের ক্যাটাগরি
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#5a32fa] font-bold">{currentCategory.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/user/works">
              <Button
                variant="outlined"
                size="sm"
                className="rounded-xl border-gray-200 bg-white text-gray-800 normal-case text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-gray-50"
              >
                <ArrowLeftIcon className="w-4 h-4 text-[#5a32fa]" />
                <span>সব ক্যাটাগরি দেখুন</span>
              </Button>
            </Link>

            <Link to="/user/tasks">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#5a32fa] to-[#7c3aed] hover:from-[#4b26e0] hover:to-[#6d28d9] normal-case text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-md shadow-indigo-500/25 text-white"
              >
                <PlayCircleIcon className="w-4 h-4 text-white" />
                <span>Task Marketplace</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 🏷️ Horizontal Category Quick-Switch Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {category.map((cat) => {
            const isSelected = (cat.path || "").toLowerCase() === (id || "").toLowerCase();
            return (
              <Link
                key={cat.id}
                to={`/user/works/category/${encodeURIComponent(cat.path)}`}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/25 scale-105"
                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>

        {/* 🌟 Category Title Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-sm border border-white/10">
                <span className="text-base">{currentCategory.icon}</span>
                <span>{currentCategory.badge || "Verified Platform"}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {currentCategory.name}
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                {currentCategory.desc} — নিচের ভিডিও টিউটোরিয়ালগুলো দেখে নিয়ম মেনে কাজ সম্পন্ন করুন এবং সরাসরি টাকা উপার্জন করুন।
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="px-3 py-1 rounded-xl bg-white/10 text-[11px] font-semibold text-gray-200 border border-white/10 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  মোট কাজ: {dbWorks.length} টি
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 text-[11px] font-semibold text-gray-200 border border-white/10 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-sky-400" />
                  ১০০% ভেরিফাইড মেথড
                </span>
              </div>
            </div>

            {/* Right Big Icon Card */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-32 sm:w-40 aspect-square rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-6xl shadow-2xl">
                {currentCategory.icon}
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Search Input & Count Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="এই ক্যাটাগরির কাজ খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa] shadow-sm"
            />
          </div>

          <div className="text-xs font-semibold text-gray-500">
            উপলব্ধ কাজ: <span className="text-[#5a32fa] font-bold">{filteredWorks.length}</span> টি
          </div>
        </div>

        {/* 🎴 Category Works List or Empty State */}
        {filteredWorks.length === 0 ? (
          <Card className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-[#5a32fa] flex items-center justify-center mx-auto text-3xl shadow-inner">
              <VideoCameraIcon className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#0b0c2a]">
                এই ক্যাটাগরিতে এখনো কোনো কাজ যোগ করা হয়নি
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                {searchQuery ? "আপনার সার্চের সাথে মিলে এমন কোনো কাজ পাওয়া যায়নি।" : "অ্যাডমিন কর্তৃক খুব শীঘ্রই নতুন কাজের ভিডিও ও গাইডলাইন যুক্ত করা হবে। অনুগ্রহ করে অন্য ক্যাটাগরিগুলো ঘুরে দেখুন।"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/user/works">
                <Button className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20">
                  অন্যান্য ক্যাটাগরি দেখুন
                </Button>
              </Link>
              <Link to="/user/tasks">
                <Button variant="outlined" className="border-gray-200 text-gray-700 normal-case text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50">
                  টাস্ক মার্কেটপ্লেস দেখুন
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="works">
            {filteredWorks.map((item, i) => (
              <WorkCard refetch={refetch} key={item._id || i} data={item} />
            ))}
          </div>
        )}

        {/* 💡 Platform Guidelines */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50/40 border border-amber-200/60 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <LightBulbIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{currentCategory.name} প্ল্যাটফর্ম সংক্রান্ত বিশেষ নিয়ম ও সতর্কতা:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
            <div className="p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 flex items-start gap-2">
              <span className="text-amber-500 font-black">১.</span>
              <span>প্রতিটি ভিডিও টিউটোরিয়াল সম্পূর্ণ মনোযোগ দিয়ে দেখে তারপর কাজ শুরু করুন।</span>
            </div>
            <div className="p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 flex items-start gap-2">
              <span className="text-amber-500 font-black">২.</span>
              <span>ভুল বা অসম্পূর্ণ তথ্য সাবমিট করলে টাস্ক রিজেক্ট হতে পারে, সঠিক প্রুফ প্রদান করুন।</span>
            </div>
            <div className="p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 flex items-start gap-2">
              <span className="text-amber-500 font-black">৩.</span>
              <span>যেকোনো সমস্যায় আমাদের সাপোর্ট পেইজে যোগাযোগ করে সাথে সাথে সমাধান নিন।</span>
            </div>
          </div>
        </div>

        {/* ⏭️ Next Category Navigation Strip */}
        {nextCategory && (
          <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nextCategory.icon}</span>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">পরবর্তী ক্যাটাগরি</p>
                <p className="text-sm font-bold text-[#0b0c2a]">{nextCategory.name}</p>
              </div>
            </div>

              <Link to={`/user/works/category/${encodeURIComponent(nextCategory.path)}`}>
              <Button
                size="sm"
                className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                <span>পরবর্তী ক্যাটাগরি</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorksPage;