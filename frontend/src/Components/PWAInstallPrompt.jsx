import React, { useState, useEffect } from "react";
import { usePWA } from "../util/usePWA";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

const DISMISS_KEY = "pwa_prompt_dismissed_at";
const DISMISS_DAYS = 7;

const PWAInstallPrompt = () => {
  const { hasNativePrompt, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) {
      setDismissed(false);
      return;
    }
    const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (daysSince >= DISMISS_DAYS) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  };

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setDismissed(true);
    }
  };

  if (!hasNativePrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-fade-in-up">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden">
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-[#4d28e2] to-indigo-600"></div>

        <img
          src="/avater-192.png"
          alt="CNP Promo App"
          className="w-12 h-12 rounded-xl border border-gray-200/80 shadow-xs object-cover shrink-0"
        />

        <div className="flex-1 min-w-0 pr-6">
          <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">
            Install CNP Promo App
          </h4>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Add to Home Screen for faster access and smoother experience
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4d28e2] hover:bg-[#3d1bc8] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Dismiss"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
