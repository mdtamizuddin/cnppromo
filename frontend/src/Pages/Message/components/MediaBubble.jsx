import React, { useState } from "react";
import { Image } from "antd";
import { PlayIcon } from "@heroicons/react/24/solid";

/**
 * Image and video attachments.
 *
 * Both reserve their box before the asset arrives, so a thread doesn't reflow
 * and jump the scroll position as media loads in above the viewport.
 */

export const ImageBubble = ({ src }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative mt-1 overflow-hidden rounded-xl bg-gray-100 max-w-[260px]">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200/70" />}
      <Image
        src={src}
        rootClassName="block"
        className="rounded-xl"
        style={{ maxWidth: "100%", display: "block" }}
        onLoad={() => setLoaded(true)}
        preview={{ mask: null }}
      />
    </div>
  );
};

export const VideoBubble = ({ src }) => {
  const [error, setError] = useState(false);

  if (!src) return null;

  if (error) {
    return (
      <div className="mt-1 p-3 rounded-xl bg-gray-900 text-white text-xs max-w-[280px] space-y-1">
        <p className="text-gray-300">ভিডিও লোড করা যায়নি</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-400 hover:underline font-bold inline-block"
        >
          সরাসরি দেখুন ↗
        </a>
      </div>
    );
  }

  return (
    <div className="relative mt-1 overflow-hidden rounded-2xl bg-black max-w-[320px] shadow-md border border-black/10">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="w-full h-auto max-h-[320px] rounded-2xl object-contain bg-black"
        onError={() => setError(true)}
      >
        <source src={src} />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};

