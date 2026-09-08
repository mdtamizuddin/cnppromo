import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Card, Button, Dialog } from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  UserCircleIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import SocialNav from "./components/SocialNav";

const TaskSubmissionsReview = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Fetch submissions for this task
  const { data, isLoading, refetch } = useQuery(
    ["task-submissions", taskId],
    async () => {
      const res = await api.get(`social-works/task/${taskId}/submits`);
      return res.data;
    },
    { enabled: Boolean(taskId) }
  );

  const task = data?.task;
  const rawSubmits = data?.submits || [];

  const filteredSubmits = rawSubmits.filter((s) => {
    if (filterStatus === "all") return true;
    const st = (s.status || "").toLowerCase();
    if (filterStatus === "pending") return st === "pending";
    if (filterStatus === "approved") return st === "approved" || st === "completed";
    if (filterStatus === "rejected") return st === "rejected";
    return true;
  });

  const handleApprove = async (submitId) => {
    try {
      setBusyId(submitId);
      await api.put(`social-works/review/${submitId}`, { status: "APPROVED" });
      toast.success("Submission approved and worker credited!");
      refetch();
      queryClient.invalidateQueries(["my-social-tasks"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (submitId) => {
    if (!rejectReason.trim()) {
      return toast.error("Please enter a reason for rejection");
    }
    try {
      setBusyId(submitId);
      await api.put(`social-works/review/${submitId}`, {
        status: "REJECTED",
        rejectionReason: rejectReason.trim(),
      });
      toast.success("Submission rejected");
      setRejectingId(null);
      setRejectReason("");
      refetch();
      queryClient.invalidateQueries(["my-social-tasks"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        {/* Shared Sub-Navigation Bar */}
        <SocialNav />

        {/* Back button */}
        <button
          onClick={() => navigate("/user/social-works/my-tasks")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to My Campaigns</span>
        </button>

        {/* Task Summary Banner */}
        <Card className="p-5 sm:p-6 rounded-3xl border border-teal-100 bg-white shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 font-extrabold text-xs flex items-center justify-center uppercase">
                {task?.platform?.slice(0, 2) || "SO"}
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-gray-900 line-clamp-1">
                  {task?.title || "Campaign Submissions Review"}
                </h1>
                <p className="text-[11px] text-gray-400">
                  Platform: <strong className="capitalize text-gray-700">{task?.platform}</strong> · Action:{" "}
                  <span className="capitalize text-gray-700">{task?.actionType?.replace("_", " ")}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-xs font-bold text-teal-700">
                  Progress: {task?.completedQuantity || 0} / {task?.targetQuantity || 0}
                </p>
                <p className="text-[10px] text-gray-400">
                  Escrow Remaining: ৳{(task?.escrowRemaining || 0).toFixed(2)}
                </p>
              </div>

              {(task?.taskUrl || task?.url) && (
                <a
                  href={task.taskUrl || task.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-teal-700 font-bold text-xs flex items-center gap-1 border border-gray-200"
                >
                  <span>Target Link</span>
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Submissions Filter */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <span className="text-xs font-bold text-gray-700">
              Submissions ({rawSubmits.length}):
            </span>
            <div className="flex gap-1.5">
              {["all", "pending", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                    filterStatus === st
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Submissions Feed */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-medium">
            Loading submissions…
          </div>
        ) : filteredSubmits.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border border-gray-100 shadow-sm bg-white">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              📬
            </div>
            <h4 className="text-sm font-bold text-gray-800">No submissions found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              When workers complete your campaign, their proof responses will appear here for your review.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmits.map((sub) => {
              const isPending = ["PENDING", "pending"].includes(sub.status);
              const isApproved = ["APPROVED", "completed"].includes(sub.status);
              const isRejected = ["REJECTED", "rejected"].includes(sub.status);
              const screenshots =
                sub.proofData?.screenshots || (sub.proofImage ? [sub.proofImage] : []);

              return (
                <Card
                  key={sub._id}
                  className="p-5 sm:p-6 rounded-3xl border border-gray-200/80 bg-white hover:border-teal-200 transition-all shadow-xs space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center">
                        {sub.userId?.name ? sub.userId.name.charAt(0).toUpperCase() : "W"}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          {sub.userId?.name || sub.userId?.username || "Worker"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {moment(sub.createdAt).format("MMM D, YYYY · h:mm A")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
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

                  {/* Proof Details */}
                  <div className="space-y-3 text-xs">
                    {sub.proofData?.text && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="font-semibold text-gray-600 block mb-0.5">
                          Worker's Text Response:
                        </span>
                        <p className="text-gray-900 font-mono text-[11px] whitespace-pre-wrap">
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
                              className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 relative cursor-pointer hover:scale-105 transition-transform bg-gray-50 group"
                            >
                              <img
                                src={url}
                                alt={`Proof ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                View Full
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isRejected && sub.rejectionReason && (
                      <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
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
                            placeholder="State reason for rejecting (e.g. screenshot does not show subscribe)"
                            className="flex-1 px-3.5 py-2 text-xs bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-400"
                          />
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => handleReject(sub._id)}
                            disabled={busyId === sub._id}
                            className="normal-case text-xs px-3.5 py-2 rounded-xl shrink-0"
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
                            className="normal-case text-xs px-2.5 py-2 text-gray-500 rounded-xl shrink-0"
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
                            disabled={busyId === sub._id}
                            className="normal-case text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 font-bold"
                          >
                            <XCircleIcon className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleApprove(sub._id)}
                            disabled={busyId === sub._id}
                            className="bg-emerald-600 hover:bg-emerald-700 normal-case text-xs px-5 py-2 rounded-xl text-white flex items-center gap-1.5 font-bold shadow-xs"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            <span>Approve & Release Payment</span>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default TaskSubmissionsReview;
