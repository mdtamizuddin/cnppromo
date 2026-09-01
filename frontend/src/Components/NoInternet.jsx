import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ServerStackIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/outline";
import { api, localUrl, serverUrl } from "../util/axios";

const NoInternet = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const { settings } = useSelector((state) => state.user);

  const supportLink =
    settings?.links?.supportMessanger || "https://wa.me/+8801731686679";

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryFailed(false);
    try {
      const res = await api.get("/setting");
      if (res.status === 200) {
        window.location.reload();
      } else {
        setRetryFailed(true);
      }
    } catch {
      setRetryFailed(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const currentApiEndpoint = isLocal ? localUrl : serverUrl;

  return (
    <div className="relative min-h-screen w-full bg-[#070818] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-rose-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-center"
      >
        {/* Animated Server / Signal Icon */}
        <div className="relative mx-auto mb-7 w-24 h-24 flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/40 to-teal-500/40 blur-sm"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-rose-500/25 to-teal-500/25 border border-rose-500/30"
          />

          {/* Central Glass Disc with Disconnected Server Icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900/90 to-[#042f2e]/90 border border-white/15 flex items-center justify-center shadow-xl shadow-black/40">
            <ServerStackIcon className="w-8 h-8 text-gray-300" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-[#070818] items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </span>
            </span>
          </div>
        </div>

        {/* Offline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Server Unreachable
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
          Server Is Not Running
        </h1>

        {/* Subtitle / Description */}
        <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto mb-7">
          Our backend service is currently offline or undergoing maintenance.
          Please check your internet connection or try reconnecting.
        </p>

        {/* Retry Failure Banner */}
        {retryFailed && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl py-2.5 px-4 mb-5"
          >
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Connection attempt failed. Server is still offline.</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-8">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Checking Server..." : "Try Reconnecting"}
          </button>

          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white font-medium text-sm transition-all duration-200 cursor-pointer"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-400" />
            Contact Support
          </a>
        </div>

        {/* System Diagnostics Footer */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-1.5">
            <SignalSlashIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-mono text-[11px] truncate max-w-[240px]">
              {currentApiEndpoint}
            </span>
          </div>
          <span className="font-mono text-[11px] text-gray-400">
            ERR_CONNECTION_REFUSED
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default NoInternet;