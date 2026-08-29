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
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <video
        controls
        autoPlay
        className="mt-1 rounded-xl w-full max-w-[280px] bg-black"
        style={{ aspectRatio: "16 / 10" }}
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label="Play video"
      className="relative mt-1 w-full max-w-[280px] rounded-xl overflow-hidden bg-gray-900/90 group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
      style={{ aspectRatio: "16 / 10" }}
    >
      {/* Poster frames aren't stored, so the first frame stands in for the thumbnail. */}
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/95 shadow-lg
            transition-transform duration-200 group-hover:scale-105"
        >
          <PlayIcon className="w-5 h-5 text-gray-900 ml-0.5" />
        </span>
      </span>
    </button>
  );
};
