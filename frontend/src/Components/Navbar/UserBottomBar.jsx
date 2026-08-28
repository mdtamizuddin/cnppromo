import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  WalletIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const UserBottomBar = () => {
  const { pathname } = useLocation();

  const isHome = pathname === "/home" || pathname === "/welcome" || pathname === "/";
  const isWorks = pathname.startsWith("/works");
  const isEarn = pathname.startsWith("/social-works");
  const isWallet = pathname.startsWith("/account");
  const isSettings = pathname === "/settings";

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-2xl px-3 py-2 flex items-center justify-between lg:hidden">
      
      {/* 1. Home */}
      <Link
        to="/home"
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${
          isHome ? "text-[#5a32fa] font-bold" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-[10px]">হোম</span>
      </Link>

      {/* 2. Tasks */}
      <Link
        to="/works"
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${
          isWorks ? "text-[#5a32fa] font-bold" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <ClipboardDocumentListIcon className="w-5 h-5" />
        <span className="text-[10px]">টাস্ক</span>
      </Link>

      {/* 3. Center Earn Button (Raised round purple button) */}
      <div className="flex-1 flex justify-center -mt-6">
        <Link
          to="/social-works"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#5a32fa] to-[#7c3aed] text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all border-4 border-white"
          title="Watch & Earn"
        >
          <PlusIcon className="w-6 h-6 stroke-[2.5]" />
        </Link>
      </div>

      {/* 4. Wallet */}
      <Link
        to="/account/withdraw"
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${
          isWallet ? "text-[#5a32fa] font-bold" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <WalletIcon className="w-5 h-5" />
        <span className="text-[10px]">ওয়ালেট</span>
      </Link>

      {/* 5. Settings */}
      <Link
        to="/settings"
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${
          isSettings ? "text-[#5a32fa] font-bold" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Cog6ToothIcon className="w-5 h-5" />
        <span className="text-[10px]">সেটিংস</span>
      </Link>

    </div>
  );
};

export default UserBottomBar;
