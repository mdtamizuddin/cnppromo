import React from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

// Custom Headset SVG Icon for 24/7 Support
const HeadphoneIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a9 9 0 0 0-9 9v3.75a3 3 0 0 0 3 3h1.5a1.5 1.5 0 0 0 1.5-1.5v-4.5a1.5 1.5 0 0 0-1.5-1.5H4.5A7.5 7.5 0 0 1 12 3a7.5 7.5 0 0 1 7.5 7.5h-3a1.5 1.5 0 0 0-1.5 1.5v4.5a1.5 1.5 0 0 0 1.5 1.5H18a3 3 0 0 0 3-3V10.5a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const featureList = [
  {
    id: 1,
    title: "বিশ্বস্ত ও নিরাপদ প্ল্যাটফর্ম",
    description:
      "আপনার তথ্য ও আয়ের নিরাপত্তা আমাদের সর্বোচ্চ অগ্রাধিকার। ১০০% নিরাপদ ও নির্ভরযোগ্য প্ল্যাটফর্ম।",
    icon: ShieldCheckIcon,
  },
  {
    id: 2,
    title: "সহজ কাজ, সহজ ইনকাম",
    description:
      "সিম্পল টাস্ক, অফার, সার্ভে, ভিডিও দেখা ইত্যাদি করে সহজেই আয় করার সুযোগ পাবেন।",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    id: 3,
    title: "রেফার করুন, বেশি আয় করুন",
    description:
      "বন্ধুদের রেফার করে তাদের আয় থেকে কমিশন আয় করুন। মাল্টি-জেনারেশন রেফারেল সিস্টেম।",
    icon: UserGroupIcon,
  },
  {
    id: 4,
    title: "দ্রুত ও নির্ভরযোগ্য পেমেন্ট",
    description:
      "নির্ধারিত ন্যূনতম ব্যালেন্স পূরণ হলে দ্রুত পেমেন্ট পান। নিরাপদ পেমেন্ট নেটওয়ার্ক দিয়ে পেমেন্ট করা হয়।",
    icon: WalletIcon,
  },
  {
    id: 5,
    title: "২৪/৭ সাপোর্ট",
    description:
      "আমাদের সাপোর্ট টিম ২৪/৭ আপনার পাশে আছে। যেকোনো সমস্যায় দ্রুত সহায়তা পান।",
    icon: HeadphoneIcon,
  },
  {
    id: 6,
    title: "লাইফটাইম আয়ের সুযোগ",
    description:
      "একবার কাজ শেখার পর আপনি লাইফটাইম ইনকাম করতে পারবেন। সীমাহীন আয়ের সুযোগ।",
    icon: ArrowTrendingUpIcon,
  },
];

const Features = () => {
  return (
    <div className="bg-[#f8faff] min-h-screen pb-20">
      {/* 🌟 Top Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-indigo-50/60 bg-gradient-to-b from-white via-indigo-50/30 to-[#f8faff]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-teal-200/60 text-primary text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                ফিচারসমূহ
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b0c2a] leading-tight tracking-tight">
                কেন{" "}
                <span className="text-primary">
                  CNP-PROMO
                </span>{" "}
                সেরা?
              </h1>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                আমরা এমন একটি প্ল্যাটফর্ম তৈরি করেছি যেখানে আপনি সহজে ইনকাম করতে পারবেন,
                নিরাপদে পেমেন্ট পাবেন এবং নিজের দক্ষতা ও নেটওয়ার্ক দিয়ে আরও বেশি আয় করতে
                পারবেন।
              </p>
            </div>

            {/* Right Hero Graphic */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-64 sm:w-80 lg:w-96 aspect-square">
                {/* Ambient glow background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/30 to-blue-400/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <img
                  src="/payment_proof_hero.jpg"
                  alt="CNP-PROMO Features"
                  className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-3xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 💎 6 Main Feature Cards Grid */}
      <section className="container mx-auto px-4 max-w-7xl mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featureList.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.id}
                className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center group"
              >
                {/* Circular Purple Icon Badge */}
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  <IconComponent className="w-8 h-8 transition-transform group-hover:scale-110" />
                </div>

                {/* Title */}
                <Typography
                  variant="h5"
                  className="text-[#0b0c2a] font-bold text-lg sm:text-xl mb-3 tracking-tight group-hover:text-primary transition-colors"
                >
                  {item.title}
                </Typography>

                {/* Description */}
                <Typography className="text-gray-500 text-xs sm:text-sm leading-relaxed font-normal">
                  {item.description}
                </Typography>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 📊 Dark Navy Stats Bar */}
      <section className="container mx-auto px-4 max-w-7xl mt-14">
        <div className="bg-gradient-to-r from-[#0b0c3a] via-[#101452] to-[#0b0c3a] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-indigo-900/30 text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center p-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white">
                <UserGroupIcon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">135,490+</p>
              <p className="text-xs text-gray-300 font-medium mt-1">মোট ব্যবহারকারী</p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center p-2 pt-6 sm:pt-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white">
                <UserPlusIcon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">111,562+</p>
              <p className="text-xs text-gray-300 font-medium mt-1">সক্রিয় ব্যবহারকারী</p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center p-2 pt-6 sm:pt-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white">
                <BanknotesIcon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">7,734,598+</p>
              <p className="text-xs text-gray-300 font-medium mt-1">সম্পূর্ণ উইথড্রল</p>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center justify-center p-2 pt-6 sm:pt-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white">
                <CheckBadgeIcon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">100%</p>
              <p className="text-xs text-gray-300 font-medium mt-1">নিরাপদ ও বিশ্বস্ত</p>
            </div>

          </div>
        </div>
      </section>

      {/* 🎁 Call to Action (CTA) Banner */}
      <section className="container mx-auto px-4 max-w-7xl mt-10">
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50/50 to-sky-50/40 rounded-3xl p-6 sm:p-8 lg:p-10 border border-teal-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Icon + Text */}
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            {/* Gift Box Icon */}
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0 text-3xl">
              🎁
            </div>
            
            <div className="space-y-1">
              <Typography variant="h4" className="text-[#0b0c2a] font-extrabold text-xl sm:text-2xl">
                আজই যোগ দিন, আর দেরি নয়!
              </Typography>
              <Typography className="text-gray-600 text-xs sm:text-sm font-normal">
                সহজ কাজ করে ঘরে বসে আয় করুন এবং নিজের স্বপ্ন পূরণের পথে এগিয়ে যান।
              </Typography>
            </div>
          </div>

          {/* Right CTA Button */}
          <Link to="/register" className="shrink-0 w-full md:w-auto">
            <Button className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white normal-case font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105">
              <span>আজই যোগ দিন</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>

        </div>
      </section>
    </div>
  );
};

export default Features;
