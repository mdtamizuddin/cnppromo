import React from "react";
import ReactPlayer from "react-player";
import LinkifyText from "../../../util/linkify";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  XMarkIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { Button, IconButton } from "@material-tailwind/react";

const WorkDetails = ({ data, onClose }) => {
  const hasVideo =
    data?.link &&
    (data.link.includes("youtube") ||
      data.link.includes("youtu.be") ||
      data.link.includes("vimeo") ||
      data.link.includes("dailymotion") ||
      data.link.includes("facebook"));

  const getCategoryStyles = (cat) => {
    const lower = (cat || "").toLowerCase();
    if (lower.includes("youtube")) return { label: "YouTube Video Views", icon: "▶️", color: "bg-red-50 text-red-600 border-red-200" };
    if (lower.includes("facebook")) return { label: "Facebook Post Task", icon: "📱", color: "bg-blue-50 text-[#1877f2] border-blue-200" };
    if (lower.includes("tiktop") || lower.includes("tiktok")) return { label: "TikTok Task", icon: "🎵", color: "bg-rose-50 text-rose-600 border-rose-200" };
    if (lower.includes("likefollow")) return { label: "Like Follow (Getlike)", icon: "👍", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };
    if (lower.includes("payup")) return { label: "Payup Video Views", icon: "🎬", color: "bg-purple-50 text-purple-600 border-purple-200" };
    if (lower.includes("bux")) return { label: "Bux Money", icon: "🪙", color: "bg-amber-50 text-amber-600 border-amber-200" };
    if (lower.includes("vk")) return { label: "VK Surfing", icon: "🌐", color: "bg-sky-50 text-sky-600 border-sky-200" };
    return { label: cat || "Micro Task", icon: "💼", color: "bg-indigo-50 text-[#5a32fa] border-indigo-200" };
  };

  const catStyle = getCategoryStyles(data?.category);

  return (
    <div className="space-y-5 p-2 sm:p-4">
      
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${catStyle.color}`}>
            <span>{catStyle.icon}</span>
            <span>{catStyle.label}</span>
          </span>
          <h2 className="text-lg sm:text-xl font-black text-[#0b0c2a] leading-snug">
            <LinkifyText text={data?.name} />
          </h2>
        </div>

        {onClose && (
          <IconButton variant="text" size="sm" onClick={onClose} className="rounded-full">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </IconButton>
        )}
      </div>

      {/* Video Player */}
      {hasVideo ? (
        <div className="rounded-2xl overflow-hidden shadow-lg bg-black aspect-video relative">
          <ReactPlayer
            url={data?.link}
            width="100%"
            height="100%"
            controls
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-6 flex items-center justify-center gap-3 border border-purple-100">
          <VideoCameraIcon className="w-8 h-8 text-[#5a32fa]" />
          <span className="text-xs font-bold text-gray-700">টিউটোরিয়াল ও কাজের বিবরণ নিচে প্রদত্ত হলো</span>
        </div>
      )}

      {/* Step-by-Step Instructions */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white border border-indigo-100 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#5a32fa]">
          <CheckCircleIcon className="w-4 h-4" />
          <span>কাজের নিয়ম ও নির্দেশাবলি:</span>
        </div>

        <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed pl-1">
          <LinkifyText text={data?.desc || "নির্দেশনা অনুযায়ী লিংকে প্রবেশ করে কাজটি সম্পন্ন করুন।"} />
        </div>
      </div>

      {/* Important Advisory */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
        <LightBulbIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">সতর্কতা ও পরামর্শ:</p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            ভিডিও টিউটোরিয়ালটি মনোযোগ দিয়ে দেখে সঠিক প্রুফ প্রদান করুন। ভুল বা ফেক তথ্য দিলে একাউন্ট সাসপেন্ড হতে পারে।
          </p>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        {onClose && (
          <Button
            variant="text"
            onClick={onClose}
            className="normal-case text-xs text-gray-600"
          >
            বন্ধ করুন
          </Button>
        )}

        {data?.link && (
          <a
            href={data.link}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto ml-auto"
          >
            <Button
              className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <span>সরাসরি কাজের প্ল্যাটফর্মে প্রবেশ করুন</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};

export default WorkDetails;