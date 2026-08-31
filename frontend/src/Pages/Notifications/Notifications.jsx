import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "react-query";
import {
  BellIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  UserGroupIcon,
  BanknotesIcon,
  SparklesIcon,
  CheckIcon,
  TrashIcon,
  ArrowRightIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import { resolveNotificationLink } from "../../util/notificationLink";
import Loader from "../../Components/Loader";

dayjs.extend(relativeTime);

const CATEGORY_META = {
  payments: { label: "পেমেন্ট", icon: CreditCardIcon, iconBg: "bg-emerald-50 text-emerald-600" },
  referrals: { label: "রেফারেল", icon: UserGroupIcon, iconBg: "bg-blue-50 text-blue-600" },
  tasks: { label: "টাস্ক", icon: BanknotesIcon, iconBg: "bg-amber-50 text-amber-600" },
  task: { label: "টাস্ক", icon: BanknotesIcon, iconBg: "bg-amber-50 text-amber-600" },
  system: { label: "সিস্টেম", icon: MegaphoneIcon, iconBg: "bg-primary-light text-primary" },
  levels: { label: "লেভেল", icon: TrophyIcon, iconBg: "bg-teal-50 text-teal-600" },
  security: { label: "সিকিউরিটি", icon: ShieldCheckIcon, iconBg: "bg-rose-50 text-rose-600" },
  announcement: { label: "ঘোষণা", icon: MegaphoneIcon, iconBg: "bg-primary-light text-primary" },
  reward: { label: "বোনাস", icon: SparklesIcon, iconBg: "bg-amber-50 text-amber-600" },
};

const toLocalTime = (iso) =>
  iso ? dayjs(iso).format("h:mm A") : "";

const Notifications = () => {
  const { user } = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications", user?._id],
    queryFn: async () => {
      const res = await api.get("/notification");
      return res.data;
    },
    enabled: !!user?._id,
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unread ?? notifications.filter((n) => !n.isRead).length;

  const refresh = () => queryClient.invalidateQueries(["notifications", user?._id]);

  const handleMarkAllAsRead = async () => {
    await api.put("/notification/read-all");
    refresh();
    toast.success("সব নোটিফিকেশন পড়া হয়েছে");
  };

  const handleMarkAsRead = async (item) => {
    if (item.isRead) return;
    try {
      await api.put(`/notification/read/${item._id}`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item) => {
    try {
      await api.delete(`/notification/${item._id}`);
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "মুছে ফেলা যায়নি");
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const categories = [
    { id: "all", label: "সবগুলো" },
    ...Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, label: meta.label })),
  ];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-3xl space-y-3.5">

        {/* 📱 Compact Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
          <div className="flex items-center gap-2.5">
            <Link
              to="/user/home"
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-primary transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#0b0c2a]">
                নোটিফিকেশন
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {unreadCount}টি নতুন
                </span>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>সব পড়া হয়েছে</span>
            </button>
          )}
        </div>

        {/* 🏷️ Simple Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 📜 Compact Notifications Feed */}
        <div className="space-y-2">
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-xs font-bold text-[#0b0c2a]">লোড করতে ব্যর্থ হয়েছে</h3>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const meta =
                CATEGORY_META[item.category] || {
                  icon: BellIcon,
                  iconBg: "bg-gray-50 text-gray-500",
                };
              const Icon = meta.icon;

              return (
                <div
                  key={item._id}
                  onClick={() => handleMarkAsRead(item)}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                    !item.isRead
                      ? "bg-white border-primary/40 shadow-sm"
                      : "bg-white/70 border-gray-200/60 opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#0b0c2a] truncate flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                        )}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                        {toLocalTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    {item.link && (
                      <div className="pt-1">
                        <Link
                          to={resolveNotificationLink(item.link, user?.role)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        >
                          <span>বিস্তারিত দেখুন</span>
                          <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="text-gray-300 hover:text-rose-500 p-1 shrink-0 rounded-lg hover:bg-gray-50 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5">
              <span className="text-2xl">🔕</span>
              <h3 className="text-xs font-bold text-[#0b0c2a]">
                কোন নোটিফিকেশন নেই
              </h3>
              <p className="text-[11px] text-gray-400">
                এই ক্যাটাগরিতে বর্তমানে কোনো নোটিফিকেশন নেই।
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;