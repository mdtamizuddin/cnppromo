import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@material-tailwind/react";
import {
  ArrowRightIcon,
  SparklesIcon,
  LightBulbIcon,
  PlayCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export const category = [
  {
    id: 1,
    name: "All Works",
    path: "all",
    desc: "সকল ক্যাটাগরির কাজের তালিকা",
    icon: "💼",
    badge: "🌟 অল ইন ওয়ান",
    gradient: "from-blue-600 to-indigo-600",
    bg: "from-blue-500/10 to-indigo-500/5",
    color: "#4f46e5",
  },
  {
    id: 2,
    name: "TikTop",
    path: "tiktop",
    desc: "সহজ লাইক ও ফলো করে ইনস্ট্যান্ট আয়",
    icon: "🎵",
    badge: "🔥 সর্বাধিক জনপ্রিয়",
    gradient: "from-pink-600 to-rose-600",
    bg: "from-pink-500/10 to-rose-500/5",
    color: "#ff0050",
  },
  {
    id: 3,
    name: "Youtube",
    path: "youtube",
    desc: "ইউটিউব ভিডিও ভিউস। (Workercash)",
    icon: "▶️",
    badge: "💎 হাই আর্নিং",
    gradient: "from-red-600 to-rose-600",
    bg: "from-red-500/10 to-rose-500/5",
    color: "#ff0000",
  },
  {
    id: 4,
    name: "Facebook",
    path: "facebook",
    desc: "ফেসবুক পোস্ট (অটো জেনারেশন)",
    icon: "📱",
    badge: "🤖 অটো ইনকাম",
    gradient: "from-blue-600 to-sky-600",
    bg: "from-blue-500/10 to-sky-500/5",
    color: "#1877f2",
  },
  {
    id: 5,
    name: "Like follow",
    path: "likefollow",
    desc: "Like follow (Getlike)",
    icon: "👍",
    badge: "⚡ ইনস্ট্যান্ট কাজ",
    gradient: "from-emerald-600 to-teal-600",
    bg: "from-emerald-500/10 to-teal-500/5",
    color: "#10b981",
  },
  {
    id: 6,
    name: "Payup video views",
    path: "Payup-video-views",
    desc: "Payup video views (ভিডিও দেখে আয়)",
    icon: "🎬",
    badge: "💵 ওয়াচ অ্যান্ড আর্ন",
    gradient: "from-purple-600 to-indigo-600",
    bg: "from-purple-500/10 to-indigo-500/5",
    color: "#8b5cf6",
  },
  {
    id: 7,
    name: "Bux money",
    path: "Bux-money",
    desc: "Bux money (বিজ্ঞাপন ক্লিক ও মাইক্রো ব্রাউজিং)",
    icon: "🪙",
    badge: "🎯 মাইক্রো ব্রাউজিং",
    gradient: "from-amber-500 to-yellow-600",
    bg: "from-amber-500/10 to-yellow-500/5",
    color: "#f59e0b",
  },
  {
    id: 8,
    name: "Vk surfing",
    path: "Vk surfing",
    desc: "Vk surfing (ভিকে সোশ্যাল কমিউনিটি টাস্ক)",
    icon: "🌐",
    badge: "👥 সোশ্যাল টাস্ক",
    gradient: "from-sky-600 to-blue-700",
    bg: "from-sky-500/10 to-blue-500/5",
    color: "#0077ff",
  },
  {
    id: 9,
    name: "IP web/Aviso",
    path: "IP web/Aviso",
    desc: "IP web / Aviso (সার্ভে ও ওয়েব অ্যাক্টিভিটি)",
    icon: "💻",
    badge: "⚙️ মাইক্রো টাস্ক",
    gradient: "from-teal-600 to-emerald-700",
    bg: "from-teal-500/10 to-emerald-500/5",
    color: "#059669",
  },
];

const AllWorks = () => {
  return (
    <div className="space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#5a32fa] text-[11px] font-bold tracking-wide mb-1">
            <SparklesIcon className="w-3.5 h-3.5" />
            কাজের ডিরেক্টরি
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b0c2a]">
            প্ল্যাটফর্ম ভিত্তিক কাজের তালিকা
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            যে কোনো ক্যাটাগরিতে ক্লিক করে বিস্তারিত ভিডিও গাইড ও কাজের লিংক দেখুন
          </p>
        </div>

        <Link
          to="/user/tasks"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all border border-teal-200"
        >
          <PlayCircleIcon className="w-4 h-4 text-teal-600" />
          <span>Task Marketplace →</span>
        </Link>
      </div>

      {/* 🎴 9-Card Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {category.map((item) => (
          <Link
            key={item.id}
            to={`/user/works/category/${encodeURIComponent(item.path)}`}
            className="group"
          >
            <Card
              className={`p-6 rounded-3xl border border-gray-100 bg-gradient-to-br ${item.bg} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden`}
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="w-13 h-13 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform p-3 border border-gray-50">
                  {item.icon}
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-white text-gray-800 rounded-full shadow-sm border border-gray-100/80">
                  {item.badge}
                </span>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1.5">
                <h3
                  className="font-black text-base sm:text-lg text-[#0b0c2a] group-hover:text-[#5a32fa] transition-colors leading-tight"
                >
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Action Strip */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#5a32fa]">
                <span className="group-hover:underline">গাইড ও কাজ দেখুন</span>
                <div className="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-[#5a32fa] group-hover:text-white text-[#5a32fa] flex items-center justify-center transition-all">
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* 💡 Advisory Banner / Expert Guidelines */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-[#151954] to-purple-950 text-white shadow-xl border border-indigo-800/40 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base">
          <LightBulbIcon className="w-5 h-5 text-amber-400 shrink-0" />
          <span>বিশেষ কাজের পরামর্শ ও সাফল্য অর্জন নির্দেশিকা:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1.5">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <CheckBadgeIcon className="w-4 h-4 text-amber-400" />
              ১. প্রথম ৩টি সাইট অগ্রাধিকার দিন
            </p>
            <p className="text-gray-300 leading-relaxed">
              TikTok, YouTube (Workercash), এবং Facebook প্ল্যাটফর্মে নিয়মিত কাজ করলে সবচেয়ে দ্রুত ও বেশি আয় করতে পারবেন।
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1.5">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
              ২. দৈনিক ৩০০-৫০০৳ উপার্জনের সুযোগ
            </p>
            <p className="text-gray-300 leading-relaxed">
              ভিডিও নির্দেশিকা অনুসারে মনোযোগ সহকারে কাজ সম্পন্ন করলে সহজেই প্রতিদিন নির্দিষ্ট আয়ের লক্ষ্য পূরণ হবে।
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1.5">
            <p className="font-bold text-sky-300 flex items-center gap-1.5">
              <CheckBadgeIcon className="w-4 h-4 text-sky-400" />
              ৩. মাল্টি-লেভেল রেফারেল গুণক
            </p>
            <p className="text-gray-300 leading-relaxed">
              আপনার টিম তৈরি করে ৬-জেনারেশন রেফারেল কমিশন উপভোগ করুন। টিম মেম্বারদের কাজ থেকেও আপনার ব্যালেন্সে যোগ হবে বোনাস।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllWorks;