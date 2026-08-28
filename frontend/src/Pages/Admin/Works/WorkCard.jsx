import React, { useState } from "react";
import { Card, Button, IconButton, Tooltip } from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  VideoCameraIcon,
  SparklesIcon,
  CheckBadgeIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";
import { Modal } from "antd";
import WorkDetails from "./WorkDetails";
import LinkifyText from "../../../util/linkify";
import { api } from "../../../util/axios";

const WorkCard = ({ data, refetch }) => {
  const [showDetails, setShowDetails] = useState(false);



  const hasVideo =
    data?.link &&
    (data.link.includes("youtube") ||
      data.link.includes("youtu.be") ||
      data.link.includes("vimeo") ||
      data.link.includes("dailymotion") ||
      data.link.includes("facebook"));

  const getCategoryStyles = (cat) => {
    const lower = (cat || "").toLowerCase();
    if (lower.includes("youtube")) return { bg: "bg-red-50 text-red-600 border-red-100", icon: "▶️" };
    if (lower.includes("facebook")) return { bg: "bg-blue-50 text-[#1877f2] border-blue-100", icon: "📱" };
    if (lower.includes("tiktop") || lower.includes("tiktok")) return { bg: "bg-rose-50 text-rose-600 border-rose-100", icon: "🎵" };
    if (lower.includes("likefollow")) return { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: "👍" };
    if (lower.includes("payup")) return { bg: "bg-purple-50 text-purple-600 border-purple-100", icon: "🎬" };
    if (lower.includes("bux")) return { bg: "bg-amber-50 text-amber-600 border-amber-100", icon: "🪙" };
    if (lower.includes("vk")) return { bg: "bg-sky-50 text-sky-600 border-sky-100", icon: "🌐" };
    return { bg: "bg-indigo-50 text-[#5a32fa] border-indigo-100", icon: "💼" };
  };

  const catStyle = getCategoryStyles(data?.category);

  return (
    <Card className="p-5 sm:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
      
      {/* Details Lightbox Modal */}
      <Modal
        open={showDetails}
        onOk={() => setShowDetails(false)}
        onCancel={() => setShowDetails(false)}
        footer={null}
        title={null}
        loading={!data}
        centered
        width={750}
        className="rounded-3xl overflow-hidden p-0"
      >
        <WorkDetails data={data} onClose={() => setShowDetails(false)} />
      </Modal>


      <div className="space-y-3">
        {/* Video Player or Brand Hero Area */}
        {hasVideo ? (
          <div className="rounded-2xl overflow-hidden shadow-inner bg-black aspect-video relative group/player">
            <ReactPlayer
              url={data.link}
              width="100%"
              height="100%"
              controls
              light={false}
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50/50 to-blue-50 p-6 flex flex-col items-center justify-center text-center border border-indigo-100/50 aspect-video">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl mb-2 text-[#5a32fa]">
              {catStyle.icon}
            </div>
            <p className="text-xs font-bold text-gray-700">{data?.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">গাইড ও কাজের নির্দেশিকা</p>
          </div>
        )}

        {/* Top Tag Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {data?.category && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${catStyle.bg}`}
            >
              <span>{catStyle.icon}</span>
              <span>{data.category}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckBadgeIcon className="w-3.5 h-3.5" />
            <span>ভেরিফাইড টিউটোরিয়াল</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-black text-[#0b0c2a] group-hover:text-[#5a32fa] transition-colors leading-snug">
          <LinkifyText text={data?.name} />
        </h2>

        {/* Description */}
        <div className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
          <LinkifyText text={data?.desc} />
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-3">
        {data?.link && (
          <a
            href={data.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5a32fa] hover:bg-[#4b26e0] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            <span>কাজের লিংক</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Work Details Modal Trigger */}
        <Button
          fullWidth
          variant="outlined"
          color="indigo"
          onClick={() => setShowDetails(true)}
          className="border-[#5a32fa] text-[#5a32fa] flex items-center justify-center gap-2 hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-100 normal-case font-bold transition-all py-2.5 sm:py-3 text-xs"
        >
          <BookOpenIcon className="w-4 h-4" />
          <span>বিস্তারিত কাজের নিয়মাবলি</span>
        </Button>
      </div>
    </Card>
  );
};

export default WorkCard;