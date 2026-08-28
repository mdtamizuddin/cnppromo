import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import {
  ClockIcon, BanknotesIcon, CheckCircleIcon, XCircleIcon,
  UserCircleIcon, CalendarDaysIcon, PlayCircleIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import { Modal, DetailTile, StatusPill } from "../../../../Components/AdminLayout/_Ui/AdminUI";
import { youtubeThumb } from "./youtube";

const formatDuration = (sec) => {
  if (!sec && sec !== 0) return "—";
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return `${sec}s`;
};

const SubmissionReviewModal = ({ submit, onClose, onSuccess }) => {
  const [busy, setBusy] = useState(null); // "approve" | "reject"

  const work = submit.workId;
  const user = submit.userId;
  const thumb = youtubeThumb(work?.url);
  const isPending = submit.status === "pending";

  // The user is credited only if they actually watched long enough — surface
  // that up front so the reviewer does not have to do the arithmetic.
  const requiredDuration = work?.duration || 0;
  const watchedEnough = requiredDuration ? submit.duration >= requiredDuration : true;

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

  const approve = () =>
    run(
      "approve",
      () => api.put(`social-works/complete/${submit._id}`),
      `Approved — ৳${work?.price ?? 0} credited`
    );

  const reject = () => {
    if (!window.confirm("Reject this submission? The user will not be paid.")) return;
    return run(
      "reject",
      () => api.put(`social-works/submit/${submit._id}`, { status: "rejected" }),
      "Submission rejected"
    );
  };

  return (
    <Modal
      title="Review Submission"
      subtitle={
        <span className="flex items-center gap-2">
          <span className="truncate">{work?.title}</span>
          <StatusPill tone={submit.status === "completed" ? "green" : submit.status === "rejected" ? "red" : "amber"}>
            {submit.status}
          </StatusPill>
        </span>
      }
      onClose={onClose}
      footer={
        isPending ? (
          <div className="flex gap-3">
            <Button
              variant="outlined"
              color="red"
              fullWidth
              className="normal-case rounded-xl flex items-center justify-center gap-1.5"
              onClick={reject}
              disabled={Boolean(busy)}
            >
              <XCircleIcon className="w-4 h-4" />
              {busy === "reject" ? "Rejecting…" : "Reject"}
            </Button>
            <Button
              fullWidth
              className="normal-case rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              onClick={approve}
              disabled={Boolean(busy)}
            >
              <CheckCircleIcon className="w-4 h-4" />
              {busy === "approve" ? "Approving…" : `Approve & Pay ৳${work?.price ?? 0}`}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            This submission was already {submit.status}.
          </p>
        )
      }
    >
      {thumb && (
        <a
          href={work?.url}
          target="_blank"
          rel="noreferrer"
          className="relative block mb-5 rounded-2xl overflow-hidden group"
        >
          <img src={thumb} alt="" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gray-900/25 group-hover:bg-gray-900/40 transition-colors grid place-items-center">
            <PlayCircleIcon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={1.4} />
          </div>
        </a>
      )}

      {!watchedEnough && (
        <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-100">
          <ClockIcon className="w-5 h-5 text-amber-500 shrink-0 mt-px" />
          <p className="text-xs text-amber-800">
            Watched <b>{formatDuration(submit.duration)}</b> of the required{" "}
            <b>{formatDuration(requiredDuration)}</b>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <DetailTile label="User">
          <span className="flex items-center gap-1.5">
            <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{user?.name || "—"}</span>
          </span>
          {user?.username && <p className="text-[11px] font-medium text-gray-400 mt-0.5">@{user.username}</p>}
        </DetailTile>

        <DetailTile label="Watched">
          <span className={`flex items-center gap-1.5 ${watchedEnough ? "text-gray-900" : "text-amber-600"}`}>
            <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
            {formatDuration(submit.duration)}
          </span>
          <p className="text-[11px] font-medium text-gray-400 mt-0.5">
            required {formatDuration(requiredDuration)}
          </p>
        </DetailTile>

        <DetailTile label="Reward">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <BanknotesIcon className="w-4 h-4 shrink-0" />
            ৳{work?.price ?? 0}
          </span>
        </DetailTile>

        <DetailTile label="Submitted">
          <span className="flex items-center gap-1.5">
            <CalendarDaysIcon className="w-4 h-4 text-gray-400 shrink-0" />
            {moment(submit.createdAt).fromNow()}
          </span>
          <p className="text-[11px] font-medium text-gray-400 mt-0.5">
            {moment(submit.createdAt).format("MMM DD, YYYY · hh:mm A")}
          </p>
        </DetailTile>
      </div>

      {submit.answers?.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Answers ({submit.answers.length})
          </p>
          <div className="space-y-2">
            {submit.answers.map((ans, i) => (
              <div key={i} className="p-3 bg-teal-50/60 rounded-xl border border-teal-100/80">
                <p className="text-[11px] text-teal-700 font-bold mb-1">
                  Q{i + 1}. {work?.questions?.[i] || "Question no longer on this task"}
                </p>
                <p className="text-sm text-gray-800 break-words">{ans || <span className="text-gray-400">No answer</span>}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SubmissionReviewModal;
