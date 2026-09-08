import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Button,
  Typography,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import moment from "moment";
import { api } from "../../../util/axios";

const ProviderSubmissionsModal = ({ open, onClose, task }) => {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyActionId, setBusyActionId] = useState(null);

  const { data: submits, isLoading } = useQuery(
    ["provider-task-submits", task?._id],
    async () => {
      const res = await api.get(`social-works/task/${task._id}/submits`);
      return res.data;
    },
    { enabled: open && Boolean(task?._id) }
  );

  const handleApprove = async (submitId) => {
    try {
      setBusyActionId(submitId);
      await api.put(`social-works/review/${submitId}`, { status: "APPROVED" });
      toast.success("Submission approved and reward credited to worker!");
      queryClient.invalidateQueries(["provider-task-submits", task._id]);
      queryClient.invalidateQueries(["my-social-tasks"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve submission");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleReject = async (submitId) => {
    if (!rejectReason.trim()) {
      return toast.error("Please provide a reason for rejection");
    }

    try {
      setBusyActionId(submitId);
      await api.put(`social-works/review/${submitId}`, {
        status: "REJECTED",
        rejectionReason: rejectReason.trim(),
      });
      toast.success("Submission rejected");
      setRejectingId(null);
      setRejectReason("");
      queryClient.invalidateQueries(["provider-task-submits", task._id]);
      queryClient.invalidateQueries(["my-social-tasks"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject submission");
    } finally {
      setBusyActionId(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        handler={onClose}
        size="xl"
        className="max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
      >
        <DialogHeader className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <Typography variant="h6" className="text-gray-900 font-bold">
              Review Submissions
            </Typography>
            <p className="text-xs text-gray-500 font-medium truncate max-w-md">
              Task: {task?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </DialogHeader>

        <DialogBody className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-gray-400 font-medium">
              Loading submissions…
            </div>
          ) : !submits || submits.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-gray-700">No submissions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                When workers complete your task, their proof will appear here for your review.
              </p>
            </div>
          ) : (
            submits.map((sub) => {
              const isPending = ["PENDING", "pending"].includes(sub.status);
              const isApproved = ["APPROVED", "completed"].includes(sub.status);
              const isRejected = ["REJECTED", "rejected"].includes(sub.status);

              const screenshots =
                sub.proofData?.screenshots || (sub.proofImage ? [sub.proofImage] : []);

              return (
                <div
                  key={sub._id}
                  className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-teal-200 transition-all shadow-xs space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                        {sub.userId?.name ? sub.userId.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {sub.userId?.name || sub.userId?.username || "Worker"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {moment(sub.createdAt).format("MMM D, YYYY · h:mm A")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-700"
                            : isRejected
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  {/* Proof Details */}
                  <div className="space-y-2 text-xs">
                    {sub.proofData?.text && (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="font-semibold text-gray-600 block mb-0.5">
                          Worker's Text Proof:
                        </span>
                        <p className="text-gray-800 font-mono text-[11px] whitespace-pre-wrap">
                          {sub.proofData.text}
                        </p>
                      </div>
                    )}

                    {sub.proofData?.watchedSeconds > 0 && (
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-teal-600" />
                        <span>Watched Duration: {sub.proofData.watchedSeconds} seconds</span>
                      </div>
                    )}

                    {/* Screenshot Gallery */}
                    {screenshots.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-600 block mb-1.5 text-[11px]">
                          Submitted Proof Screenshots ({screenshots.length}):
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {screenshots.map((url, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedImage(url)}
                              className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 relative cursor-pointer hover:scale-105 transition-transform bg-gray-50 group"
                            >
                              <img
                                src={url}
                                alt={`Proof ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                Zoom
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isRejected && sub.rejectionReason && (
                      <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-100">
                        <strong>Rejection Reason:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Submissions */}
                  {isPending && (
                    <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-2">
                      {rejectingId === sub._id ? (
                        <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="State reason for rejecting (e.g. invalid screenshot)"
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-400"
                          />
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => handleReject(sub._id)}
                            disabled={busyActionId === sub._id}
                            className="normal-case text-xs px-3 py-1.5 rounded-xl shrink-0"
                          >
                            Confirm Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="normal-case text-xs px-2 py-1.5 text-gray-500 rounded-xl shrink-0"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="red"
                            onClick={() => setRejectingId(sub._id)}
                            disabled={busyActionId === sub._id}
                            className="normal-case text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
                          >
                            <XCircleIcon className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleApprove(sub._id)}
                            disabled={busyActionId === sub._id}
                            className="bg-emerald-600 hover:bg-emerald-700 normal-case text-xs px-4 py-1.5 rounded-xl text-white flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            <span>Approve & Release Payment</span>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </DialogBody>
      </Dialog>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <Dialog
          open={Boolean(selectedImage)}
          handler={() => setSelectedImage(null)}
          size="lg"
          className="bg-transparent shadow-none p-0 overflow-hidden"
        >
          <div className="relative p-2 bg-black/90 rounded-2xl flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Proof full view"
              className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain mt-8"
            />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ProviderSubmissionsModal;
