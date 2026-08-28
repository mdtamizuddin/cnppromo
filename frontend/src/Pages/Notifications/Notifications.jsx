import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
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
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import { api } from "../../util/axios";

dayjs.extend(relativeTime);

const staticNotifications = [
  {
    id: "notif-1",
    category: "system",
    type: "welcome",
    title: "স্বাগতম CNP-PROMO প্ল্যাটফর্মে! 🚀",
    message: "আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে। নিয়মিত কাজ সম্পন্ন করে প্রতিদিন ইনকাম করুন।",
    time: "সকাল ৯:০০",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    icon: SparklesIcon,
    iconBg: "bg-purple-50 text-[#5a32fa]",
    cta: { text: "কাজ শুরু করুন", link: "/works" },
  },
  {
    id: "notif-2",
    category: "payments",
    type: "payment_update",
    title: "উইথড্রয়াল প্রসেসিং নোটিশ ⚡",
    message: "বিকাশ ও নগদে আপনার সকল উইথড্রয়াল রিকোয়েস্ট ১২-২৪ ঘন্টার মধ্যে সফলভাবে পাঠিয়ে দেওয়া হবে।",
    time: "২ ঘন্টা আগে",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    icon: CreditCardIcon,
    iconBg: "bg-emerald-50 text-emerald-600",
    cta: { text: "উইথড্র হিস্ট্রি", link: "/account/withdraw" },
  },
  {
    id: "notif-3",
    category: "referrals",
    type: "refer_boost",
    title: "রেফারেল কমিশন অফার চালু 👑",
    message: "প্রতিটি ১ম লেভেল রেফারে পাবেন ৩০ টাকা থেকে সর্বোচ্চ ৪০ টাকা পর্যন্ত আজীবন কমিশন!",
    time: "গতকাল",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    icon: UserGroupIcon,
    iconBg: "bg-blue-50 text-blue-600",
    cta: { text: "রেফারেল লিংক", link: "/refer" },
  },
  {
    id: "notif-4",
    category: "tasks",
    type: "task_alert",
    title: "নতুন ইউটিউব & সোশ্যাল টাস্ক যোগ হয়েছে 🎬",
    message: "সহজ ভিডিও দেখা ও লাইক-শেয়ারের নতুন কাজগুলো সম্পন্ন করে ব্যালেন্স বাড়িয়ে নিন।",
    time: "২ দিন আগে",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isRead: true,
    icon: BanknotesIcon,
    iconBg: "bg-amber-50 text-amber-600",
    cta: { text: "টাস্ক গ্যালারি", link: "/social-works" },
  },
  {
    id: "notif-5",
    category: "system",
    type: "security",
    title: "নিরাপত্তা ও একাউন্ট ভেরিফিকেশন গাইড 🛡️",
    message: "আপনার পাসওয়ার্ড ও পার্সোনাল একাউন্ট নম্বর সুরক্ষিত রাখুন।",
    time: "৩ দিন আগে",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    isRead: true,
    icon: ShieldCheckIcon,
    cta: { text: "সেটিংস দেখুন", link: "/settings" },
  },
];

const Notifications = () => {
  const { user } = useSelector((state) => state.user);
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(staticNotifications);

  // Fetch real referral transactions to enrich notifications
  const { data: referData } = useQuery({
    queryKey: ["notifications-referrals", user?._id],
    queryFn: async () => {
      const res = await api.get(`/refer/user/${user?._id}`);
      return res.data;
    },
    enabled: !!user?._id,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const dynamicRefNotifs = data.slice(0, 3).map((item, idx) => ({
          id: `refer-dyn-${idx}`,
          category: "referrals",
          type: "refer_success",
          title: `নতুন রেফারেল সফল! 🎉`,
          message: `${item?.user?.name || "Member"} যুক্ত হয়েছেন (+৳৩০ কমিশন)।`,
          time: dayjs(item?.createdAt).fromNow(),
          timestamp: new Date(item?.createdAt),
          isRead: false,
          icon: UserGroupIcon,
          iconBg: "bg-emerald-50 text-emerald-600",
          cta: { text: "রেফারেল চেক", link: "/refer" },
        }));

        setNotifications((prev) => {
          const nonRefer = prev.filter((p) => !p.id.startsWith("refer-dyn-"));
          return [...dynamicRefNotifs, ...nonRefer];
        });
      }
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("সব নোটিফিকেশন পড়া হয়েছে");
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const categories = [
    { id: "all", label: "সবগুলো", icon: BellIcon },
    { id: "payments", label: "পেমেন্ট", icon: CreditCardIcon },
    { id: "referrals", label: "রেফারেল", icon: UserGroupIcon },
    { id: "tasks", label: "টাস্ক", icon: BanknotesIcon },
    { id: "system", label: "সিস্টেম", icon: MegaphoneIcon },
  ];

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-3xl space-y-3.5">
        
        {/* 📱 Compact Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
          <div className="flex items-center gap-2.5">
            <Link
              to="/home"
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#5a32fa] transition-colors"
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
              className="text-[11px] font-bold text-[#5a32fa] hover:text-[#4b26e0] flex items-center gap-1"
            >
              <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>সব পড়া হয়েছে</span>
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
                    ? "bg-[#5a32fa] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 📜 Simple & Compact Notifications Feed */}
        <div className="space-y-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const Icon = item.icon || BellIcon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                    !item.isRead
                      ? "bg-white border-purple-200/80 shadow-sm"
                      : "bg-white/70 border-gray-200/60 opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
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
                        {item.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    {item.cta && (
                      <div className="pt-1">
                        <Link
                          to={item.cta.link}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5a32fa] hover:underline"
                        >
                          <span>{item.cta.text}</span>
                          <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
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
