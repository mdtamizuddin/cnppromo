import React, { useState } from "react";
import { Card, Button, Typography } from "@material-tailwind/react";
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  CheckCircleIcon,
  EyeIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const AdminReviews = () => {
  const [filterRating, setFilterRating] = useState("all");
  const [search, setSearch] = useState("");

  const [reviews, setReviews] = useState([
    {
      id: "1",
      name: "Tanzim Hasan",
      username: "tanzim99",
      rating: 5,
      comment:
        "CNP Promo খুব বিশ্বস্ত একটি প্ল্যাটফর্ম। আমি আজকেই bKash এ প্রথম ৫০০ টাকা পেমেন্ট পেয়েছি। অনেক ধন্যবাদ!",
      date: "Today, 4:15 PM",
      featured: true,
      status: "approved",
      avatar: "https://i.pravatar.cc/150?u=tanzim",
    },
    {
      id: "2",
      name: "Sumaiya Akter",
      username: "sumaiya_bd",
      rating: 5,
      comment:
        "ভিডিও দেখে ও সোশ্যাল টাস্ক করে সহজে ইনকাম করা যায়। রেফারেল কমিশনও ইনস্ট্যান্ট যোগ হয়।",
      date: "Yesterday",
      featured: true,
      status: "approved",
      avatar: "https://i.pravatar.cc/150?u=sumaiya",
    },
    {
      id: "3",
      name: "Rakib Chowdhury",
      username: "rakib_pro",
      rating: 4,
      comment:
        "পেমেন্ট খুব ফাস্ট। উইথড্র দেওয়ার মাত্র ২ ঘণ্টার মধ্যে Nagad এ টাকা চলে এসেছে।",
      date: "2 days ago",
      featured: false,
      status: "approved",
      avatar: "https://i.pravatar.cc/150?u=rakib",
    },
    {
      id: "4",
      name: "Mehedi Hasan",
      username: "mehedi_01",
      rating: 5,
      comment: "Best micro-job earning platform in Bangladesh! 100% recommended.",
      date: "3 days ago",
      featured: false,
      status: "approved",
      avatar: "https://i.pravatar.cc/150?u=mehedi",
    },
  ]);

  const toggleFeatured = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r))
    );
    toast.success("Review featured status updated!");
  };

  const handleDelete = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review removed successfully.");
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRating =
      filterRating === "all" ? true : r.rating === Number(filterRating);
    const matchesSearch =
      !search.trim() ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.username.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
            <StarSolid className="w-4 h-4 text-amber-500" />
            <span>Social Proof & Feedback</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
            Reviews & Testimonials Manager
          </h1>
          <p className="text-xs text-gray-500">
            Moderate, approve, and feature high-rating user reviews on the public homepage.
          </p>
        </div>

        {/* Rating KPI Pill */}
        <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-100 rounded-2xl">
          <div className="text-2xl font-black text-amber-700">{averageRating}</div>
          <div className="text-xs">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <StarSolid key={i} className="w-3.5 h-3.5" />
              ))}
            </div>
            <p className="text-gray-500 text-[10px]">{reviews.length} Total Reviews</p>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by user or text..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "5", "4", "3"].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterRating === star
                  ? "bg-[#5a32fa] text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {star === "all" ? "All Ratings" : `⭐ ${star} Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* 📜 Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            No reviews matching your search or rating filter.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <Card
              key={r.id}
              className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">{r.name}</h3>
                      <p className="text-[10px] text-gray-400">@{r.username} • {r.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(r.rating)].map((_, i) => (
                      <StarSolid key={i} className="w-3.5 h-3.5" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
                  "{r.comment}"
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleFeatured(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    r.featured
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>{r.featured ? "Featured on Home" : "Feature on Home"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Review"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
