import React, { useEffect } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { ArrowPathIcon, HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const isChunkError =
    error?.message?.includes("Failed to fetch dynamically imported module") ||
    error?.message?.includes("dynamically imported module") ||
    error?.message?.includes("Loading chunk");

  // Auto-reload once if dynamic import chunk failed after new deployment
  useEffect(() => {
    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem("chunk_reload_attempted");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_attempted", "true");
        window.location.reload();
      }
    }
  }, [isChunkError]);

  const handleReload = () => {
    sessionStorage.removeItem("chunk_reload_attempted");
    window.location.reload();
  };

  const handleGoHome = () => {
    sessionStorage.removeItem("chunk_reload_attempted");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#070818] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400">
          <ExclamationTriangleIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white">
            {is404 ? "Page Not Found (404)" : isChunkError ? "New Version Available" : "Application Error"}
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            {isChunkError
              ? "সিস্টেমের নতুন আপডেট ইন্সটল হয়েছে। লেটেস্ট ভার্সন লোড করতে রিলোড বাটনে ক্লিক করুন।"
              : is404
              ? "আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি অথবা সরিয়ে নেওয়া হয়েছে।"
              : error?.statusText || error?.message || "কিছু একটা ভুল হয়েছে। অনুগ্রহ করে পেজটি রিলোড দিন।"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReload}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <ArrowPathIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Reload Page</span>
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
          >
            <HomeIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
