import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Card, Button, Typography } from "@material-tailwind/react";
import {
  SparklesIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import SocialNav from "./components/SocialNav";

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

const CreateSocialTask = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const editId = searchParams.get("edit");
  const [originalTask, setOriginalTask] = useState(null);
  const [fetchingTask, setFetchingTask] = useState(Boolean(editId));

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

  // Load Task for Editing if editId provided
  useEffect(() => {
    if (!editId) return;
    const loadTask = async () => {
      try {
        setFetchingTask(true);
        const { data } = await api.get(`social-works/${editId}`);
        const task = data?.data || data;
        if (!task) throw new Error("Task not found");

        if (task.status !== "PENDING_APPROVAL") {
          toast.error("Task can only be edited while it is Under Review");
          return navigate("/user/social-works/my-tasks");
        }

        setOriginalTask(task);
        setPlatform(task.platform || "youtube");
        setActionType(task.actionType || "subscribe");
        setTitle(task.title || "");
        setDescription(task.description || "");
        setTaskUrl(task.taskUrl || task.url || "");
        setWatchDuration(task.properties?.watchDuration || 60);
        setCustomCommentText(task.properties?.customCommentText || "");
        setChannelOrAccountName(task.properties?.channelOrAccountName || "");
        setAdditionalInstructions(task.properties?.additionalInstructions || "");
        setTextPrompt(task.proofConfig?.textPrompt || "Enter your account username / proof details");
        setScreenshotCount(task.proofConfig?.screenshotCount || 1);
        setScreenshotLabels(
          task.proofConfig?.screenshotLabels?.length
            ? task.proofConfig.screenshotLabels
            : ["Screenshot of completed action"]
        );
        setTargetQuantity(task.targetQuantity || 10);
        setCostPerUnit(task.costPerUnit || task.price || 2.0);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Failed to load task");
        navigate("/user/social-works/my-tasks");
      } finally {
        setFetchingTask(false);
      }
    };
    loadTask();
  }, [editId, navigate]);

  // Escrow & Delta Calculation
  const totalBudget = useMemo(() => {
    const qty = parseInt(targetQuantity, 10) || 0;
    const price = parseFloat(costPerUnit) || 0;
    return Math.round(qty * price * 100) / 100;
  }, [targetQuantity, costPerUnit]);

  const originalBudget = originalTask
    ? (originalTask.totalBudget || (originalTask.costPerUnit * originalTask.targetQuantity) || 0)
    : 0;
  const budgetDelta = Math.round((totalBudget - originalBudget) * 100) / 100;

  const userBalance = user?.balance || 0;
  const isBalanceSufficient = originalTask
    ? (budgetDelta <= 0 || userBalance >= budgetDelta)
    : (userBalance >= totalBudget && totalBudget > 0);

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
      return toast.error(
        originalTask
          ? `Insufficient balance. Need an extra ৳${budgetDelta.toFixed(2)} to update budget.`
          : "Insufficient balance to fund this task"
      );
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
          watchDuration: actionType === "watch_time" ? parseInt(watchDuration, 10) || 0 : 0,
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
        targetQuantity: parseInt(targetQuantity, 10) || 1,
        costPerUnit: parseFloat(costPerUnit) || 0,
      };

      if (editId) {
        await api.put(`social-works/update/${editId}`, payload);
        toast.success("Campaign updated successfully!");
      } else {
        await api.post("social-works/create", payload);
        toast.success("Task created and submitted for admin review!");
      }

      queryClient.invalidateQueries(["my-social-tasks"]);
      queryClient.invalidateQueries(["user"]);
      navigate("/user/social-works/my-tasks");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTask) {
    return (
      <div className="bg-[#f8faff] min-h-screen py-20 text-center">
        <p className="text-sm text-gray-500 font-semibold">Loading campaign details…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-3 sm:pt-4">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl space-y-4 sm:space-y-6">
        {/* Shared Sub-Navigation Bar */}
        <SocialNav />

        {/* Back link */}
        <button
          onClick={() => navigate("/user/social-works/my-tasks")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-teal-700 transition-colors py-1"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to My Campaigns</span>
        </button>

        {/* Studio Form Card */}
        <Card className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs bg-white space-y-6 sm:space-y-8">
          <div className="border-b border-gray-100 pb-4 sm:pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-2">
              <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>{originalTask ? "Edit Campaign (Under Review)" : "Create Campaign"}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900">
              {originalTask ? "Edit Social Task" : "Post a New Social Task"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {originalTask
                ? "Modify your campaign instructions, target links, or budget before admin approval."
                : "Reach thousands of real platform workers to grow your subscribers, views, likes, and comments."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Step 1: Platform Selection */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                1. Select Social Media Platform
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {PLATFORMS.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all active:scale-95 touch-tap-none ${
                        isSelected
                          ? "border-teal-500 bg-teal-50/50 shadow-xs ring-2 ring-teal-500/20"
                          : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/60"
                      }`}
                    >
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${p.bg} ${p.color}`}>
                        {p.icon}
                      </span>
                      <span className={`text-xs font-bold truncate ${isSelected ? "text-teal-900" : "text-gray-700"}`}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Action Type Selection */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                2. Select Action Type Required
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ACTION_TYPES.map((a) => {
                  const isSelected = actionType === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setActionType(a.id)}
                      className={`min-h-[38px] sm:min-h-[40px] flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all active:scale-95 touch-tap-none ${
                        isSelected
                          ? "border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-2xs"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm shrink-0">{a.icon}</span>
                      <span className="text-xs truncate">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Action Details & Dynamic Properties */}
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-200/70">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
                3. Action & Target Details
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
                  placeholder="e.g. Subscribe to YouTube channel and like recent video"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Link (Channel URL / Post URL / Video URL) *
                </label>
                <input
                  type="url"
                  required
                  value={taskUrl}
                  onChange={(e) => setTaskUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                      className="w-32 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-base sm:text-sm font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                    placeholder="e.g. Great video! Subscribed and looking forward to more content."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              {/* Dynamic: If actionType === 'subscribe' or 'join_group' */}
              {(actionType === "subscribe" || actionType === "join_group") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Handle or Channel Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={channelOrAccountName}
                    onChange={(e) => setChannelOrAccountName(e.target.value)}
                    placeholder="e.g. @mychannelname"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Detailed Instructions for Workers
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain step-by-step what the worker should do..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Step 4: Dynamic Proof Requirements */}
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-200/70">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
                4. Proof of Work Requirements
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
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                      className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-tap-none ${
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
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-base sm:text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: User-Defined Pricing & Escrow Calculator */}
            <div className="space-y-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-teal-500/5 via-sky-500/5 to-emerald-500/5 border border-teal-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
                  5. Quantity, Pricing & Escrow Budget
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                  <BanknotesIcon className="w-3.5 h-3.5" />
                  100% User Defined Pricing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Quantity (Workers Needed) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cost Per Unit in BDT (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Escrow Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-teal-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {originalTask ? "Total Required Escrow Budget" : "Total Escrow to be Deducted"}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700 leading-tight">
                    ৳ {totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {targetQuantity || 0} units × ৳{parseFloat(costPerUnit || 0).toFixed(2)}
                  </p>

                  {originalTask && (
                    <div className="mt-2 text-xs font-semibold">
                      {budgetDelta > 0 ? (
                        <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                          Additional Escrow: +৳{budgetDelta.toFixed(2)}
                        </span>
                      ) : budgetDelta < 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                          Escrow Refund: -৳{Math.abs(budgetDelta).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block">
                          Budget Unchanged (৳{totalBudget.toFixed(2)})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:text-right flex sm:block items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Available Balance</p>
                    <p className={`text-lg sm:text-xl font-black ${isBalanceSufficient ? "text-emerald-600" : "text-red-500"}`}>
                      ৳ {userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {!isBalanceSufficient && (
                    <Link
                      to="/user/topup"
                      className="inline-block text-xs font-bold text-teal-600 hover:underline mt-0.5 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                    >
                      Deposit Funds ↗
                    </Link>
                  )}
                </div>
              </div>

              {!isBalanceSufficient && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-2xl border border-red-200">
                  <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                  <span>
                    {originalTask
                      ? `Insufficient balance to cover the additional ৳${budgetDelta.toFixed(2)} budget increase.`
                      : "Insufficient balance to fund this task. Please deposit funds or adjust the quantity / price."}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Action - Full width responsive on mobile */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="text"
                onClick={() => navigate("/user/social-works/my-tasks")}
                className="normal-case text-gray-500 rounded-xl py-2.5"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading || !isBalanceSufficient || totalBudget <= 0}
                className="min-h-[44px] bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs sm:text-sm px-8 py-3 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {loading ? (
                  <span>{originalTask ? "Saving Changes…" : "Publishing Task…"}</span>
                ) : (
                  <>
                    <span>
                      {originalTask
                        ? "Save Changes"
                        : `Lock ৳${totalBudget.toFixed(2)} & Post Task`}
                    </span>
                    <CheckCircleIcon className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateSocialTask;
