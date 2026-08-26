import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Avatar,
  Rating,
} from "@material-tailwind/react";
import {
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import {
  StarIcon,
  SparklesIcon,
  CheckBadgeIcon,
  HandThumbUpIcon,
  ChatBubbleBottomCenterTextIcon,
  CameraIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Image } from "antd";
import toast from "react-hot-toast";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Real screenshots array
const reviewImages = Array.from({ length: 13 }, (_, i) => `/reviews-images/image-${i + 1}.jpeg`);

const memberStories = [
  {
    id: 1,
    name: "তানভীর হাসান",
    role: "বিশ্ববিদ্যালয় শিক্ষার্থী",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    tag: "💰 ৳৫,৪০০+ উইথড্রয়াল",
    category: "top-earners",
    date: "২ দিন আগে",
    comment: "পড়াশোনার পাশাপাশি হাতখরচের জন্য CNP-Promo আমার জীবনের সেরা প্ল্যাটফর্ম। ইউটিউব ও ফেসবুকের সহজ টাস্কগুলো করে আমি প্রতি সপ্তাহেই বিকাশ ও নগদে পেমেন্ট পাচ্ছি। ট্রেইনারদের সাহায্য ছিল অসাধারণ!",
    likes: 34,
  },
  {
    id: 2,
    name: "নুসরাত জাহান",
    role: "গৃহিণী ও অনলাইন ফ্রিল্যান্সার",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    tag: "💎 ৳৮,৭৫০+ উইথড্রয়াল",
    category: "top-earners",
    date: "৩ দিন আগে",
    comment: "ঘরে বসে অবসর সময়ে ইনকাম করার এমন বিশ্বস্ত প্ল্যাটফর্ম বাংলাদেশে খুবই বিরল। তাদের রেফারেল সিস্টেম থেকেও প্রতিদিন চমৎকার কমিশন যোগ হয়। পেমেন্ট সবসময় সময়মতো ক্লিয়ার হয়।",
    likes: 58,
  },
  {
    id: 3,
    name: "রাকিবুল ইসলাম",
    role: "নতুন মেম্বার",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    tag: "⚡ ৳১,২০০+ উইথড্রয়াল",
    category: "beginners",
    date: "৪ দিন আগে",
    comment: "প্রথমে বিশ্বাস করতে একটু দ্বিধা হচ্ছিল, কিন্তু প্রথম ৩ দিন কাজ করেই ৩০০ টাকা উইথড্র দিয়ে ১৫ মিনিটে বিকাশে পেয়ে যাই! এখন প্রতিদিন নিয়মিত কাজ করি। ১০০% বিশ্বস্ত।",
    likes: 27,
  },
  {
    id: 4,
    name: "মাহমুদা আক্তার",
    role: "কলেজ শিক্ষার্থী",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    tag: "📱 ডেইলি ওয়ার্কার",
    category: "stories",
    date: "৫ দিন আগে",
    comment: "ভিডিও দেখে আয় করা এত সহজ হবে ভাবিনি। কাজগুলোতে কোনো জটিলতা নেই, একদম পরিষ্কার গাইডলাইন দেওয়া থাকে। যারা সৎভাবে ইনকাম করতে চান তাদের জন্য আদর্শ সাইট।",
    likes: 19,
  },
  {
    id: 5,
    name: "শাকিল আহমেদ",
    role: "চাকরিপ্রার্থী",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    tag: "💵 ৳৩,৬০০+ উইথড্রয়াল",
    category: "top-earners",
    date: "১ সপ্তাহ আগে",
    comment: "তাদের কাস্টমার সাপোর্ট এবং ট্রেইনারদের রেসপন্স খুবই দ্রুত। কোনো কাজের নিয়ম না বুঝলে সাথে সাথে বুঝিয়ে দেয়। CNP-Promo কে অসংখ্য ধন্যবাদ!",
    likes: 42,
  },
  {
    id: 6,
    name: "সাদিয়া সুলতানা",
    role: "নতুন সদস্য",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    tag: "🌟 স্টার মেম্বার",
    category: "beginners",
    date: "১ সপ্তাহ আগে",
    comment: "রেফার প্রোগ্রামটা সবচেয়ে আকর্ষণীয়! বন্ধুদের ইনভাইট করে তারা কাজ করলেই আমার একাউন্টে বোনাস আসছে। সত্যি একটা অসাধারণ উপার্জনের মাধ্যম।",
    likes: 23,
  },
];

const Reviews = () => {
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [storyList, setStoryList] = useState(memberStories);
  const [likedReviews, setLikedReviews] = useState({});

  const handleLike = (id) => {
    if (likedReviews[id]) {
      toast("আপনি ইতিমধ্যে এই রিভিউটিতে লাইক দিয়েছেন!", { icon: "👍" });
      return;
    }
    setLikedReviews((prev) => ({ ...prev, [id]: true }));
    setStoryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item))
    );
    toast.success("রিভিউটিতে লাইক দেওয়ার জন্য ধন্যবাদ!");
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("অনুগ্রহ করে আপনার রিভিউ বা মন্তব্য লিখুন");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: user?.name || "সন্তুষ্ট মেম্বার",
      role: "ভেরিফাইড মেম্বার",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      rating: ratingVal,
      tag: "✨ নতুন রিভিউ",
      category: "stories",
      date: "এইমাত্র",
      comment: reviewText,
      likes: 1,
    };

    setStoryList([newReview, ...storyList]);
    setReviewText("");
    setOpenModal(false);
    toast.success("আপনার মূল্যবান রিভিউ সফলভাবে জমা দেওয়া হয়েছে! ধন্যবাদ 🎉");
  };

  const filteredStories = useMemo(() => {
    let result = [...storyList];

    if (activeTab !== "all") {
      if (activeTab === "screenshots") {
        return []; // handled by screenshot gallery
      }
      result = result.filter((item) => item.category === activeTab || activeTab === "stories");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.comment.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q)
      );
    }

    return result;
  }, [storyList, activeTab, searchQuery]);

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-bold tracking-wide">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Trust & Member Feedback</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                আমাদের সদস্যদের বাস্তব অভিজ্ঞতা ও{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  রিভিউ ⭐
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                হাজারো শিক্ষার্থী, গৃহিণী ও তরুণ প্রতিদিন CNP-Promo তে কাজ করে নিয়মিত ইনকাম করছেন। তাদের বাস্তব অভিজ্ঞতা ও পেমেন্ট স্ক্রিনশট দেখুন।
              </p>

              {/* Trust highlights */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> শতভাগ বিশ্বস্ত ও নিরাপদ
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> দ্রুত বিকাশ/নগদ পেমেন্ট
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> ২৪/৭ কাস্টমার সাপোর্ট
                </div>
              </div>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 lg:w-64 aspect-square">
                <img
                  src="/reviews_hero_illustration.jpg"
                  alt="Reviews & Feedback"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 📊 4 Key Trust Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl mb-2">
              ⭐
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">গড় মেম্বার রেটিং</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">৪.৯ / ৫.০</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">★★★★★ (৯৮% সন্তুষ্টি)</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5a32fa] flex items-center justify-center text-xl mb-2">
              👥
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">সক্রিয় সদস্য</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">১৫,০০০+</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">সারা বাংলাদেশ জুড়ে</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-2">
              💬
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">পজিটিভ রিভিউ</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">৫,২০০+</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">যাচাইকৃত প্রতিক্রিয়া</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl mb-2">
              ⚡
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">পেমেন্ট সাকসেস রেট</p>
              <p className="text-xl font-black text-[#0b0c2a] mt-0.5">১০০%</p>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">ইনস্ট্যান্ট বিকাশ/নগদ</p>
          </Card>

        </div>

        {/* ⭐ Rating Breakdown & Write Review Action Card */}
        <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Score */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-amber-50 border border-amber-100 w-36 aspect-square shrink-0">
              <span className="text-4xl font-black text-[#0b0c2a]">4.9</span>
              <div className="flex text-amber-400 text-lg my-1">
                {"★★★★★"}
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">৫,২০০+ রিভিউ</span>
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

          {/* Right Action */}
          <div className="text-center lg:text-right space-y-3">
            <h3 className="text-base font-bold text-[#0b0c2a]">
              আপনার অভিজ্ঞতা কেমন ছিল?
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              CNP-Promo প্ল্যাটফর্মের সাথে আপনার কাজ ও উপার্জনের অভিজ্ঞতা শেয়ার করুন
            </p>
            <Button
              onClick={() => setOpenModal(true)}
              className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 mx-auto lg:ml-auto"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>একটি রিভিউ লিখুন</span>
            </Button>
          </div>

        </Card>

        {/* 📸 Screenshot Reviews Carousel */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-bold mb-1">
                <CameraIcon className="w-3 h-3" />
                স্ক্রিনশট প্রুফ
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a]">
                মেম্বারদের চ্যাট ও পেমেন্ট স্ক্রিনশট
              </h2>
            </div>
            <span className="text-xs text-gray-400">ক্লিক করে জুম করুন</span>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <Swiper
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              slidesPerView={2}
              breakpoints={{
                320: { slidesPerView: 2, spaceBetween: 12 },
                640: { slidesPerView: 3, spaceBetween: 16 },
                768: { slidesPerView: 4, spaceBetween: 16 },
                1024: { slidesPerView: 5, spaceBetween: 20 },
              }}
              pagination={{ clickable: true }}
              modules={[Autoplay, Pagination]}
              className="pb-10"
            >
              {reviewImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <Image
                      src={image}
                      alt={`Review Screenshot ${index + 1}`}
                      className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* 🔍 Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeTab === "all"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              🌟 সকল রিভিউ
            </button>

            <button
              onClick={() => setActiveTab("top-earners")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeTab === "top-earners"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              💰 টপ আর্নার্স
            </button>

            <button
              onClick={() => setActiveTab("beginners")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeTab === "beginners"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              🎓 নতুন মেম্বার
            </button>

            <button
              onClick={() => setActiveTab("stories")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeTab === "stories"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              📝 লিখিত গল্প
            </button>
          </div>

          {/* Search input */}
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
              key={story.id}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-1.5">
                        <span>{story.name}</span>
                        <CheckBadgeIcon className="w-4 h-4 text-[#5a32fa]" />
                      </h4>
                      <p className="text-[11px] text-gray-400">{story.role}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-[#5a32fa] rounded-full border border-purple-100 shrink-0">
                    {story.tag}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex text-amber-400 text-sm mb-2.5">
                  {"★".repeat(story.rating)}
                </div>

                {/* Comment Text */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  "{story.comment}"
                </p>
              </div>

              {/* Bottom: Date & Likes */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>{story.date}</span>

                <button
                  onClick={() => handleLike(story.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${
                    likedReviews[story.id]
                      ? "bg-purple-50 text-[#5a32fa] font-bold"
                      : "hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <HandThumbUpIcon className="w-3.5 h-3.5" />
                  <span>{story.likes}</span>
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
            <Link to="/works">
              <Button variant="outlined" className="border-gray-400 text-white normal-case font-bold text-xs px-6 py-3 rounded-xl hover:bg-white/10">
                কাজের তালিকা দেখুন
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* ✍️ Interactive Write Review Modal */}
      <Dialog
        open={openModal}
        handler={() => setOpenModal(false)}
        size="sm"
        className="rounded-3xl p-2 bg-white shadow-2xl"
      >
        <DialogHeader className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <Typography variant="h6" className="font-bold text-[#0b0c2a]">
              আপনার অভিজ্ঞতা শেয়ার করুন
            </Typography>
          </div>
          <IconButton
            variant="text"
            onClick={() => setOpenModal(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        </DialogHeader>

        <form onSubmit={handleReviewSubmit}>
          <DialogBody className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                আপনার রেটিং নির্বাচন করুন:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingVal(star)}
                    className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    {star <= ratingVal ? "⭐" : "☆"}
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-500 ml-2">
                  {ratingVal} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                আপনার রিভিউ বা মতামত:
              </label>
              <textarea
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="CNP-Promo তে আপনার কাজের অভিজ্ঞতা, পেমেন্ট ও সাপোর্ট সম্পর্কে লিখুন..."
                className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa] outline-none"
              />
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-between items-center gap-2 pt-2">
            <Button
              type="button"
              variant="text"
              color="red"
              onClick={() => setOpenModal(false)}
              className="normal-case text-xs"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              className="bg-[#5a32fa] normal-case text-xs px-6 py-2.5 rounded-xl shadow-md"
            >
              রিভিউ সাবমিট করুন
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

    </div>
  );
};

export default Reviews;