import React, { useState } from "react";
import Form from "./Form";
import AllWorks from "./AllWorks";
import { useSelector } from "react-redux";
import { Card, Button } from "@material-tailwind/react";
import {
  SparklesIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const Works = () => {
  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#d2fbf0] via-[#e2fbf6] to-[#d6f7ff] p-5 sm:p-8 lg:p-10 border border-teal-100/90 shadow-xs">
          <div className="absolute -right-10 -top-10 w-72 sm:w-96 h-72 sm:h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/4 -bottom-10 w-64 sm:w-80 h-64 sm:h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-[11px] sm:text-xs font-bold tracking-wide">
                <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>Micro Tasks Directory & Earning Hub</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b0c2a] leading-tight tracking-tight">
                কাজের ক্যাটাগরি ও গাইডলাইন{" "}
                <span className="bg-gradient-to-r from-[#0d9488] to-[#0284c7] bg-clip-text text-transparent">
                  (Task Categories)
                </span>
              </h1>

              <p className="text-gray-600 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                প্রতিটি ক্যাটাগরির বিস্তারিত ভিডিও টিউটোরিয়াল ও নিয়মাবলি দেখে কাজ শুরু করুন। আন্তর্জাতিক প্ল্যাটফর্মগুলো থেকে সরাসরি ঘরে বসে ইনকাম করুন।
              </p>

              {/* Highlights pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-teal-100 text-[11px] font-bold text-teal-900 flex items-center gap-1.5 shadow-2xs">
                  <span className="text-teal-600 font-bold">✓</span> ৮+ শীর্ষ প্ল্যাটফর্ম
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-teal-100 text-[11px] font-bold text-teal-900 flex items-center gap-1.5 shadow-2xs">
                  <span className="text-teal-600 font-bold">✓</span> ১০০% ভিডিও গাইড
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-teal-100 text-[11px] font-bold text-teal-900 flex items-center gap-1.5 shadow-2xs">
                  <span className="text-teal-600 font-bold">✓</span> ইনস্ট্যান্ট কাজ শুরু
                </div>
              </div>
            </div>

            {/* Right 3D Illustration - Hidden on mobile */}
            <div className="hidden lg:flex lg:col-span-4 justify-center">
              <div className="relative w-44 sm:w-52 lg:w-60 aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-teal-400/15 rounded-full blur-2xl pointer-events-none"></div>
                <img
                  src="/works_hero_illustration.jpg"
                  alt="Task Categories"
                  className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(13,148,136,0.2)] rounded-2xl hover:scale-105 transition-transform duration-500 relative z-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🎴 Category Directory Grid */}
        <AllWorks />

      </div>
    </div>
  );
};

export default Works;