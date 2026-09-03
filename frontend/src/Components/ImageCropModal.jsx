import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * ImageCropModal - Interactive 1:1 circular/square image cropper before upload.
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {File|string} imageSource - The File or object URL to crop
 * @param {function} onClose - Cancel callback
 * @param {function} onCropComplete - Callback with the resulting cropped Blob (blob) => void
 * @param {boolean} [loading] - Loading indicator during upload
 */
export const ImageCropModal = ({
  isOpen,
  imageSource,
  onClose,
  onCropComplete,
  loading = false,
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const BASE_CROP_SIZE = 360;

  // Convert File to Object URL if needed
  useEffect(() => {
    if (!imageSource) {
      setImageSrc(null);
      return;
    }

    if (typeof imageSource === "string") {
      setImageSrc(imageSource);
      return;
    }

    if (imageSource instanceof File || imageSource instanceof Blob) {
      const url = URL.createObjectURL(imageSource);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageSource]);

  // Reset transform state when image loads
  const handleImageLoad = (e) => {
    const { naturalWidth: nw, naturalHeight: nh } = e.target;
    setNaturalWidth(nw);
    setNaturalHeight(nh);

    // Keep on original scale (1.0) by default
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Dragging handlers (Mouse + Touch)
  const handlePointerDown = (e) => {
    if (loading) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || loading) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Perform crop calculation on HTML5 Canvas
  const handleCrop = useCallback(() => {
    if (!imageRef.current || !naturalWidth || !naturalHeight) return;

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    const outputSize = 512; // 512x512 high resolution avatar
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Enable high quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cropSize = containerRef.current?.clientWidth || BASE_CROP_SIZE;

    // Compute display size in viewport
    const displayedWidth = img.width * scale;
    const displayedHeight = img.height * scale;

    // Center point in crop viewport
    const cropCenterX = cropSize / 2;
    const cropCenterY = cropSize / 2;

    // Calculate source rect in natural image dimensions
    const ratioX = naturalWidth / displayedWidth;
    const ratioY = naturalHeight / displayedHeight;

    const sourceCropWidth = cropSize * ratioX;
    const sourceCropHeight = cropSize * ratioY;

    // Offset in natural image coordinates
    const sourceX = (displayedWidth / 2 - cropCenterX - position.x) * ratioX;
    const sourceY = (displayedHeight / 2 - cropCenterY - position.y) * ratioY;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceCropWidth,
      sourceCropHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete?.(blob);
        }
      },
      "image/webp",
      0.9
    );
  }, [naturalWidth, naturalHeight, scale, position, onCropComplete]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose?.()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-7 z-10 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Crop Profile Photo</h3>
            <p className="text-xs text-gray-500">Drag to reposition and use slider to zoom</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Cropper Area */}
        <div
          ref={containerRef}
          style={{ width: "360px", height: "360px" }}
          className="relative mx-auto max-w-[82vw] max-h-[82vw] aspect-square rounded-full overflow-hidden border-4 border-primary shadow-inner bg-gray-900 cursor-move select-none touch-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="To crop"
            onLoad={handleImageLoad}
            draggable={false}
            className="absolute max-w-none pointer-events-none select-none transition-transform duration-75 ease-out"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />

          {/* Grid Overlay Guide */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>
        </div>

        {/* Zoom Slider Control */}
        <div className="mt-6 px-4 flex items-center gap-3">
          <MagnifyingGlassMinusIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.02"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <MagnifyingGlassPlusIcon className="w-4 h-4 text-gray-400 shrink-0" />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-teal-600 hover:opacity-95 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Crop & Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
