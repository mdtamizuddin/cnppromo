import React, { useEffect } from "react";
import { Button } from "@material-tailwind/react";
import {
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * Reusable Delete Confirmation Modal
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when cancelled or closed
 * @param {function} onConfirm - Callback when delete is confirmed
 * @param {string} title - Header title (defaults to "Confirm Deletion")
 * @param {string|React.ReactNode} message - Warning message description
 * @param {string} itemName - Name of the item being deleted (highlighted)
 * @param {React.ReactNode} itemPreview - Optional preview widget / badge
 * @param {string} confirmText - Confirm button text (default "Delete")
 * @param {string} cancelText - Cancel button text (default "Cancel")
 * @param {boolean} loading - Loading state for async deletion
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message,
  itemName,
  itemPreview,
  confirmText = "Delete Now",
  cancelText = "Cancel",
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 transition-opacity animate-fadeIn"
        onClick={() => !loading && onClose?.()}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          className="pointer-events-auto w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn flex flex-col"
        >
          {/* Header Close Icon */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              Danger Zone
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 text-center space-y-4">
            {/* Animated Warning / Trash Badge */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500/10 via-red-500/20 to-orange-500/10 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-inner">
              <TrashIcon className="w-8 h-8 stroke-[1.8] animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-gray-900 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed px-2">
                {message ||
                  "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান? এই অ্যাকশনটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।"}
              </p>
            </div>

            {/* Item Preview Card */}
            {(itemName || itemPreview) && (
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-left flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {itemPreview}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                      Target Item
                    </span>
                    <span className="text-sm font-black text-gray-900 truncate block">
                      {itemName}
                    </span>
                  </div>
                </div>

                <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="p-6 pt-0 flex items-center gap-3">
            <Button
              type="button"
              variant="outlined"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50 normal-case text-xs font-bold shadow-none"
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white normal-case text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
