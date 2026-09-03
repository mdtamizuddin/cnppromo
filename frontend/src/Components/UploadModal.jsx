import React, { useEffect } from "react";
import {
  ArrowUpTrayIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  DocumentIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * UploadModal - A modern, responsive modal showing upload progress and status.
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {string} fileName - Name of the file being uploaded
 * @param {string} fileType - 'image' | 'video' | 'audio' | 'file'
 * @param {number} progress - Progress percentage (0 - 100)
 * @param {string} [statusText] - Status message (e.g. "Optimizing...", "Uploading...")
 */
export const UploadModal = ({
  isOpen,
  fileName = "File",
  fileType = "image",
  progress = 0,
  statusText = "Uploading file...",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Select appropriate icon and color theme
  const getIconAndColor = () => {
    switch (fileType) {
      case "image":
        return {
          icon: <PhotoIcon className="w-8 h-8 text-blue-600" />,
          bg: "bg-blue-50 border-blue-100",
          barColor: "from-blue-600 to-indigo-600",
          label: "Image Upload",
        };
      case "video":
        return {
          icon: <VideoCameraIcon className="w-8 h-8 text-purple-600" />,
          bg: "bg-purple-50 border-purple-100",
          barColor: "from-purple-600 to-pink-600",
          label: "Video Upload",
        };
      case "audio":
        return {
          icon: <MicrophoneIcon className="w-8 h-8 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-100",
          barColor: "from-emerald-600 to-teal-600",
          label: "Audio Upload",
        };
      default:
        return {
          icon: <DocumentIcon className="w-8 h-8 text-cyan-600" />,
          bg: "bg-cyan-50 border-cyan-100",
          barColor: "from-cyan-600 to-blue-600",
          label: "File Upload",
        };
    }
  };

  const { icon, bg, barColor, label } = getIconAndColor();
  const isComplete = progress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity animate-fade-in" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-10 animate-fade-in-up">
        {/* Header Icon + Label */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl border ${bg} flex-shrink-0 flex items-center justify-center`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {label}
            </span>
            <h3 className="text-base font-medium text-gray-900 truncate">
              {fileName}
            </h3>
          </div>
          {isComplete && (
            <CheckCircleIcon className="w-7 h-7 text-emerald-500 animate-bounce" />
          )}
        </div>

        {/* Status Line + Percentage */}
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">
            {statusText || (isComplete ? "Completed!" : "Uploading to S3...")}
          </span>
          <span className="text-gray-900 font-bold tabular-nums">
            {Math.min(100, Math.max(0, Math.round(progress)))}%
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-300 ease-out relative`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          >
            {/* Shimmer effect */}
            {!isComplete && (
              <div className="absolute inset-0 bg-white/25 animate-[shimmer_1.5s_infinite] -skew-x-12" />
            )}
          </div>
        </div>

        {/* Uploading indicator note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
          {!isComplete ? (
            <>
              <ArrowUpTrayIcon className="w-4 h-4 animate-bounce text-blue-500" />
              <span>Direct encrypted upload to secure cloud storage</span>
            </>
          ) : (
            <span className="text-emerald-600 font-medium">Upload completed successfully</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
