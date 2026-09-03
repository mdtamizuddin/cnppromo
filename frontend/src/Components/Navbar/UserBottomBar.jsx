import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const UserBottomBar = ({ onOpenMenu }) => {
  const { pathname } = useLocation();

  const isHome =
    pathname === "/user/home" ||
    pathname === "/user/welcome" ||
    pathname === "/user" ||
    pathname === "/";
  const isWorks =
    pathname.startsWith("/user/works") ||
    pathname.startsWith("/user/tasks") ||
    pathname.startsWith("/user/my-submissions") ||
    pathname.startsWith("/user/provider");
  const isMessage =
    pathname === "/user/message" ||
    pathname === "/message" ||
    pathname.startsWith("/user/all-message") ||
    pathname.startsWith("/user/message/");

  // Don't show bottom bar in message pages (matches admin full-bleed behavior)
  if (isMessage) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-2xl px-2 py-1.5 flex items-center justify-around lg:hidden transition-all">
      {/* 1. Home */}
      <Link
        to="/user/home"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 transition-all ${
          isHome
            ? "text-primary font-black scale-105"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            isHome ? "bg-primary-light" : ""
          }`}
        >
          <HomeIcon className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">হোম</span>
      </Link>

      {/* 2. Tasks */}
      <Link
        to="/user/works"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 transition-all ${
          isWorks
            ? "text-primary font-black scale-105"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            isWorks ? "bg-primary-light" : ""
          }`}
        >
          <ClipboardDocumentListIcon className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">টাস্ক</span>
      </Link>

      {/* 3. Center Earn Button (Raised gradient circular button) */}
      <div className="flex-1 flex justify-center -mt-6">
        <Link
          to="/user/tasks"
          className="w-12 h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-lg shadow-teal-500/40 hover:scale-110 active:scale-95 transition-all border-[3px] border-white"
          title="Task Marketplace"
        >
          <PlusIcon className="w-6 h-6 stroke-[2.8]" />
        </Link>
      </div>

      {/* 4. Message */}
      <Link
        to="/user/message"
        className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 text-gray-400 hover:text-gray-600 transition-all"
      >
        <div className="p-1 rounded-xl">
          <ChatBubbleLeftRightIcon className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">মেসেজ</span>
      </Link>

      {/* 5. Menu Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 text-gray-400 hover:text-gray-700 active:scale-95 transition-all"
      >
        <div className="p-1 rounded-xl">
          <Bars3Icon className="w-5 h-5 stroke-[2.3]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">মেনু</span>
      </button>
    </div>
  );
};

export default UserBottomBar;
