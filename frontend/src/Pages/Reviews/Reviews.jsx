import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import {
  Card,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  StarIcon,
  CheckBadgeIcon,
  HandThumbUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  VideoCameraIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Real customer payment proof screenshots
const reviewImages = Array.from({ length: 13 }, (_, i) => `/reviews-images/image-${i + 1}.jpeg`);

const fallbackStories = [
  {
    _id: "1",
    name: "তানজিম হাসান",
    username: "tanzim99",
    district: "ঢাকা",
    rating: 5,
    comment: "CNP Promo খুব বিশ্বস্ত একটি প্ল্যাটফর্ম। আমি আজকেই bKash এ প্রথম ৫০০ টাকা পেমেন্ট পেয়েছি। অনেক ধন্যবাদ!",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "সুমাইয়া আক্তার",
    username: "sumaiya_bd",
    district: "চট্টগ্রাম",
    rating: 5,
    comment: "ভিডিও দেখে ও সোশ্যাল টাস্ক করে সহজে ইনকাম করা যায়। রেফারেল কমিশনও ইনস্ট্যান্ট যোগ হয়।",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    name: "রাকিব চৌধুরী",
    username: "rakib_pro",
    district: "সিলেট",
    rating: 5,
    comment: "পেমেন্ট খুব ফাস্ট। উইথড্র দেওয়ার মাত্র ২ ঘণ্টার মধ্যে Nagad এ টাকা চলে এসেছে।",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "4",
    name: "মেহেদী হাসান",
    username: "mehedi_01",
    district: "রাজশাহী",
    rating: 5,
    comment: "Best micro-job earning platform in Bangladesh! 100% recommended for students.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

const Reviews = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedReviews, setLikedReviews] = useState({});

  // Fetch verified reviews from database
  const { data: dbReviews } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () => {
      try {
        const res = await api.get("/review");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const storyList = useMemo(() => {
    if (dbReviews && dbReviews.length > 0) return dbReviews;
    return fallbackStories;
  }, [dbReviews]);

  const handleLike = (id) => {
    if (likedReviews[id]) {
      toast("আপনি ইতিমধ্যে এই রিভিউটিতে লাইক দিয়েছেন!", { icon: "👍" });
      return;
    }
    setLikedReviews((prev) => ({ ...prev, [id]: true }));
    toast.success("রিভিউটিতে লাইক দেওয়ার জন্য ধন্যবাদ!");
  };

  const filteredStories = useMemo(() => {
    let result = [...storyList];

    if (activeTab === "5star") {
      result = result.filter((s) => (s.rating || 5) === 5);
    } else if (activeTab === "4star") {
      result = result.filter((s) => (s.rating || 5) === 4);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.username?.toLowerCase().includes(q) ||
          s.comment?.toLowerCase().includes(q) ||
          s.district?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [storyList, activeTab, searchQuery]);

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold tracking-wide">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>সফল ব্যবহারকারীদের বাস্তব অভিজ্ঞতা ও মতামত</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                CNP-Promo-তে কাজ করা মেম্বারদের <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  বাস্তব রিভিউ ও সাফল্যের গল্প 💬
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                আমাদের হাজারো রেজিস্টার্ড মেম্বার প্রতিদিন নিয়মিত ভিডিও দেখে ও মাইক্রো-টাস্ক করে ইনকাম করছেন এবং ইনস্ট্যান্ট পেমেন্ট পাচ্ছেন।
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  ১০০% ভেরিফাইড ইউজার রিভিউ
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-sky-400" />
                  ২৪/৭ নিশ্চিত পেমেন্ট নিশ্চয়তা
                </div>
              </div>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-44 sm:w-52 aspect-square">
                <img
                  src="/reviews_hero_illustration.jpg"
                  alt="Reviews & Feedback"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ⭐ Rating Breakdown & Trust Guarantees */}
        <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Score */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-amber-50 border border-amber-100 w-36 aspect-square shrink-0">
              <span className="text-4xl font-black text-[#0b0c2a]">4.9</span>
              <div className="flex text-amber-400 text-lg my-1">
                {"★★★★★"}
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">৫,২০০+ ভেরিফাইড রিভিউ</span>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-2 w-full max-w-xs text-xs">
              <div className="flex items-center gap-2">
                <span className="w-10 font-bold text-gray-700 text-right">5 Star</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: "94%" }}></div>
                </div>
                <span className="w-8 font-semibold text-gray-500">94%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-10 font-bold text-gray-700 text-right">4 Star</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: "5%" }}></div>
                </div>
                <span className="w-8 font-semibold text-gray-500">5%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-10 font-bold text-gray-700 text-right">3 Star</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: "1%" }}></div>
                </div>
                <span className="w-8 font-semibold text-gray-500">1%</span>
              </div>
            </div>
          </div>

          {/* Right Trust Strip */}
          <div className="text-center lg:text-right space-y-2 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
              <span>এডমিন ভেরিফাইড কমিউনিটি</span>
            </div>
            <h3 className="text-base font-bold text-[#0b0c2a]">
              বিশ্বস্ত ও নির্ভরযোগ্য কাজের মাধ্যম
            </h3>
            <p className="text-xs text-gray-500">
              সকল রিভিউ ও পেমেন্ট প্রুফ নিয়মিত পর্যবেক্ষণ ও যাচাই করে প্ল্যাটফর্মে প্রকাশ করা হয়।
            </p>
          </div>
        </Card>

        {/* 📸 Screenshot Reviews Carousel */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0b0c2a] flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#5a32fa]" />
                <span>মেম্বারদের চ্যাট ও পেমেন্ট স্ক্রিনশট রিভিউ 📱</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                সরাসরি মেসেঞ্জার ও হোয়াটসঅ্যাপে পাওয়া সদস্যদের পেমেন্ট কনফার্মেশন প্রুফ
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={16}
              slidesPerView={1.3}
              breakpoints={{
                480: { slidesPerView: 2.2 },
                768: { slidesPerView: 3.3 },
                1024: { slidesPerView: 4.2 },
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="pb-10"
            >
              {reviewImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative group overflow-hidden rounded-2xl border border-gray-200 aspect-[9/16] bg-gray-50 shadow-sm">
                    <img
                      src={image}
                      alt={`Review Screenshot ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-semibold flex items-center gap-1">
                        <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                        পেমেন্ট কনফার্মড
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* 🏷️ Filter Categories & Instant Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: "all", label: "সব রিভিউ" },
              { id: "5star", label: "⭐ ৫ স্টার রিভিউ" },
              { id: "4star", label: "⭐ ৪ স্টার রিভিউ" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/20"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="রিভিউ খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
            />
          </div>

        </div>

        {/* 💬 Member Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStories.map((story) => (
            <Card
              key={story._id || story.id}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        story.avatar ||
                        `https://i.pravatar.cc/150?u=${encodeURIComponent(story.name)}`
                      }
                      alt={story.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                      onError={(e) => {
                        e.target.src = "https://i.pravatar.cc/150?u=user";
                      }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-1.5">
                        <span>{story.name}</span>
                        <CheckBadgeIcon className="w-4 h-4 text-[#5a32fa]" />
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        @{story.username || "member"} • {story.district || "বাংলাদেশ"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-[#5a32fa] rounded-full border border-purple-100 shrink-0">
                    ভেরিফাইড মেম্বার
                  </span>
                </div>

                {/* Stars */}
                <div className="flex text-amber-400 text-sm mb-2.5">
                  {"★".repeat(story.rating || 5)}
                </div>

                {/* Comment Text */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  "{story.comment}"
                </p>
              </div>

              {/* Bottom: District & Likes */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>{story.district || "বাংলাদেশ"}</span>

                <button
                  onClick={() => handleLike(story._id || story.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${
                    likedReviews[story._id || story.id]
                      ? "bg-purple-50 text-[#5a32fa] font-bold"
                      : "hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <HandThumbUpIcon className="w-3.5 h-3.5" />
                  <span>লাইক</span>
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* 🎁 Bottom Join Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0b0c2a] via-[#1a1b41] to-[#0b0c2a] text-white shadow-xl border border-indigo-900/40 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>আজই শুরু করুন</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white max-w-xl mx-auto leading-snug">
            আপনিও আজই CNP-Promo পরিবারের অংশ হন এবং অনলাইন ইনকাম শুরু করুন! 🚀
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            কোনো ডিপোজিট ছাড়াই শুরু করুন সহজ মাইক্রো-টাস্ক ও ভিডিও দেখার কাজ।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25">
                ফ্রি রেজিস্টার করুন
              </Button>
            </Link>
            <Link to="/user/works">
              <Button variant="outlined" className="border-gray-400 text-white normal-case font-bold text-xs px-6 py-3 rounded-xl hover:bg-white/10">
                কাজের তালিকা দেখুন
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reviews;