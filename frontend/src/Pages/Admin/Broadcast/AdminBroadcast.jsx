import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Card, Button, Typography } from "@material-tailwind/react";
import {
  MegaphoneIcon,
  PaperAirplaneIcon,
  BellIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";

const AdminBroadcast = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all"); // 'all' | 'active' | 'non-active'
  const [category, setCategory] = useState("announcement"); // 'announcement' | 'reward' | 'task' | 'security'
  const [history, setHistory] = useState([
    {
      title: "🔥 Special Weekend Task Bonus Active!",
      message: "Complete 5 tasks today to unlock an instant ৳50 cash bonus.",
      target: "All Users",
      category: "reward",
      time: "2 hours ago",
      recipients: 1420,
    },
    {
      title: "System Maintenance Notice",
      message: "Server scheduled upgrade completed successfully. All withdrawals processed.",
      target: "Active Users",
      category: "announcement",
      time: "Yesterday",
      recipients: 890,
    },
  ]);

  const broadcastMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/notification/broadcast", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Notification broadcasted successfully!");
      setHistory((prev) => [
        {
          title,
          message,
          target:
            target === "all"
              ? "All Users"
              : target === "active"
              ? "Active Users"
              : "Pending Users",
          category,
          time: "Just now",
          recipients: data?.count || 1,
        },
        ...prev,
      ]);
      setTitle("");
      setMessage("");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to send broadcast notification"
      );
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }
    broadcastMutation.mutate({
      title,
      message,
      target,
      category,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#5a32fa] text-xs font-bold">
          <MegaphoneIcon className="w-4 h-4" />
          <span>Push & In-App Announcements</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
          Broadcast Notification Center
        </h1>
        <p className="text-xs text-gray-500">
          Send real-time alerts, bonus event notifications, and urgent announcements directly to users.
        </p>
      </div>

      {/* 2-Column: Sender Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Form */}
        <Card className="lg:col-span-7 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-base font-black text-[#0b0c2a] flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-[#5a32fa]" />
            <span>Compose Notification</span>
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Target Audience Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Target Audience:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTarget("all")}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                    target === "all"
                      ? "bg-[#5a32fa] text-white border-[#5a32fa] shadow-md shadow-indigo-500/20"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  👥 All Users
                </button>
                <button
                  type="button"
                  onClick={() => setTarget("active")}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                    target === "active"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ⚡ Active Only
                </button>
                <button
                  type="button"
                  onClick={() => setTarget("non-active")}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                    target === "non-active"
                      ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ⏳ Pending Only
                </button>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Notification Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "announcement", label: "📢 Announcement" },
                  { key: "reward", label: "🎁 Bonus / Reward" },
                  { key: "task", label: "💼 Task Alert" },
                  { key: "security", label: "🛡️ Security / Info" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      category === item.key
                        ? "bg-purple-50 text-[#5a32fa] border-purple-300 font-black"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Notification Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., নতুন স্পেশাল ভিডিও টাস্ক যুক্ত হয়েছে!"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                required
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Message Body:
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="আপনার মেসেজ বিস্তারিত লিখুন..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa] resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={broadcastMutation.isLoading}
              className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs sm:text-sm font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>
                {broadcastMutation.isLoading
                  ? "Broadcasting Notification..."
                  : "Send Broadcast to Users"}
              </span>
            </Button>
          </form>
        </Card>

        {/* Right Column: Live Mobile Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 bg-gradient-to-br from-[#0b0c2a] via-[#1a1c4b] to-[#0b0c2a] text-white rounded-3xl shadow-xl space-y-4 border border-indigo-950">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                <SparklesIcon className="w-4 h-4 text-amber-300" />
                <span>Live In-App User Preview</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                Target: {target.toUpperCase()}
              </span>
            </div>

            {/* Simulated User Notification Item */}
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <BellIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-black text-white leading-tight">
                    {title || "Notification Title Preview"}
                  </h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {message ||
                      "This is how your broadcast notification will appear inside the user notification center and floating alerts."}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-gray-400 border-t border-white/10">
                <span>Just now</span>
                <span className="text-emerald-400 font-bold">Unread</span>
              </div>
            </div>

            <div className="text-[11px] text-indigo-200/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
              💡 <strong>Instant Delivery:</strong> Broadcasted notifications are saved to database and pushed via WebSocket to all connected user sessions immediately.
            </div>
          </Card>

          {/* Broadcast History Strip */}
          <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#0b0c2a] flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span>Recent Broadcasts</span>
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-gray-50 hover:bg-purple-50/40 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                    <span className="truncate pr-2">{h.title}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 font-normal">
                      {h.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2">
                    {h.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                    <span>Target: {h.target}</span>
                    <span className="text-emerald-600 font-bold">
                      {h.recipients} users
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;
