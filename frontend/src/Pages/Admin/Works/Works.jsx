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
  const { user } = useSelector((state) => state.user);
  const [showAdminForm, setShowAdminForm] = useState(false);

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-bold tracking-wide">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Task Directories & Earning Hub</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                কাজের ক্যাটাগরি ও গাইডলাইন{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  (Task Categories)
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                প্রতিটি ক্যাটাগরির বিস্তারিত ভিডিও টিউটোরিয়াল ও নিয়মাবলি দেখে কাজ শুরু করুন। আন্তর্জাতিক প্ল্যাটফর্মগুলো থেকে সরাসরি ঘরে বসে ইনকাম করুন।
              </p>

              {/* Highlights pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> ৮+ শীর্ষ প্ল্যাটফর্ম
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> ১০০% ভিডিও গাইড
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> ইনস্ট্যান্ট কাজ শুরু
                </div>
              </div>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-44 sm:w-52 lg:w-60 aspect-square">
                <img
                  src="/works_hero_illustration.jpg"
                  alt="Task Categories"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 👑 Admin Manage Panel (If Admin) */}
        {user?.role === "admin" && (
          <Card className="p-5 sm:p-6 bg-white rounded-3xl border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#5a32fa] animate-pulse"></span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Manage Category Works</h2>
                  <p className="text-xs text-gray-500">Add or manage tutorials and task links in categories</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAdminForm(!showAdminForm)}
                className="bg-[#5a32fa] normal-case text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                {showAdminForm ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Hide Form</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>+ Add New Work</span>
                  </>
                )}
              </Button>
            </div>

            {showAdminForm && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Form />
              </div>
            )}
          </Card>
        )}

        {/* 🎴 Category Directory Grid */}
        <AllWorks />

      </div>
    </div>
  );
};

export default Works;