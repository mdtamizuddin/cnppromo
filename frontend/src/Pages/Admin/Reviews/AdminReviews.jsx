import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Card, Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import {
  StarIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";
import DeleteConfirmModal from "../../../Components/DeleteConfirmModal";

const avatarPresets = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
];

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [filterRating, setFilterRating] = useState("all");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding review manually
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [district, setDistrict] = useState("ঢাকা");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [avatar, setAvatar] = useState(avatarPresets[0]);
  const [featured, setFeatured] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 1. Fetch real reviews from DB
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews-list", filterRating],
    queryFn: async () => {
      const res = await api.get(`/review?rating=${filterRating}`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 2. Add manual review mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/review", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews-list"]);
      queryClient.invalidateQueries(["public-reviews"]);
      toast.success("Review added successfully!");
      setIsAddModalOpen(false);
      setName("");
      setUsername("");
      setComment("");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to add review");
    },
  });

  // 3. Toggle featured mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, featured }) => {
      const res = await api.put(`/review/${id}`, { featured });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews-list"]);
      queryClient.invalidateQueries(["public-reviews"]);
      toast.success("Featured status updated!");
    },
  });

  // 4. Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/review/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews-list"]);
      queryClient.invalidateQueries(["public-reviews"]);
      toast.success("Review deleted successfully.");
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please fill in reviewer name and feedback comment");
      return;
    }
    createMutation.mutate({
      name,
      username: username || name.toLowerCase().replace(/\s+/g, "_"),
      district,
      rating,
      comment,
      avatar,
      featured,
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.username?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q)
    );
  });

  const averageRating = reviews.length
    ? (
        reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
        reviews.length
      ).toFixed(1)
    : "5.0";

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
            <StarSolid className="w-4 h-4 text-amber-500" />
            <span>Social Proof Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
            Reviews & Testimonials Manager
          </h1>
          <p className="text-xs text-gray-500">
            Add authentic reviews manually and choose which ones to feature on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 p-2.5 px-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl">
            <div className="text-xl font-black text-amber-700">{averageRating}</div>
            <div className="text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={i} className="w-3 h-3" />
                ))}
              </div>
              <p className="text-gray-500 text-[10px]">{reviews.length} Reviews</p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-4 py-3 rounded-2xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Add Review Manually</span>
          </Button>
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
            placeholder="Search reviews by name, text, district..."
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
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
            No reviews matching your search or rating filter. Click "Add Review Manually" above to create one.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <Card
              key={r._id}
              className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        r.avatar ||
                        `https://i.pravatar.cc/150?u=${encodeURIComponent(r.name)}`
                      }
                      alt={r.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-purple-100 shadow-sm"
                      onError={(e) => {
                        e.target.src = "https://i.pravatar.cc/150?u=user";
                      }}
                    />
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{r.name}</span>
                        {r.featured && (
                          <CheckBadgeIcon className="w-4 h-4 text-[#5a32fa]" />
                        )}
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        @{r.username} • {r.district || "বাংলাদেশ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <StarSolid key={i} className="w-3.5 h-3.5" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                  "{r.comment}"
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    toggleMutation.mutate({
                      id: r._id,
                      featured: !r.featured,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    r.featured
                      ? "bg-purple-50 text-[#5a32fa] border border-purple-200"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>
                    {r.featured ? "Featured on Home ✓" : "Feature on Home"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(r)}
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

      {/* ✍️ Add Review Modal */}
      <Dialog
        open={isAddModalOpen}
        handler={() => setIsAddModalOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-white space-y-4 max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-black text-base">
            <StarSolid className="w-5 h-5 text-amber-500" />
            <span>Add Review Manually</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {/* Avatar Preset Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700">Choose Avatar:</label>
            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
              {avatarPresets.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Preset ${idx + 1}`}
                  onClick={() => setAvatar(imgUrl)}
                  className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all border-2 ${
                    avatar === imgUrl
                      ? "border-[#5a32fa] scale-110 shadow-md"
                      : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name & Username Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Reviewer Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. তানজিম হাসান"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Username / Handle</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. tanzim99"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>
          </div>

          {/* District & Star Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">District / City</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. ঢাকা"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <StarSolid
                      className={`w-6 h-6 ${
                        s <= rating ? "text-amber-500" : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Comment */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Feedback / Testimonial *</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ইউজারের রিভিউ বা মন্তব্য লিখুন..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa] resize-none"
              required
            />
          </div>

          {/* Feature toggle checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-[#5a32fa] rounded focus:ring-purple-500 border-gray-300"
            />
            <label htmlFor="featuredCheck" className="font-bold text-gray-700 cursor-pointer">
              Feature on Homepage & Public Reviews
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={createMutation.isLoading}
            className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>
              {createMutation.isLoading ? "Saving Review..." : "Save Review"}
            </span>
          </Button>
        </form>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?._id) deleteMutation.mutate(deleteTarget._id);
          setDeleteTarget(null);
        }}
        title={`Delete "${deleteTarget?.name}"?`}
        message="আপনি কি নিশ্চিত যে এই রিভিউটি স্থায়ীভাবে মুছে ফেলতে চান? এই অ্যাকশনটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।"
        itemName={deleteTarget?.username}
        confirmText="Delete Review"
        cancelText="Cancel"
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default AdminReviews;
