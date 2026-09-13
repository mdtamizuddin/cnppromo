import React, { useState } from "react";
import { Button, Progress } from "@material-tailwind/react";
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentDuplicateIcon,
  CloudArrowDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import toast from "react-hot-toast";
import { Modal, DetailTile, StatusPill } from "../../../../Components/AdminLayout/_Ui/AdminUI";

const TaskDetailsModal = ({
  task,
  onClose,
  onApprove,
  onReject,
  onPurgeS3,
  onViewSubmissions,
  isModding = false,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);

  if (!task) return null;

  const isPending = task.status === "PENDING_APPROVAL";
  const isCompleted = ["COMPLETED", "completed"].includes(task.status);
  const isRejected = task.status === "REJECTED";
  const targetUrl = task.taskUrl || task.url;

  const progress = task.targetQuantity
    ? Math.min(100, Math.round(((task.completedQuantity || 0) / task.targetQuantity) * 100))
    : 0;

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      toast.success("Target URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === "comment") {
      setCopiedComment(true);
      toast.success("Comment text copied to clipboard!");
      setTimeout(() => setCopiedComment(false), 2000);
    }
  };

  return (
    <Modal
      size="lg"
      title="Task Campaign Details"
      subtitle={
        <span className="flex items-center gap-2 flex-wrap">
          <span className="truncate max-w-sm font-bold text-gray-900">{task.title}</span>
          <StatusPill
            tone={
              task.status === "ACTIVE" || task.status === "active"
                ? "green"
                : isPending
                ? "amber"
                : isRejected
                ? "red"
                : "blue"
            }
          >
            {isPending ? "Pending Approval" : task.status}
          </StatusPill>
        </span>
      }
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            {onViewSubmissions && (
              <Button
                size="sm"
                variant="outlined"
                color="teal"
                onClick={() => {
                  onViewSubmissions(task);
                  onClose();
                }}
                className="normal-case text-xs rounded-xl flex items-center gap-1.5"
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-teal-600" />
                <span>View Submissions</span>
              </Button>
            )}

            {isCompleted && !task.storageCleaned && onPurgeS3 && (
              <Button
                size="sm"
                variant="outlined"
                color="amber"
                onClick={() => onPurgeS3(task._id)}
                className="normal-case text-xs rounded-xl flex items-center gap-1.5"
              >
                <CloudArrowDownIcon className="w-4 h-4 text-amber-600" />
                <span>Purge S3 Storage</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPending && onApprove && (
              <Button
                size="sm"
                onClick={() => onApprove(task._id)}
                disabled={isModding}
                className="normal-case text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Approve Campaign</span>
              </Button>
            )}

            {isPending && onReject && (
              <Button
                size="sm"
                variant="outlined"
                color="red"
                onClick={() => onReject(task)}
                disabled={isModding}
                className="normal-case text-xs rounded-xl flex items-center gap-1.5"
              >
                <XCircleIcon className="w-4 h-4" />
                <span>Reject & Refund</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="text"
              onClick={onClose}
              className="normal-case text-xs text-gray-500 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Top Overview: Platform, Date, Provider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailTile label="Provider (Campaign Creator)">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-black flex items-center justify-center shrink-0 border border-teal-200">
                {task.providerId?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{task.providerId?.name || "System"}</p>
                <p className="text-[11px] text-gray-400 font-normal">
                  @{task.providerId?.username || "user"} · {task.providerId?.email || "No email"}
                </p>
              </div>
            </div>
            {task.providerId?.balance !== undefined && (
              <p className="text-[10px] text-teal-700 font-bold mt-1">
                Account Balance: ৳{task.providerId.balance.toFixed(2)}
              </p>
            )}
          </DetailTile>

          <DetailTile label="Platform & Action Type">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-teal-50 text-teal-800 border border-teal-200">
                {task.platform || "Other"}
              </span>
              <div>
                <p className="font-bold text-gray-900 capitalize text-xs">
                  {task.actionType?.replace("_", " ") || "Custom"}
                </p>
                <p className="text-[10px] text-gray-400">
                  Created {moment(task.createdAt).format("MMM D, YYYY · h:mm A")}
                </p>
              </div>
            </div>
          </DetailTile>
        </div>

        {/* Financial & Escrow Budget Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-white to-sky-50/70 border border-teal-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-teal-600" />
              <span>Escrow & Capacity Breakdown</span>
            </span>
            {task.storageCleaned ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ S3 Cleaned ({task.storageCleanedCount || 0} images purged)
              </span>
            ) : isCompleted ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                S3 Storage Purge Ready
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100/80">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Unit Cost (Gross)</p>
              <p className="text-sm font-black text-gray-900">
                ৳{(task.costPerUnit || task.price || 0).toFixed(2)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100/80">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Target Quantity</p>
              <p className="text-sm font-black text-gray-900">
                {task.completedQuantity || 0} / {task.targetQuantity}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100/80">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Total Budget</p>
              <p className="text-sm font-black text-teal-700">
                ৳{(task.totalBudget || (task.costPerUnit * task.targetQuantity) || 0).toFixed(2)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100/80">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Escrow in Hold</p>
              <p className="text-sm font-black text-sky-700">
                ৳{(task.escrowRemaining || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-gray-500">
              <span>Fulfillment Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} size="sm" color="teal" className="bg-gray-100" />
          </div>
        </div>

        {/* Target URL */}
        {targetUrl && (
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
            <span className="font-bold text-gray-700 block">Promoted Target URL:</span>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
              <span className="font-mono text-xs text-gray-800 truncate select-all">{targetUrl}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(targetUrl, "url")}
                  className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                </button>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800"
                >
                  <span>Visit Link</span>
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Action Properties */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
          <span className="font-bold text-gray-800 block text-xs uppercase tracking-wider">
            Campaign Instructions & Properties
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {task.properties?.watchDuration > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-200/70">
                <ClockIcon className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">Required Watch Time</span>
                  <span className="font-bold text-gray-900">{task.properties.watchDuration} seconds</span>
                </div>
              </div>
            )}

            {task.properties?.channelOrAccountName && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-200/70">
                <UserCircleIcon className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">Account / Channel</span>
                  <span className="font-bold text-gray-900">{task.properties.channelOrAccountName}</span>
                </div>
              </div>
            )}
          </div>

          {task.properties?.customCommentText && (
            <div className="p-3 rounded-xl bg-white border border-gray-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold block">Preset Comment to Post:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(task.properties.customCommentText, "comment")}
                  className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-800 font-semibold"
                >
                  {copiedComment ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
                  <span>{copiedComment ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-100">
                "{task.properties.customCommentText}"
              </p>
            </div>
          )}

          {task.properties?.additionalInstructions && (
            <div className="p-3 rounded-xl bg-white border border-gray-200/70 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold block">Additional Instructions:</span>
              <p className="text-gray-800 text-xs whitespace-pre-wrap">
                {task.properties.additionalInstructions}
              </p>
            </div>
          )}

          {task.description && (
            <div className="p-3 rounded-xl bg-white border border-gray-200/70 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold block">Full Task Description:</span>
              <p className="text-gray-800 text-xs whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
        </div>

        {/* Proof Configuration */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
          <span className="font-bold text-gray-800 block text-xs uppercase tracking-wider">
            Worker Proof Requirements
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
              <span className="text-[10px] text-gray-400 font-bold block">Text Proof Prompt</span>
              <p className="text-xs font-semibold text-gray-900 mt-0.5">
                {task.proofConfig?.textPrompt || "Account username / proof details"}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
              <span className="text-[10px] text-gray-400 font-bold block">Required Screenshots</span>
              <p className="text-xs font-semibold text-gray-900 mt-0.5">
                {task.proofConfig?.screenshotCount || 1} screenshot(s) required
              </p>
            </div>
          </div>

          {task.proofConfig?.screenshotLabels?.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-gray-400 font-bold block">Screenshot Labels:</span>
              <div className="flex flex-wrap gap-1.5">
                {task.proofConfig.screenshotLabels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] text-gray-700 font-medium"
                  >
                    {idx + 1}. {lbl}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rejection Alert if Rejected */}
        {isRejected && task.rejectionReason && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-100 space-y-1">
            <strong className="block font-bold">Admin Rejection Feedback:</strong>
            <p className="text-xs">{task.rejectionReason}</p>
            <p className="text-[10px] text-red-500 mt-1">Escrow was fully refunded to the provider's wallet balance.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;
