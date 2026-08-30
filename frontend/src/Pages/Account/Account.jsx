import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
} from "@heroicons/react/24/outline";

const Account = () => {
  const location = useLocation();
  const isWithdraw = location.pathname.includes("/withdraw");

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-4 sm:pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        
        {/* 🏷️ Top Navigation Switcher Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-gray-200/80 shadow-sm gap-1.5">
            <Link
              to="/user/account/withdraw"
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isWithdraw
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ArrowUpRightIcon className="w-4 h-4 stroke-[2.5]" />
              <span>টাকা উত্তোলন (Withdraw)</span>
            </Link>

            <Link
              to="/user/account"
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isWithdraw
                  ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ArrowDownLeftIcon className="w-4 h-4 stroke-[2.5]" />
              <span>টপ-আপ ব্যালেন্স (Top Up)</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Content (TopUp or Withdraw) */}
        <Outlet />

      </div>
    </div>
  );
};

export default Account;