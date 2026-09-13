import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  SparklesIcon,
  BanknotesIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const NAV_TABS = [
  { label: "Browse Tasks", path: "/user/social-works", icon: "🛒" },
  { label: "My Created Tasks", path: "/user/social-works/my-tasks", icon: "📋" },
  { label: "Post a Task", path: "/user/social-works/create", icon: "➕" },
  { label: "My Submissions", path: "/user/social-works/submissions", icon: "📜" },
];

const SocialNav = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  return (
    <div className="space-y-4">
      {/* Top Banner with Navigation Tabs & Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-gray-200/80 shadow-xs">
        {/* Navigation Tabs - Smooth Horizontal Touch Scroller on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 touch-pan-x">
          {NAV_TABS.map((tab) => {
            const isActive =
              location.pathname === tab.path ||
              (tab.path === "/user/social-works" &&
                location.pathname === "/user/social-works/");

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap active:scale-95 touch-tap-none ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                    : "text-gray-600 hover:text-gray-900 bg-gray-50/60 sm:bg-transparent hover:bg-gray-100"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Balance Display - Compact on Mobile */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 px-3 py-1.5 rounded-xl bg-teal-50/70 border border-teal-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xs shrink-0">
              <BanknotesIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">Available Balance</p>
              <p className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                ৳ {(user?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Link
            to="/user/topup"
            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs transition-all active:scale-95"
          >
            + Deposit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SocialNav;
