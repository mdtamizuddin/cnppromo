import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  UsersIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const AdminBottomBar = ({ toggleSidebar }) => {
  const { pathname } = useLocation();

  const isDashboard = pathname === "/admin" || pathname === "/admin/dashboard";
  const isUsers =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/admins") ||
    pathname.startsWith("/admin/moderator") ||
    pathname.startsWith("/admin/non-active-users") ||
    pathname.startsWith("/admin/banned-users");
  const isWorks =
    pathname.startsWith("/admin/works") ||
    pathname.startsWith("/admin/social-works");
  const isMessage = pathname.startsWith("/admin/message");

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-2xl px-2 py-1.5 flex items-center justify-around lg:hidden transition-all">
      {/* 1. Dashboard */}
      <Link
        to="/admin/dashboard"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 transition-all ${
          isDashboard
            ? "text-[#4d28e2] font-black scale-105"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            isDashboard ? "bg-[#f4f0ff]" : ""
          }`}
        >
          <Squares2X2Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Dashboard</span>
      </Link>

      {/* 2. Users */}
      <Link
        to="/admin/users"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 transition-all ${
          isUsers
            ? "text-[#4d28e2] font-black scale-105"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            isUsers ? "bg-[#f4f0ff]" : ""
          }`}
        >
          <UsersIcon className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Users</span>
      </Link>

      {/* 3. Center Manage Works Button */}
      <div className="flex-1 flex justify-center -mt-6">
        <Link
          to="/admin/works"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#4d28e2] via-[#6a3df5] to-[#a855f7] text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all border-[3px] border-white"
          title="Manage Works"
        >
          <BriefcaseIcon className="w-6 h-6 stroke-[2.2]" />
        </Link>
      </div>

      {/* 4. Message */}
      <Link
        to="/admin/message"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 transition-all ${
          isMessage
            ? "text-[#4d28e2] font-black scale-105"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            isMessage ? "bg-[#f4f0ff]" : ""
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Message</span>
      </Link>

      {/* 5. Menu Drawer Trigger */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 text-gray-400 hover:text-gray-700 active:scale-95 transition-all"
      >
        <div className="p-1 rounded-xl">
          <Bars3Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
      </button>
    </div>
  );
};

export default AdminBottomBar;
