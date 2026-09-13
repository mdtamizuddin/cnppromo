import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Button, Dialog } from "@material-tailwind/react";
import toast from "react-hot-toast";
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  PhotoIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import { api } from "../../util/axios";
import SocialNav from "./components/SocialNav";

const SUBMIT_FILTERS = [
  { id: "all", label: "All Submissions" },
  { id: "pending", label: "Under Review" },
  { id: "approved", label: "Approved & Paid" },
  { id: "rejected", label: "Rejected" },
];

const MySubmissions = () => {
  const { user } = useSelector((state) => state.user);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [lightboxImage, setLightboxImage] = useState(null);
  const queryClient = useQueryClient();

  // Dispute modal state
  const [disputeModal, setDisputeModal] = useState(null); // submission object
  const [disputeReason, setDisputeReason] = useState("");
  const [filingDispute, setFilingDispute] = useState(false);

  const { data: submits, isLoading } = useQuery({
    queryKey: ["my-social-submissions", user?._id],
    queryFn: async () => {
      const res = await api.get(`social-works/submit/${user._id}`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  const filteredSubmissions = useMemo(() => {
    if (!Array.isArray(submits)) return [];
    if (selectedFilter === "all") return submits;
    return submits.filter((s) => {
      const st = (s.status || "").toLowerCase();
      if (selectedFilter === "pending") return st === "pending";
      if (selectedFilter === "approved") return st === "approved" || st === "completed";
      if (selectedFilter === "rejected") return st === "rejected";
      return true;
    });
  }, [submits, selectedFilter]);

  // Worker stats summary
  const stats = useMemo(() => {
    const list = Array.isArray(submits) ? submits : [];
    const total = list.length;
    const pending = list.filter((s) => ["PENDING", "pending"].includes(s.status)).length;
    const approved = list.filter((s) => ["APPROVED", "completed"].includes(s.status));
    const totalEarned = approved.reduce(
      (acc, s) => acc + (s.netAmount || s.workId?.reward || s.workId?.price || 0),
      0
    );
    const rejected = list.filter((s) => ["REJECTED", "rejected"].includes(s.status)).length;
    return { total, pending, totalEarned, rejected, approvedCount: approved.length };
  }, [submits]);

  // Handle file dispute
  const handleFileDispute = async () => {
    if (!disputeModal) return;
    try {
      setFilingDispute(true);
      await api.post(`social-works/dispute/${disputeModal._id}`, {
        reason: disputeReason.trim(),
      });
      toast.success("Appeal submitted! Admin will review your submission.");
      setDisputeModal(null);
      setDisputeReason("");
      queryClient.invalidateQueries(["my-social-submissions"]);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to file appeal"
      );
    } finally {
      setFilingDispute(false);
    }
  };

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-3 sm:pt-4">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl space-y-4 sm:space-y-6">
        {/* Shared Sub-Navigation Bar */}
        <SocialNav />

        {/* Top Header Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-teal-500/10 via-white to-sky-500/10 border border-teal-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">
              My Task Submissions
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Track the review progress of the tasks you submitted and inspect earned rewards.
            </p>
          </div>
          <Link to="/user/social-works" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[40px] bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl normal-case flex items-center justify-center active:scale-95">
              Find More Tasks
            </Button>
          </Link>
        </div>

        {/* Worker Summary Stat Cards - 2 cols on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Total Submitted</p>
            <p className="text-lg sm:text-xl font-black text-gray-900 mt-0.5 sm:mt-1">{stats.total}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Under Review</p>
            <p className="text-lg sm:text-xl font-black text-amber-600 mt-0.5 sm:mt-1">{stats.pending}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Approved Tasks</p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5 sm:mt-1">{stats.approvedCount}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Total Earned</p>
            <p className="text-lg sm:text-xl font-black text-teal-600 mt-0.5 sm:mt-1 truncate">
              ৳{stats.totalEarned.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Status Filter Tabs - Touch Momentum */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth touch-pan-x">
          {SUBMIT_FILTERS.map((f) => {
            const isSelected = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 active:scale-95 touch-tap-none ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="py-20 text-center text-xs sm:text-sm text-gray-400 font-medium">
            Loading your submissions…
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm bg-white">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              📜
            </div>
            <h4 className="text-sm sm:text-base font-bold text-gray-800">No submissions found</h4>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              Start working on social tasks in the Browse tab to begin earning BDT rewards.
            </p>
            <div className="mt-5">
              <Link to="/user/social-works">
                <Button className="bg-teal-600 hover:bg-teal-700 normal-case text-xs sm:text-sm px-5 py-2.5 rounded-xl text-white font-bold active:scale-95">
                  Browse Available Tasks
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredSubmissions.map((sub) => {
              const isApproved = ["APPROVED", "completed"].includes(sub.status);
              const isRejected = ["REJECTED", "rejected"].includes(sub.status);
              const isPending = ["PENDING", "pending"].includes(sub.status);

              const screenshots =
                sub.proofData?.screenshots || (sub.proofImage ? [sub.proofImage] : []);
              const reward = sub.netAmount || sub.workId?.reward || sub.workId?.price || 0;

              return (
                <Card
                  key={sub._id}
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white hover:border-teal-200 transition-all shadow-xs space-y-3 sm:space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 break-words">
                          {sub.workId?.title || "Social Media Task"}
                        </h3>
                        {sub.workId?.platform && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                            {sub.workId.platform}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Submitted {moment(sub.createdAt).format("MMM D, YYYY · h:mm A")} · ID: #{sub._id.slice(-6).toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-black text-emerald-600">
                          ৳{reward.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-gray-400">Net Reward</p>
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
                        {isApproved
                          ? "Approved & Paid"
                          : isRejected
                          ? "Rejected"
                          : "Under Review"}
                      </span>
                    </div>
                  </div>

                  {/* Proof Details Preview */}
                  <div className="space-y-2.5 sm:space-y-3 text-xs">
                    {sub.proofData?.text && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="font-semibold text-gray-600 block mb-0.5">
                          Your Submitted Text Proof:
                        </span>
                        <p className="text-gray-800 font-mono text-[11px] whitespace-pre-wrap break-words">
                          {sub.proofData.text}
                        </p>
                      </div>
                    )}

                    {sub.proofData?.screenshotsCleaned ? (
                      <div className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-800 font-medium">
                        <span>📦 Proof screenshots purged from cloud storage (Task Completed)</span>
                      </div>
                    ) : screenshots.length > 0 ? (
                      <div className="space-y-1.5">
                        <span className="font-semibold text-gray-600 block text-[11px]">
                          Your Uploaded Screenshot Proofs ({screenshots.length}):
                        </span>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {screenshots.map((url, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxImage(url)}
                              className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 relative cursor-pointer active:scale-95 transition-transform bg-gray-50 group"
                            >
                              <img
                                src={url}
                                alt={`Proof ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                View
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Rejection Alert */}
                    {isRejected && sub.rejectionReason && (
                      <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-100 space-y-2">
                        <strong className="block font-bold">Rejection Feedback from Provider:</strong>
                        <span className="break-words block">{sub.rejectionReason}</span>

                        {/* Dispute Status */}
                        {sub.disputed && sub.disputeVerdict === "WORKER_WINS" && (
                          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                            <strong>✅ Appeal Accepted!</strong> Admin ruled in your favor.
                            {sub.disputeAdminNote && <span className="block mt-0.5 text-emerald-600">Admin Note: {sub.disputeAdminNote}</span>}
                          </div>
                        )}
                        {sub.disputed && sub.disputeVerdict === "PROVIDER_WINS" && (
                          <div className="mt-2 p-2.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-[11px]">
                            <strong>❌ Appeal Dismissed.</strong> Admin upheld the rejection.
                            {sub.disputeFine > 0 && (
                              <span className="block mt-0.5 font-bold text-red-600">
                                Penalty: ৳{sub.disputeFine.toFixed(2)} deducted from your balance.
                              </span>
                            )}
                            {sub.disputeAdminNote && <span className="block mt-0.5 text-orange-600">Admin Note: {sub.disputeAdminNote}</span>}
                          </div>
                        )}
                        {sub.disputed && !sub.disputeVerdict && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                            <strong>⏳ Appeal Under Review</strong> — Admin is reviewing your submission proofs.
                          </div>
                        )}

                        {/* Appeal Button — only show if not already disputed */}
                        {!sub.disputed && (
                          <button
                            onClick={() => {
                              setDisputeModal(sub);
                              setDisputeReason("");
                            }}
                            className="mt-2 min-h-[40px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>⚠️ Appeal This Rejection</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {lightboxImage && (
        <Dialog
          open={Boolean(lightboxImage)}
          handler={() => setLightboxImage(null)}
          size="lg"
          className="bg-transparent shadow-none p-0 overflow-hidden"
        >
          <div className="relative p-2 bg-black/95 rounded-2xl flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50 bg-black/50 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Proof full view"
              className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain mt-6"
            />
          </div>
        </Dialog>
      )}

      {/* Dispute / Appeal Modal */}
      <Dialog
        open={Boolean(disputeModal)}
        handler={() => !filingDispute && setDisputeModal(null)}
        size="md"
        className="m-3 sm:m-auto rounded-2xl sm:rounded-3xl p-0 overflow-hidden"
      >
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900">⚠️ Appeal Rejection</h3>
            <p className="text-xs text-gray-500 mt-1">
              Task: <strong>{disputeModal?.workId?.title || "Social Media Task"}</strong>
            </p>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-800 space-y-1">
            <strong className="block font-bold">⚠️ Important — Read Before Filing</strong>
            <p>
              Admin will review your proof screenshots and text against the task requirements.
              If your appeal is <strong>valid</strong>, you will be paid and the provider will be fined <strong>2× the task rate</strong>.
            </p>
            <p>
              If your appeal is <strong>invalid</strong>, <strong>you will be fined 2× the reward amount</strong> and the fine will be deducted from your balance.
            </p>
          </div>

          {/* Provider's rejection reason */}
          {disputeModal?.rejectionReason && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs">
              <span className="font-bold text-red-700">Provider's Rejection Reason:</span>
              <p className="text-red-600 mt-0.5">{disputeModal.rejectionReason}</p>
            </div>
          )}

          {/* Dispute Reason Textarea - 16px font prevents iOS zoom */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Why do you believe this rejection is unfair? *
            </label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain in detail why your submission was valid and the rejection is wrong. Reference your proof screenshots and text..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-base sm:text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none resize-none"
              rows={4}
              maxLength={1000}
              disabled={filingDispute}
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {disputeReason.length}/1000 (minimum 10 characters)
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setDisputeModal(null)}
              disabled={filingDispute}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleFileDispute}
              disabled={filingDispute || disputeReason.trim().length < 10}
              className="min-h-[42px] px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center active:scale-95"
            >
              {filingDispute ? "Submitting Appeal..." : "Submit Appeal"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MySubmissions;
