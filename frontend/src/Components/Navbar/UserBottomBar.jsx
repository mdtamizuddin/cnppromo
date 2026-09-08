import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
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
  const isWorks = pathname.startsWith("/user/works");
  const isSocialWorks = pathname.startsWith("/user/social-works");
  const isMessage =
    pathname === "/user/message" ||
    pathname === "/message" ||
    pathname.startsWith("/user/all-message") ||
    pathname.startsWith("/user/message/");

  // Detect if user is on the active task details / proof submission page
  const isSocialTaskDetails =
    pathname.startsWith("/user/social-works/") &&
    pathname !== "/user/social-works/my-tasks" &&
    pathname !== "/user/social-works/create" &&
    pathname !== "/user/social-works/submissions" &&
    !pathname.includes("/submissions");

  // Don't show floating bottom bar in message pages or during active task proof submission (prevents overlap)
  if (isMessage || isSocialTaskDetails) {
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
        <span className="text-[10px] tracking-tight mt-0.5">Home</span>
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
        <span className="text-[10px] tracking-tight mt-0.5">Tasks</span>
      </Link>

      {/* 3. Center Social Tasks Button (Raised gradient circular button) */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-6">
        <Link
          to="/user/social-works"
          className={`w-12 h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-lg transition-all border-[3px] border-white active:scale-95 ${
            isSocialWorks
              ? "ring-4 ring-teal-500/30 scale-105 shadow-teal-500/50"
              : "shadow-teal-500/30 hover:scale-110"
          }`}
          title="Social Tasks"
        >
          <SparklesIcon className="w-6 h-6 stroke-[2.2]" />
        </Link>
        <span
          className={`text-[9px] tracking-tight mt-0.5 font-bold ${
            isSocialWorks ? "text-primary" : "text-gray-400"
          }`}
        >
          Social
        </span>
      </div>

      {/* 4. Message */}
      <Link
        to="/user/message"
        className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl flex-1 text-gray-400 hover:text-gray-600 transition-all"
      >
        <div className="p-1 rounded-xl">
          <ChatBubbleLeftRightIcon className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Messages</span>
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
        <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
      </button>
    </div>
  );
};

export default UserBottomBar;
