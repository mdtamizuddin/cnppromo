import React from "react";
import { useParams, Link } from "react-router-dom";
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
} from "@heroicons/react/24/outline";

const WorksPage = () => {
  const { id } = useParams();
  const currentCategory = category.find((data) => data?.path === id) || {
    name: id === "all" ? "সকল কাজ" : id,
    desc: "কাজের টিউটোরিয়াল ও নির্দেশিকা",
    icon: "💼",
    badge: "কাজের ক্যাটাগরি",
  };

  const { data, isLoading, refetch } = useQuery({
    queryFn: async () => {
      const res = await api.get(`/work?category=${id || "all"}`);
      return res.data;
    },
    queryKey: ["All Works", id],
  });

  if (isLoading) {
    return <Loader />;
  }

  const worksList = data?.works || [];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Top Navigation & Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to="/works">
            <Button
              variant="outlined"
              size="sm"
              className="rounded-xl border-gray-200 bg-white text-gray-800 normal-case text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-4 h-4 text-[#5a32fa]" />
              <span>ব্যাক টু ক্যাটাগরি</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">মোট কাজ:</span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-[#5a32fa] font-extrabold text-xs">
              {worksList.length} টি
            </span>
          </div>
        </div>

        {/* 🌟 Category Title Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] text-white shadow-xl border border-indigo-900/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold">
              <span>{currentCategory.icon}</span>
              <span>{currentCategory.badge || "Category"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentCategory.name}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
              {currentCategory.desc}
            </p>
          </div>
        </div>

        {/* 🎴 Works Grid */}
        {worksList.length === 0 ? (
          <Card className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#5a32fa] flex items-center justify-center mx-auto text-2xl">
              <VideoCameraIcon className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              এই ক্যাটাগরিতে এখনো কোনো কাজ যোগ করা হয়নি
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              খুব শীঘ্রই নতুন কাজের ভিডিও ও গাইডলাইন যুক্ত করা হবে। অনুগ্রহ করে অন্য ক্যাটাগরিগুলো ঘুরে দেখুন।
            </p>
            <Link to="/works">
              <Button className="mt-4 bg-[#5a32fa] normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md">
                অন্যান্য ক্যাটাগরি দেখুন
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="works">
            {worksList.map((item, i) => (
              <WorkCard refetch={refetch} key={item._id || i} data={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default WorksPage;