import React from "react";
import ReactPlayer from "react-player";
import LinkifyText from "../../../util/linkify";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const WorkDetails = ({ data }) => {
  const hasVideo = data?.link && (data.link.includes("youtube") || data.link.includes("youtu.be") || data.link.includes("vimeo"));

  return (
    <div className="space-y-4 py-2">
      {hasVideo && (
        <div className="rounded-2xl overflow-hidden shadow-md bg-black aspect-video">
          <ReactPlayer url={data?.link} width="100%" height="100%" controls />
        </div>
      )}

      <div>
        {data?.category && (
          <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-purple-50 text-[#5a32fa] border border-purple-100 mb-2">
            {data.category}
          </span>
        )}
        <h2 className="text-lg font-bold text-[#0b0c2a] leading-tight">
          <LinkifyText text={data?.name} />
        </h2>
      </div>

      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
        <LinkifyText text={data?.desc} />
      </div>

      {data?.link && (
        <div className="pt-2 text-right">
          <a
            href={data.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5a32fa] hover:bg-[#4b26e0] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <span>সরাসরি কাজের লিংকে প্রবেশ করুন</span>
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default WorkDetails;