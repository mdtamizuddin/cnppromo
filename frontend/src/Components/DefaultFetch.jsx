import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookie from "js-cookie";
import { motion } from "framer-motion";
import {
  LockClosedIcon,
  ShieldExclamationIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../util/axios";
import {
  setCurrentUser,
  setSettings,
  setStatistic,
} from "../redux/features/user/userSlice";

const DefaultFetch = () => {
  const dispatch = useDispatch();
  const { refresh, user } = useSelector((state) => state.user);

  useEffect(() => {
    (async () => {
      try {
        const token = Cookie.get("token-you");
        if (token) {
          const res = await api.get("/user/me");
          dispatch(setCurrentUser(res.data));

          const sta = await api.get("/refer/statistic");
          dispatch(setStatistic(sta.data));
        }
        const setting = await api.get("/setting");
        dispatch(setSettings(setting.data.setting));
      } catch (error) {
        console.log(error);
      }
    })();
  }, [refresh]);

  const handleLogout = () => {
    Cookie.remove("token-you");
    window.location.reload();
  };

  return (
    <>
      {user?.lock && (
        <div className="fixed inset-0 z-[9999] bg-[#070818] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans">
          {/* Dynamic Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-600/20 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#5a32fa]/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-center"
          >
            {/* Pulsing Lock Icon */}
            <div className="relative mx-auto mb-7 w-24 h-24 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-600/40 to-amber-600/40 blur-sm"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-rose-500/25 to-red-500/25 border border-rose-500/30"
              />

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900/90 to-[#200c14]/90 border border-rose-500/30 flex items-center justify-center shadow-xl shadow-black/40">
                <LockClosedIcon className="w-8 h-8 text-rose-400" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-[#070818] items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </span>
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Account Suspended
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
              Your Account Is Locked
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto mb-6">
              Access to this account has been temporarily restricted by the administration.
              Please reach out to official support on WhatsApp for assistance and account review.
            </p>

            {/* User Details Strip */}
            {user && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-7 text-left flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Target Account
                  </p>
                  <p className="text-sm font-bold text-gray-200 truncate mt-0.5">
                    {user?.name || "User Account"}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                    {user?.phone || user?.email || user?._id}
                  </p>
                </div>
                <div className="shrink-0 pl-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    <ShieldExclamationIcon className="w-3.5 h-3.5" />
                    Locked
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
              <a
                href="https://wa.me/+8801731686679"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Contact on WhatsApp
              </a>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white font-medium text-sm transition-all duration-200 cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-400" />
                Log Out
              </button>
            </div>

            {/* Footer Notice */}
            <div className="pt-5 border-t border-white/[0.08] flex items-center justify-center gap-2 text-xs text-gray-500">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500/70" />
              <span>Reference support with your registered phone number</span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DefaultFetch;