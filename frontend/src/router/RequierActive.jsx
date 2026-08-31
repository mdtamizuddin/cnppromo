import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import {
  EnvelopeIcon,
  BellIcon,
  InformationCircleIcon,
  HomeIcon,
  WalletIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const RequierActive = () => {

  const benefits = [
    {
      title: "সহজে আয়ের সুযোগ",
      description: "সহজ কাজ করে প্রতিদিন আয় করুন।",
      icon: WalletIcon,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "নিরাপদ ও নির্ভরযোগ্য",
      description: "আপনার তথ্য ও আয় সম্পূর্ণ নিরাপদ।",
      icon: ShieldCheckIcon,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      title: "রিয়েল টাইম পেমেন্ট",
      description: "দ্রুত পেমেন্ট ও ট্রান্সপারেন্ট সিস্টেম।",
      icon: ChartBarIcon,
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      title: "রেফার করে বেশি আয়",
      description: "বন্ধুদের রেফার করে বাড়তি ইনকাম করুন।",
      icon: UserGroupIcon,
      iconBg: "bg-pink-100 text-pink-600",
    },
  ];

  const trustStats = [
    {
      icon: UserGroupIcon,
      number: "135,490+",
      label: "মোট ব্যবহারকারী",
    },
    {
      icon: WalletIcon,
      number: "7,734,598+",
      label: "মোট পেমেন্ট",
    },
    {
      icon: ShieldCheckIcon,
      number: "100%",
      label: "নিরাপদ ও নির্ভরযোগ্য",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      number: "২৪/৭",
      label: "সাপোর্ট সুবিধা",
    },
  ];

  return (
    <div className="bg-[#f8faff] min-h-screen py-10 px-4 flex flex-col justify-between">
      <div className="container mx-auto max-w-5xl space-y-12">
        
        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          
          {/* Left Column: Main Approval Waiting Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5 text-center">
              
              {/* Top 3D Illustration */}
              <div className="flex justify-center">
                <div className="relative w-44 sm:w-52 aspect-square">
                  <img
                    src="/pending_approval_illustration.jpg"
                    alt="Registration Pending Approval"
                    className="w-full h-full object-contain drop-shadow-md rounded-2xl"
                  />
                </div>
              </div>

              {/* Headings */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0b0c2a] tracking-tight">
                  রেজিস্ট্রেশন সফল!
                </h1>
                <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-teal-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                  অ্যাডমিন অ্যাক্টিভ অপেক্ষা...
                </h2>
              </div>

              {/* Amber Notice Box */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-base">
                  ⏳
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে। আপনার একাউন্টটি অ্যাডমিন অ্যাপ্রুভ করবে, অনুমোদনের পর আপনার একাউন্টটি অ্যাক্টিভ করা হবে{" "}
                  <strong className="text-rose-600 font-bold">সর্বোচ্চ ২৪ ঘণ্টার মধ্যে</strong>।
                  ততক্ষণ পর্যন্ত অনুগ্রহ করে অপেক্ষা করুন।
                </p>
              </div>

              {/* Notification & Service Strips */}
              <div className="bg-[#fbfcff] border border-teal-50/80 rounded-2xl p-3 sm:p-4 divide-y divide-gray-100 text-left space-y-3">
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b0c2a]">
                      ইমেইল নোটিফিকেশন পাবেন
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      আপনার একাউন্ট অ্যাক্টিভ হলে আপনাকে ইমেইলে জানানো হবে।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                    <BellIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b0c2a]">
                      সার্ভিস সময়
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      অ্যাডমিন অ্যাক্টিভ সম্পন্ন না হওয়া পর্যন্ত আপনি আমাদের সকল সার্ভিস ব্যবহার করতে পারবেন না।
                    </p>
                  </div>
                </div>
              </div>

              {/* Blue Info Notice */}
              <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-100 rounded-xl px-3 py-2 text-left">
                <InformationCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-[11px] text-blue-700 font-medium">
                  দয়া করে ইনবক্স এবং স্প্যাম/প্রোমোশন ফোল্ডার চেক করুন।
                </p>
              </div>

              {/* Return to Home CTA Button */}
              <Link to="/" className="block pt-1">
                <Button className="w-full bg-primary hover:bg-primary-hover text-white normal-case text-xs sm:text-sm font-bold py-3.5 rounded-2xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2">
                  <HomeIcon className="w-4 h-4" />
                  <span>হোমে ফিরে যান</span>
                </Button>
              </Link>

            </div>
          </div>

          {/* Right Column: Platform Features & Benefits */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#0b0c2a]">
                CNP-PROMO-তে যোগ দিলে আপনি পাবেন
              </h3>
            </div>

            <div className="space-y-4">
              {benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${b.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-[#0b0c2a]">
                        {b.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Dark Navy Trust Strip */}
        <div className="rounded-3xl bg-[#0b0c2a] text-white p-6 sm:p-8 shadow-xl border border-indigo-950">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {trustStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`space-y-2 ${idx > 0 ? "pt-4 md:pt-0" : ""}`}>
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white font-mono">
                      {stat.number}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RequierActive;