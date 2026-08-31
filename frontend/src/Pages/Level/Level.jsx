import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Progress,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  SparklesIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  BoltIcon,
  TrophyIcon,
  LightBulbIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Badge from "../Profile/Badge";
import { useQuery } from "react-query";
import { api } from "../../util/axios";

const Level = () => {
  const { user } = useSelector((state) => state.user);
  const [copied, setCopied] = useState(false);

  // Fetch real statistics for accurate refer count
  const { data: stats } = useQuery({
    queryKey: ["level-statistics", user?._id],
    queryFn: async () => {
      const res = await api.get("/refer/statistic");
      return res.data;
    },
    enabled: !!user?._id,
  });

  const currentLevel = user?.level || 1;
  const directRefers = stats?.gen1 || 0;

  // Next level progress calculations
  let nextLevelTarget = 80;
  let progressPercent = Math.min(100, Math.round((directRefers / 80) * 100));

  if (currentLevel === 2) {
    nextLevelTarget = 160;
    progressPercent = Math.min(
      100,
      Math.round(((directRefers - 80) / 80) * 100)
    );
  } else if (currentLevel >= 3) {
    nextLevelTarget = 160;
    progressPercent = 100;
  }

  const handleCopyUsername = () => {
    if (!user?.username) return;
    navigator.clipboard.writeText(user.username);
    setCopied(true);
    toast.success("ইউজার আইডি কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const levelTiers = [
    {
      level: 1,
      title: "লেভেল ১ — ব্রোঞ্জ মেম্বার",
      subtitle: "স্ট্যান্ডার্ড আর্নিং টিয়ার",
      badgeNumber: 1,
      requires: "০ জন রেফার",
      commission: "৳৩০",
      extraBonus: "স্ট্যান্ডার্ড রেট",
      features: [
        "প্রতিটি রেফারে পাবেন ৩০ টাকা কমিশন",
        "ডেইলি মাইক্রো ও ভিডিও টাস্ক অ্যাক্সেস",
        "২৪/৭ সাধারণ ট্রেইনার সাপোর্ট",
        "বিকাশ ও নগদে নিয়মিত উইথড্রয়াল",
      ],
      color: "from-slate-600 to-gray-800",
      accent: "border-gray-200 bg-gray-50/50",
      pill: "bg-gray-100 text-gray-700",
    },
    {
      level: 2,
      title: "লেভেল ২ — সিলভার ভিআইপি",
      subtitle: "প্রো আর্নার্স টিয়ার",
      badgeNumber: 2,
      requires: "৮০ জন সফল রেফার",
      commission: "৳৩৫",
      extraBonus: "+৳৫ এক্সট্রা কমিশন",
      features: [
        "প্রতিটি রেফারে পাবেন ৩৫ টাকা কমিশন (+৳৫)",
        "আনলিমিটেড হাই-পেয়িং কাজের অগ্রাধিকার",
        "ফাস্টার উইথড্রয়াল প্রসেসিং সুবিধা",
        "বিশেষ উইকলি আর্নিং রিওয়ার্ডস",
      ],
      color: "from-blue-600 to-indigo-700",
      accent: "border-blue-200 bg-blue-50/40",
      pill: "bg-blue-100 text-blue-700",
    },
    {
      level: 3,
      title: "লেভেল ৩ — গোল্ড এলিট মাস্টার",
      subtitle: "সর্বোচ্চ ভিআইপি র‍্যাংক",
      badgeNumber: 3,
      requires: "১৬০ জন সফল রেফার",
      commission: "৳৪০",
      extraBonus: "+৳১০ এক্সট্রা কমিশন",
      features: [
        "প্রতিটি রেফারে পাবেন ৪০ টাকা কমিশন (+৳১০)",
        "ডেডিকেটেড পার্সোনাল ট্রেইনার সাপোর্ট",
        "ইনস্ট্যান্ট প্রায়োরিটি উইথড্রয়াল ক্লিয়ারেন্স",
        "এক্সক্লুসিভ বোনাস ও ভিআইপি ব্যাজ",
      ],
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-200 bg-amber-50/40",
      pill: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-amber-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold tracking-wide">
                <TrophyIcon className="w-3.5 h-3.5" />
                <span>VIP Rank & Member Tier System</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                আপনার মেম্বারশিপ লেভেল ও <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  ভিআইপি প্রিভিলেজ 👑
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                আপনার রেফারেল নেটওয়ার্ক বাড়িয়ে লেভেল আপগ্রেড করুন এবং প্রতিটি রেফারে সর্বোচ্চ ৪০ টাকা পর্যন্ত কমিশন ও প্রায়োরিটি পেমেন্ট সুবিধা উপভোগ করুন।
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  স্বয়ংক্রিয় লেভেল আপগ্রেড
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4 text-amber-400" />
                  সর্বোচ্চ ৳৪০/রেফার কমিশন
                </div>
              </div>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square">
                <img
                  src="/level_hero_illustration.jpg"
                  alt="VIP Level and Badges"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🎖️ Current User VIP Status Card */}
        <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left: Badge and Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center p-3 rounded-2xl bg-purple-50/60 border border-purple-100 shadow-inner">
                <Badge number={currentLevel} width={80} height={100} />
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-black shadow-md shadow-teal-500/20">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>বর্তমান লেভেল: Level {currentLevel}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-[#0b0c2a] flex items-center gap-1.5 pt-1">
                  <span>{user?.name || "Member"}</span>
                  <CheckBadgeIcon className="w-4 h-4 text-primary" />
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>ইমেইল: {user?.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    ইউজার আইডি: <strong className="text-gray-800 font-mono">{user?.username}</strong>
                    <button
                      onClick={handleCopyUsername}
                      className="text-gray-400 hover:text-primary ml-0.5"
                      title="কপি করুন"
                    >
                      {copied ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="p-4 rounded-2xl bg-primary-light border border-teal-100 text-center min-w-[120px]">
                <p className="text-[11px] text-gray-500 font-medium">১ম লেভেল রেফারেল</p>
                <p className="text-xl font-black text-primary mt-0.5">{directRefers} জন</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center min-w-[120px]">
                <p className="text-[11px] text-gray-500 font-medium">বর্তমান কমিশন রেট</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  ৳{currentLevel === 3 ? 40 : currentLevel === 2 ? 35 : 30}
                </p>
              </div>
            </div>

          </div>

          {/* Level Progress Bar */}
          {currentLevel < 3 && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5 text-primary">
                  <TrophyIcon className="w-4 h-4" />
                  <span>লেভেল {currentLevel + 1} আনলক করার অগ্রগতি:</span>
                </span>
                <span>
                  {directRefers} / {nextLevelTarget} রেফারেল ({progressPercent}%)
                </span>
              </div>

              <Progress
                value={progressPercent}
                size="sm"
                color="indigo"
                className="bg-gray-200 rounded-full"
              />

              <p className="text-[11px] text-gray-500">
                আর মাত্র{" "}
                <strong className="text-primary">
                  {Math.max(0, nextLevelTarget - directRefers)} জন
                </strong>{" "}
                রেফারেল যুক্ত করলেই স্বয়ংক্রিয়ভাবে লেভেল {currentLevel + 1} এ উন্নীত হবেন!
              </p>
            </div>
          )}
        </Card>

        {/* 🏆 3-Tier VIP Comparison Cards */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#0b0c2a]">
              সকল ভিআইপি লেভেলের বিবরণ ও সুবিধাসমূহ
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              প্রতিটি লেভেলে পৌঁছানোর সাথে সাথে আপনার একাউন্টে নতুন সুবিধা ও বাড়তি কমিশন যুক্ত হবে
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {levelTiers.map((tier) => {
              const isUserCurrentTier = currentLevel === tier.level;
              return (
                <Card
                  key={tier.level}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden ${
                    isUserCurrentTier
                      ? "border-primary ring-2 ring-teal-500/30 shadow-xl bg-white scale-[1.02]"
                      : "border-gray-100 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isUserCurrentTier && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl shadow-sm">
                      ✓ বর্তমান লেভেল
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Badge Icon */}
                    <div className="flex items-center justify-center pt-2">
                      <Badge number={tier.badgeNumber} width={70} height={90} />
                    </div>

                    <div className="text-center space-y-1">
                      <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full ${tier.pill}`}>
                        {tier.requires}
                      </span>
                      <h3 className="text-base font-bold text-[#0b0c2a] pt-1">
                        {tier.title}
                      </h3>
                      <p className="text-xs text-gray-400">{tier.subtitle}</p>
                    </div>

                    {/* Commission Rate Callout */}
                    <div className="p-3 rounded-2xl bg-primary-light border border-teal-100 text-center">
                      <span className="text-[11px] text-gray-500">প্রতি রেফারে কমিশন:</span>
                      <p className="text-2xl font-black text-primary">{tier.commission}</p>
                      <span className="text-[10px] font-bold text-emerald-600">{tier.extraBonus}</span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-gray-100">
                    {isUserCurrentTier ? (
                      <div className="py-2.5 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">
                        ✓ আপনার সক্রিয় লেভেল
                      </div>
                    ) : tier.level > currentLevel ? (
                      <Link to="/user/refer">
                        <Button className="w-full bg-primary hover:bg-primary-hover text-white normal-case text-xs font-bold py-2.5 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5">
                          <span>রেফার করে আনলক করুন</span>
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="py-2.5 text-center text-xs font-bold text-gray-400 bg-gray-100 rounded-xl">
                        সম্পন্ন হয়েছে
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ⚡ 4 VIP Privileges Cards */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a] flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            <span>ভিআইপি মেম্বারদের বিশেষ সুবিধাসমূহ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center text-xl">
                🚀
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">উচ্চতর কমিশন</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                লেভেল বাড়ার সাথে সাথে প্রতি রেফারে বাড়তি ১০ টাকা পর্যন্ত আজীবন কমিশন পান।
              </p>
            </Card>

            <Card className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                ⚡
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">দ্রুত উইথড্রয়াল</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                ভিআইপি মেম্বারদের পেমেন্ট রিকোয়েস্ট সর্বোচ্চ অগ্রাধিকার ভিত্তিতে ক্লিয়ার করা হয়।
              </p>
            </Card>

            <Card className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                🎯
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">এক্সক্লুসিভ টাস্ক</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                উচ্চ মূল্যের বিশেষ মাইক্রো টাস্ক ও স্পেশাল সার্ভে কাজ করার প্রথম সুযোগ।
              </p>
            </Card>

            <Card className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                👑
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0b0c2a]">পার্সোনাল ট্রেইনার</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                টপ লেভেল মেম্বারদের জন্য সার্বক্ষণিক ডেডিকেটেড ট্রেইনার পরামর্শ ও গাইডলাইন।
              </p>
            </Card>
          </div>
        </section>

        {/* 💡 How to Level Up Guide Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-50 via-cyan-50/70 to-sky-50/60 border border-teal-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-lg shadow-teal-500/25 shrink-0">
              💡
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#0b0c2a]">
                আজই আপনার লেভেল আপগ্রেড করতে চান?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
                আপনার রেফারেল লিংক বন্ধুদের ও সোশ্যাল মিডিয়ায় শেয়ার করুন। আপনার রেফারেল সংখ্যা বৃদ্ধি পেলেই সিস্টেম স্বয়ংক্রিয়ভাবে আপনার লেভেল আপগ্রেড করে দেবে।
              </p>
            </div>
          </div>

          <Link to="/user/refer" className="w-full md:w-auto shrink-0">
            <Button className="w-full md:w-auto bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
              <span>রেফারেল শুরু করুন</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Level;
