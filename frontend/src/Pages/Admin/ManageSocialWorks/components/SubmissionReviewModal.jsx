import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import {
  ClockIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import { Modal, DetailTile, StatusPill } from "../../../../Components/AdminLayout/_Ui/AdminUI";

const SubmissionReviewModal = ({ submit, onClose, onSuccess }) => {
  const [busy, setBusy] = useState(null); // "approve" | "reject"
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const work = submit?.workId;
  const user = submit?.userId;
  const isPending = ["PENDING", "pending"].includes(submit?.status);
  const isApproved = ["APPROVED", "completed"].includes(submit?.status);
  const isRejected = ["REJECTED", "rejected"].includes(submit?.status);

  const screenshots =
    submit?.proofData?.screenshots || (submit?.proofImage ? [submit.proofImage] : []);

  const run = async (kind, fn, successMessage) => {
    try {
      setBusy(kind);
      await fn();
      toast.success(successMessage);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = () =>
    run(
      "approve",
      () => api.put(`social-works/review/${submit._id}`, { status: "APPROVED" }),
      `Approved — ৳${(submit.netAmount || work?.price || 0).toFixed(2)} credited to worker`
    );

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return toast.error("Please provide a reason for rejecting this submission");
    }
    return run(
      "reject",
      () =>
        api.put(`social-works/review/${submit._id}`, {
          status: "REJECTED",
          rejectionReason: rejectReason.trim(),
        }),
      "Submission rejected"
    );
  };

  return (
    <>
      <Modal
        title="Review Worker Submission"
        subtitle={
          <span className="flex items-center gap-2">
            <span className="truncate max-w-sm">{work?.title || "Task Submission"}</span>
            <StatusPill tone={isApproved ? "green" : isRejected ? "red" : "amber"}>
              {submit?.status}
            </StatusPill>
          </span>
        }
        onClose={onClose}
        footer={
          isPending ? (
            <div className="w-full space-y-3">
              {showRejectBox ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection (e.g. invalid screenshot)"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outlined"
                      color="red"
                      fullWidth
                      size="sm"
                      onClick={handleReject}
                      disabled={Boolean(busy)}
                      className="normal-case text-xs rounded-xl"
                    >
                      {busy === "reject" ? "Rejecting…" : "Confirm Rejection"}
                    </Button>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => setShowRejectBox(false)}
                      className="normal-case text-xs text-gray-500 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="outlined"
                    color="red"
                    fullWidth
                    className="normal-case rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold"
                    onClick={() => setShowRejectBox(true)}
                    disabled={Boolean(busy)}
                  >
                    <XCircleIcon className="w-4 h-4" />
                    <span>Reject</span>
                  </Button>
                  <Button
                    fullWidth
                    className="normal-case rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 text-xs font-bold"
                    onClick={handleApprove}
                    disabled={Boolean(busy)}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Approve & Pay ৳{(submit.netAmount || work?.price || 0).toFixed(2)}</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center w-full">
              This submission was already marked as {submit?.status}.
            </p>
          )
        }
      >
        <div className="space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailTile label="Worker">
              <span className="flex items-center gap-1.5 font-bold text-gray-900">
                <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{user?.name || "—"}</span>
              </span>
              {user?.username && <p className="text-[11px] text-gray-400 mt-0.5">@{user.username}</p>}
            </DetailTile>

            <DetailTile label="Net Payout">
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                <BanknotesIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>৳{(submit.netAmount || work?.price || 0).toFixed(2)}</span>
              </span>
              {submit.platformFee > 0 && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Platform Fee: ৳{submit.platformFee.toFixed(2)}
                </p>
              )}
            </DetailTile>

            <DetailTile label="Platform & Action">
              <span className="font-bold text-gray-800 capitalize">
                {work?.platform || "—"} ({work?.actionType || "task"})
              </span>
            </DetailTile>

            <DetailTile label="Submitted At">
              <span className="flex items-center gap-1 text-gray-600">
                <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                <span>{moment(submit.createdAt).format("MMM D, YYYY · h:mm A")}</span>
              </span>
            </DetailTile>
          </div>

          {/* Target URL */}
          {(work?.taskUrl || work?.url) && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500 truncate max-w-xs font-mono text-[11px]">
                {work.taskUrl || work.url}
              </span>
              <a
                href={work.taskUrl || work.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-bold shrink-0"
              >
                <span>Open Link</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Worker's Text Proof */}
          {submit?.proofData?.text && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-gray-700 block">Worker's Text Response:</span>
              <p className="text-gray-900 font-mono text-xs whitespace-pre-wrap">
                {submit.proofData.text}
              </p>
            </div>
          )}

          {/* Watched Seconds if Applicable */}
          {submit?.proofData?.watchedSeconds > 0 && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-sky-600" />
              <span>Watched {submit.proofData.watchedSeconds} seconds</span>
            </div>
          )}

          {/* Submitted Screenshots */}
          {screenshots.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-gray-700 block">
                Proof Screenshots ({screenshots.length}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {screenshots.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative group cursor-pointer hover:border-teal-500 transition-all"
                  >
                    <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      Click to Zoom
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Note */}
          {isRejected && submit?.rejectionReason && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
              <strong>Rejection Reason:</strong> {submit.rejectionReason}
            </div>
          )}
        </div>
      </Modal>

      {/* Screenshot Lightbox Modal */}
      {selectedImage && (
        <Dialog
          open={Boolean(selectedImage)}
          handler={() => setSelectedImage(null)}
          size="lg"
          className="bg-transparent shadow-none p-0 overflow-hidden"
        >
          <div className="relative p-2 bg-black/95 rounded-2xl flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Proof full view"
              className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain mt-6"
            />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default SubmissionReviewModal;
