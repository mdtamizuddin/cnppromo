import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconButton } from "@material-tailwind/react";
import {
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  CreditCardIcon,
  UserGroupIcon,
  WalletIcon,
  TrophyIcon,
  AcademicCapIcon,
  BellIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import { useUnreadNotifications } from "../../util/useUnreadNotifications";

const UserSidebarDrawer = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const unreadCount = useUnreadNotifications();

  const handleLogout = () => {
    Cookie.remove("token-you");
    localStorage.clear();
    toast.success("লগআউট সফল হয়েছে");
    window.location.href = "/";
  };

  const navMenuItems = [
    { label: "ড্যাশবোর্ড", to: "/user/home", icon: HomeIcon },
    { label: "আমার টাস্ক", to: "/user/works", icon: ClipboardDocumentListIcon },
    { label: "আমার আয়", to: "/user/earnings", icon: BanknotesIcon },
    { label: "উইথড্র", to: "/user/account/withdraw", icon: CreditCardIcon },
    { label: "রেফার & আর্ন", to: "/user/refer", icon: UserGroupIcon },
    { label: "ওয়ালেট", to: "/user/account", icon: WalletIcon },
    { label: "ট্রেনিং & সাপোর্ট", to: "/user/training", icon: AcademicCapIcon },
    {
      label: "নোটিফিকেশন",
      to: "/user/notifications",
      icon: BellIcon,
    },
    { label: "সেটিংস", to: "/user/settings", icon: Cog6ToothIcon },
    { label: "Message", to: "/user/message", icon: ChatBubbleLeftRightIcon },
    { label: "লগইন ডিভাইস", to: "/user/login-devices", icon: DevicePhoneMobileIcon },
  ];

  const navItems = navMenuItems.map((item) =>
    item.to === "/user/notifications"
      ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined }
      : item
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar: Fixed Permanent on Desktop (lg:translate-x-0) & Slide-in Drawer on Mobile */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 lg:z-40 w-72 bg-[#0e0f24] text-white flex flex-col justify-between shadow-2xl border-r border-indigo-950/40 transform transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & User Profile Info */}
        <div className="p-5 border-b border-white/10 space-y-4">
          {/* Logo & Mobile Close Button */}
          <div className="flex items-center justify-between">
            <Link
              to="/user/home"
              onClick={onClose}
              className="text-xl font-black tracking-wider text-white flex items-center gap-1.5"
            >
              <span className="text-white">CNP</span>
              <span className="text-primary bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                PROMO
              </span>
            </Link>

            <IconButton
              variant="text"
              color="white"
              onClick={onClose}
              className="rounded-full w-8 h-8 hover:bg-white/10 lg:hidden"
            >
              <XMarkIcon className="w-5 h-5 text-gray-300" />
            </IconButton>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 pt-1">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                }
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0e0f24] rounded-full"></span>
            </div>

            <div className="overflow-hidden space-y-0.5 flex-1">
              <h3 className="text-sm font-black text-white truncate flex items-center gap-1">
                <span>{user?.name || "Member"}</span>
                <span>👋</span>
              </h3>
              <p className="text-[11px] text-gray-400 truncate font-mono">
                {user?.email || "user@cnppromo.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item, idx) => {
            const isActive =
              item.to &&
              (location.pathname === item.to ||
                (item.to === "/home" && location.pathname === "/welcome"));
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </button>
              );
            }

            return (
              <Link
                key={idx}
                to={item.to}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-teal-600/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRightIcon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Logout & Version Strip */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0b0c1e]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>লগ আউট</span>
          </button>

          <p className="text-[10px] text-center text-gray-500 font-mono">
            ভার্সন 1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default UserSidebarDrawer;
