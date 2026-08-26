import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  ShareIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  UserGroupIcon,
  BanknotesIcon,
  PhoneIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  CheckIcon,
  LightBulbIcon,
  GiftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import ReferHistory from "./ReferHistory";
import whatsappIcon from "../Training/wp.png";

const Refer = () => {
  const { user, settings } = useSelector((state) => state.user);
  const [refLink, setRefLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setRefLink(`${window.location.origin}/register?ref=${user.username}`);
    }
  }, [user]);

  // Fetch real statistics from backend
  const { data: stats } = useQuery({
    queryKey: ["refer-statistic", user?._id],
    queryFn: async () => {
      const res = await api.get("/refer/statistic");
      return res.data;
    },
    enabled: !!user?._id,
  });

  const handleCopy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("রেফারেল লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    `CNP-Promo তে জয়েন করুন এবং প্রতিদিন সহজ ভিডিও দেখে ও টাস্ক করে নিশ্চিত ইনকাম করুন! আমার রেফারেল লিংক: ${refLink}`
  );

  const totalMembers =
    (stats?.gen1 || 0) +
    (stats?.gen2 || 0) +
    (stats?.gen3 || 0) +
    (stats?.gen4 || 0) +
    (stats?.gen5 || 0) +
    (stats?.gen6 || 0);

  const generations = [
    {
      gen: "১ম লেভেল (Direct)",
      rate: settings?.ref_comm?.gen1 || 0,
      count: stats?.gen1 || 0,
      color: "from-purple-500 to-indigo-600",
      badge: "bg-purple-50 text-[#5a32fa] border-purple-100",
    },
    {
      gen: "২য় লেভেল",
      rate: settings?.ref_comm?.gen2 || 0,
      count: stats?.gen2 || 0,
      color: "from-blue-500 to-cyan-600",
      badge: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      gen: "৩য় লেভেল",
      rate: settings?.ref_comm?.gen3 || 0,
      count: stats?.gen3 || 0,
      color: "from-emerald-500 to-teal-600",
      badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      gen: "৪র্থ লেভেল",
      rate: settings?.ref_comm?.gen4 || 0,
      count: stats?.gen4 || 0,
      color: "from-amber-500 to-orange-600",
      badge: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      gen: "৫ম লেভেল",
      rate: settings?.ref_comm?.gen5 || 0,
      count: stats?.gen5 || 0,
      color: "from-rose-500 to-pink-600",
      badge: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      gen: "৬ষ্ঠ লেভেল",
      rate: settings?.ref_comm?.gen6 || 0,
      count: stats?.gen6 || 0,
      color: "from-indigo-500 to-purple-700",
      badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold tracking-wide">
                <GiftIcon className="w-3.5 h-3.5" />
                <span>৬-লেভেল রেফারেল ও এফিলিয়েট প্রোগ্রাম</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                বন্ধুদের ইনভাইট করুন এবং <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  ৬ লেভেল পর্যন্ত প্যাসিভ ইনকাম করুন 🎁
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                আপনার রেফারেল লিংক শেয়ার করে বন্ধুদের যুক্ত করুন। তারা একাউন্ট খুললেই এবং কাজ সম্পন্ন করলেই আপনার একাউন্টে ইনস্ট্যান্ট কমিশন যুক্ত হবে।
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  ইনস্ট্যান্ট বোনাস ক্রেডিট
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <UserGroupIcon className="w-4 h-4 text-sky-400" />
                  ৬ জেনারেশন কমিশন নেটওয়ার্ক
                </div>
              </div>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square">
                <img
                  src="/refer_hero_illustration.jpg"
                  alt="Referral Program"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🔗 Referral Link & Social Sharing Box */}
        <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a] flex items-center gap-2">
                <ShareIcon className="w-5 h-5 text-[#5a32fa]" />
                <span>আপনার ইউনিক রেফারেল লিংক</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                নিচের লিংকটি কপি করে বন্ধুদের বা সোশ্যাল মিডিয়ায় শেয়ার করুন
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">আপনার রেফারেল কোড:</span>
              <span className="px-3 py-1 bg-purple-50 text-[#5a32fa] font-black text-xs rounded-xl border border-purple-100">
                {user?.username || "N/A"}
              </span>
            </div>
          </div>

          {/* Link Box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div className="w-full sm:flex-1 px-3 py-2 text-xs font-mono text-gray-700 truncate select-all">
              {refLink || "Loading referral link..."}
            </div>

            <Button
              onClick={handleCopy}
              className="w-full sm:w-auto bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-emerald-300" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>কপি করুন</span>
                </>
              )}
            </Button>
          </div>

          {/* Social Quick Share Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700">সরাসরি শেয়ার করুন:</span>

            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#20bd5a] normal-case text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-sm"
                >
                  <img src={whatsappIcon} alt="WhatsApp" className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </Button>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#229ED9] hover:bg-[#1d8fc4] normal-case text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-sm"
                >
                  <span>✈️ Telegram</span>
                </Button>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#1877F2] hover:bg-[#1464c9] normal-case text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-sm"
                >
                  <span>📱 Facebook</span>
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* 📊 4 Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5a32fa] flex items-center justify-center text-xl mb-2">
              👥
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">মোট রেফারেল টিম</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">{totalMembers} জন</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">৬ জেনারেশন জুড়ে</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-2">
              ⭐
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">১ম লেভেল (Direct)</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">{stats?.gen1 || 0} জন</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">সরাসরি আপনার রেফারেল</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-2">
              🪙
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">১ম লেভেল রেট</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">৳{settings?.ref_comm?.gen1 || 0}</p>
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">প্রতিটি রেফারেলে</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-2">
              🎁
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">কমিশন জেনারেশন</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">৬ লেভেল</p>
            </div>
            <p className="text-[10px] text-blue-600 font-semibold mt-1">লাইফটাইম আর্নিং</p>
          </Card>
        </div>

        {/* 👤 Referrer / Upline Info Card */}
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#5a32fa] flex items-center justify-center text-2xl font-bold shrink-0">
              👤
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                আপনার আপলাইন স্পন্সর (Referrer)
              </span>
              <h3 className="text-base font-bold text-[#0b0c2a] flex items-center gap-2">
                <span>{user?.reffer?.name || "সরাসরি রেজিস্টার্ড (No Upline)"}</span>
                {user?.reffer && <CheckBadgeIcon className="w-4 h-4 text-[#5a32fa]" />}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.reffer?.phone ? `মোবাইল: ${user?.reffer?.phone}` : "কোনো স্পন্সর লিংক ছাড়া একাউন্ট খোলা হয়েছে"}
              </p>
            </div>
          </div>

          {user?.reffer?.phone && (
            <a
              href={`https://wa.me/${user?.reffer?.phone}`}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto"
            >
              <Button
                size="sm"
                className="w-full md:w-auto bg-[#25D366] hover:bg-[#20bd5a] normal-case text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
                <span>আপলাইনের সাথে WhatsApp-এ যোগাযোগ করুন</span>
              </Button>
            </a>
          )}
        </Card>

        {/* 👑 6-Generation Commission Breakdown Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a] flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-[#5a32fa]" />
              <span>৬-জেনারেশন কমিশন তালিকা ও বর্তমান টিম</span>
            </h2>
            <Link to="/refer-info" className="text-xs font-semibold text-[#5a32fa] hover:underline flex items-center gap-1">
              <span>বিস্তারিত পরিসংখ্যান</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {generations.map((item, idx) => (
              <Card
                key={idx}
                className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${item.badge}`}>
                    {item.gen}
                  </span>
                  <span className="text-xs font-black text-[#0b0c2a]">
                    ৳{item.rate} <span className="text-[10px] text-gray-400 font-normal">/ জন</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">যুক্ত মেম্বার:</span>
                  <span className="font-black text-[#0b0c2a] text-sm">{item.count} জন</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 📜 Referral History Table */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a] flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-[#5a32fa]" />
            <span>রেফারেল হিস্ট্রি ও সাম্প্রতিক জয়েনিং</span>
          </h2>

          <ReferHistory />
        </section>

        {/* 💡 "কিভাবে রেফার করবেন?" (3-Step Guide) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50/60 border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#5a32fa] font-bold text-sm">
            <LightBulbIcon className="w-5 h-5" />
            <span>রেফারেল করে সফল হওয়ার সহজ ৩ ধাপ:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-sm space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#5a32fa] text-white flex items-center justify-center font-bold text-[11px]">১</span>
              <p className="font-bold text-gray-900 pt-1">লিংক শেয়ার করুন</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                আপনার রেফারেল লিংকটি কপি করে বন্ধুদের মেসেঞ্জার, হোয়াটসঅ্যাপ বা ফেসবুকে পাঠিয়ে দিন।
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-sm space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#5a32fa] text-white flex items-center justify-center font-bold text-[11px]">২</span>
              <p className="font-bold text-gray-900 pt-1">রেজিস্ট্রেশন সম্পন্ন</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                বন্ধু আপনার লিংকে ক্লিক করে একাউন্ট খুলে কাজ শুরু করলেই সিস্টেম স্বয়ংক্রিয়ভাবে ট্র্যাক করবে।
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-sm space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#5a32fa] text-white flex items-center justify-center font-bold text-[11px]">৩</span>
              <p className="font-bold text-gray-900 pt-1">লাইফটাইম কমিশন লাভ</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                আপনার রেফারেল মেম্বার কাজ করলে প্রতিবার আপনি ৬ লেভেল পর্যন্ত কমিশন ব্যালেন্সে পাবেন।
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Refer;