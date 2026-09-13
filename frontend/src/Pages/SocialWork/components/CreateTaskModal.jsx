import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  SparklesIcon,
  BanknotesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: "▶", color: "text-red-500", bg: "bg-red-50 border-red-200" },
  { id: "facebook", label: "Facebook", icon: "f", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { id: "tiktok", label: "TikTok", icon: "♫", color: "text-black", bg: "bg-gray-100 border-gray-300" },
  { id: "instagram", label: "Instagram", icon: "📷", color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  { id: "telegram", label: "Telegram", icon: "✈", color: "text-sky-500", bg: "bg-sky-50 border-sky-200" },
  { id: "twitter", label: "Twitter / X", icon: "𝕏", color: "text-slate-800", bg: "bg-slate-100 border-slate-300" },
  { id: "website", label: "Website", icon: "🌐", color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  { id: "other", label: "Other", icon: "★", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
];

const ACTION_TYPES = [
  { id: "subscribe", label: "Subscribe / Follow", icon: "👥" },
  { id: "like", label: "Like / React", icon: "👍" },
  { id: "comment", label: "Comment", icon: "💬" },
  { id: "watch_time", label: "Watch Time", icon: "⏱" },
  { id: "join_group", label: "Join Group", icon: "🤝" },
  { id: "share_repost", label: "Share / Repost", icon: "🔁" },
  { id: "custom", label: "Custom Task", icon: "🎯" },
];

const CreateTaskModal = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Form State
  const [platform, setPlatform] = useState("youtube");
  const [actionType, setActionType] = useState("subscribe");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskUrl, setTaskUrl] = useState("");

  // Dynamic Action Properties
  const [watchDuration, setWatchDuration] = useState(60);
  const [customCommentText, setCustomCommentText] = useState("");
  const [channelOrAccountName, setChannelOrAccountName] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // Dynamic Proof Requirements
  const [textPrompt, setTextPrompt] = useState("Enter your account username / proof details");
  const [screenshotCount, setScreenshotCount] = useState(1);
  const [screenshotLabels, setScreenshotLabels] = useState(["Screenshot of completed action"]);

  // User-Defined Pricing & Quantity
  const [targetQuantity, setTargetQuantity] = useState(10);
  const [costPerUnit, setCostPerUnit] = useState(2.0);

  // Escrow Calculation
  const totalBudget = useMemo(() => {
    const qty = parseInt(targetQuantity) || 0;
    const price = parseFloat(costPerUnit) || 0;
    return Math.round(qty * price * 100) / 100;
  }, [targetQuantity, costPerUnit]);

  const userBalance = user?.balance || 0;
  const isBalanceSufficient = userBalance >= totalBudget && totalBudget > 0;

  const handleScreenshotCountChange = (count) => {
    setScreenshotCount(count);
    const newLabels = [...screenshotLabels];
    while (newLabels.length < count) {
      newLabels.push(`Screenshot ${newLabels.length + 1} proof`);
    }
    setScreenshotLabels(newLabels.slice(0, count));
  };

  const handleLabelChange = (index, value) => {
    const updated = [...screenshotLabels];
    updated[index] = value;
    setScreenshotLabels(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Please enter a task title");
    if (!taskUrl.trim()) return toast.error("Please enter the target URL");
    if (totalBudget <= 0) return toast.error("Total budget must be greater than 0");
    if (!isBalanceSufficient) {
      return toast.error("Insufficient balance to fund this task");
    }

    try {
      setLoading(true);

      const payload = {
        platform,
        actionType,
        title: title.trim(),
        description: description.trim(),
        taskUrl: taskUrl.trim(),
        properties: {
          watchDuration: actionType === "watch_time" ? parseInt(watchDuration) || 0 : 0,
          customCommentText: actionType === "comment" ? customCommentText.trim() : null,
          channelOrAccountName: channelOrAccountName.trim() || null,
          additionalInstructions: additionalInstructions.trim(),
        },
        proofConfig: {
          requireText: true,
          textPrompt: textPrompt.trim(),
          requireScreenshot: true,
          screenshotCount,
          screenshotLabels,
        },
        targetQuantity: parseInt(targetQuantity) || 1,
        costPerUnit: parseFloat(costPerUnit) || 0,
      };

      await api.post("social-works/create", payload);

      toast.success("Task created and submitted for admin review!");
      queryClient.invalidateQueries(["my-social-tasks"]);
      queryClient.invalidateQueries(["user"]);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <DialogHeader className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-50/60 via-white to-sky-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-lg border border-teal-500/20">
            <SparklesIcon className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <Typography variant="h5" className="text-gray-900 font-extrabold text-base sm:text-lg">
              Create Social Task
            </Typography>
            <p className="text-xs text-gray-500 font-medium">
              Pay real users to like, follow, comment, or watch your content
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </DialogHeader>

      {/* Body with Form */}
      <DialogBody className="overflow-y-auto px-6 py-6 space-y-6 flex-1 text-gray-800">
        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Platform Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              1. Select Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PLATFORMS.map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/50 shadow-sm ring-2 ring-teal-500/20"
                        : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/60"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${p.bg} ${p.color}`}>
                      {p.icon}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? "text-teal-900" : "text-gray-700"}`}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Action Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              2. Select Action Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACTION_TYPES.map((a) => {
                const isSelected = actionType === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActionType(a.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm">{a.icon}</span>
                    <span className="text-xs">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Core Details & Dynamic Action Inputs */}
          <div className="space-y-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-800">
              3. Task Information & Action Details
            </label>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Subscribe to YouTube channel and like latest video"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target URL (Link to Video / Channel / Post / Page) *
              </label>
              <input
                type="url"
                required
                value={taskUrl}
                onChange={(e) => setTaskUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Dynamic: If actionType === 'watch_time' */}
            {actionType === "watch_time" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required Minimum Watch Duration (seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    value={watchDuration}
                    onChange={(e) => setWatchDuration(e.target.value)}
                    className="w-36 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <span className="text-xs text-gray-500">
                    ≈ {(watchDuration / 60).toFixed(1)} minutes
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic: If actionType === 'comment' */}
            {actionType === "comment" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specific Comment to Post (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customCommentText}
                  onChange={(e) => setCustomCommentText(e.target.value)}
                  placeholder="e.g. Great video! Subscribed and excited for the next part."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            )}

            {/* Dynamic: If actionType === 'subscribe' or 'join_group' */}
            {(actionType === "subscribe" || actionType === "join_group") && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Handle or Name (Optional)
                </label>
                <input
                  type="text"
                  value={channelOrAccountName}
                  onChange={(e) => setChannelOrAccountName(e.target.value)}
                  placeholder="e.g. @cnppromoofficial"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Detailed Instructions for Workers
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain step-by-step what the worker should do..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Step 4: Dynamic Proof Requirements */}
          <div className="space-y-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-800">
              4. Proof Requirements from Workers
            </label>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Text Proof Prompt
              </label>
              <input
                type="text"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="e.g. Provide your YouTube username / channel link"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Number of Screenshots Required
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleScreenshotCountChange(count)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      screenshotCount === count
                        ? "border-teal-500 bg-teal-500 text-white shadow-xs"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {count} Screenshot{count > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {screenshotLabels.map((lbl, idx) => (
                <div key={idx}>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Label for Screenshot #{idx + 1}
                  </label>
                  <input
                    type="text"
                    value={lbl}
                    onChange={(e) => handleLabelChange(idx, e.target.value)}
                    placeholder={`e.g. Screenshot showing ${actionType} proof`}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: User-Defined Pricing & Quantity (Escrow Calculation) */}
          <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-r from-teal-500/5 via-sky-500/5 to-emerald-500/5 border border-teal-200/80">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
                5. Pricing & Escrow Budget
              </label>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100/70 px-2.5 py-1 rounded-full">
                <BanknotesIcon className="w-3.5 h-3.5" />
                100% User Defined Price
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Quantity (Workers Needed)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cost Per Unit in BDT (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Escrow Calculation Card */}
            <div className="p-4 rounded-xl bg-white border border-teal-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Escrow Budget Deducted</p>
                <p className="text-2xl font-black text-teal-700">
                  ৳ {totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-400">
                  {targetQuantity || 0} units × ৳{parseFloat(costPerUnit || 0).toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Your Available Balance</p>
                <p className={`text-lg font-black ${isBalanceSufficient ? "text-emerald-600" : "text-red-500"}`}>
                  ৳ {userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                {!isBalanceSufficient && (
                  <Link
                    to="/user/topup"
                    className="inline-block text-xs font-bold text-teal-600 hover:underline mt-0.5"
                  >
                    Deposit Funds ↗
                  </Link>
                )}
              </div>
            </div>

            {!isBalanceSufficient && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                <span>You do not have enough balance to fund this escrow budget. Please top up your account.</span>
              </div>
            )}
          </div>
        </form>
      </DialogBody>

      {/* Footer Actions */}
      <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
        <Button
          variant="text"
          onClick={onClose}
          className="normal-case text-gray-600 rounded-xl"
        >
          Cancel
        </Button>

        <Button
          form="create-task-form"
          type="submit"
          disabled={loading || !isBalanceSufficient || totalBudget <= 0}
          className="bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <span>Creating Task…</span>
          ) : (
            <>
              <span>Lock ৳{totalBudget.toFixed(2)} & Post Task</span>
              <CheckCircleIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateTaskModal;
