import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, Button, Typography, Progress } from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import { uploadImageToS3 } from "../../util/s3Upload";

const WorkDetails = () => {
  const { user } = useSelector((state) => state.user);
  const { id: workId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [proofText, setProofText] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await api.get(`social-works/${workId}`);
        setWork(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load task");
        navigate("/user/social-works");
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [workId, navigate]);

  const targetUrl = work?.taskUrl || work?.url;
  const reward = work?.reward || work?.price || 0;
  const screenshotCount = work?.proofConfig?.screenshotCount || 1;
  const screenshotLabels = work?.proofConfig?.screenshotLabels || ["Proof Screenshot"];
  const isOwnTask = user?._id && String(work?.providerId?._id || work?.providerId) === String(user._id);

  const handleCopyComment = () => {
    if (work?.properties?.customCommentText) {
      navigator.clipboard.writeText(work.properties.customCommentText);
      toast.success("Comment copied to clipboard!");
    }
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingIndex(index);
      setUploadProgress(10);
      const url = await uploadImageToS3(file, (percent) => setUploadProgress(percent), "tasks");
      const updated = [...screenshots];
      updated[index] = url;
      setScreenshots(updated);
      toast.success(`Screenshot #${index + 1} uploaded successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingIndex(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveScreenshot = (index) => {
    const updated = [...screenshots];
    updated[index] = null;
    setScreenshots(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!proofText.trim()) {
      return toast.error("Please provide the required text proof");
    }

    const uploadedCount = screenshots.filter(Boolean).length;
    if (uploadedCount < screenshotCount) {
      return toast.error(`Please upload all ${screenshotCount} required screenshots`);
    }

    try {
      setSubmitting(true);
      await api.post("social-works/submit", {
        workId: work._id,
        proofData: {
          text: proofText.trim(),
          screenshots: screenshots.filter(Boolean),
        },
      });

      toast.success("Task submitted for review! You will be credited upon approval.");
      queryClient.invalidateQueries(["social-works"]);
      queryClient.removeQueries(["social-works"]);
      queryClient.invalidateQueries(["my-social-submissions"]);
      navigate("/user/social-works");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin size="large" fullscreen />;
  }

  if (!work) return null;

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate("/user/social-works")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {/* Task Header Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-sm bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                {work.platform || "Social Media"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                {work.actionType?.replace("_", " ") || "Task"}
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">
                ৳{reward.toFixed(2)}
              </span>
              <p className="text-[10px] text-gray-400 font-medium">Your Net Earnings</p>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
              {work.title}
            </h1>
            {work.description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {work.description}
              </p>
            )}
          </div>

          {/* Action Link Banner */}
          {targetUrl && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900">Step 1: Open Target URL</p>
                <p className="text-[11px] text-gray-500">
                  Open the target link in a new tab, complete the requested action, and take screenshots.
                </p>
              </div>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Open Link</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Dynamic Action Helper: Comment Box */}
          {work.actionType === "comment" && work.properties?.customCommentText && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Required Comment Text:</span>
                <Button
                  size="sm"
                  variant="text"
                  onClick={handleCopyComment}
                  className="normal-case text-xs text-amber-800 flex items-center gap-1 p-1 hover:bg-amber-100 rounded-lg"
                >
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </Button>
              </div>
              <p className="text-xs text-gray-800 bg-white p-2.5 rounded-xl border border-amber-200/60 font-mono">
                {work.properties.customCommentText}
              </p>
            </div>
          )}

          {/* Dynamic Action Helper: Watch Time */}
          {work.actionType === "watch_time" && work.properties?.watchDuration > 0 && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center gap-2 text-xs text-sky-900">
              <ClockIcon className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Please watch at least <strong>{work.properties.watchDuration} seconds</strong> before taking your completion screenshot.
              </span>
            </div>
          )}
        </Card>

        {/* Proof Submission Form, Already Submitted Notice, or Owner Notice */}
        {work.alreadySubmitted ? (
          <Card className="p-6 sm:p-8 rounded-3xl border border-teal-200 shadow-sm bg-teal-50/60 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-base font-bold text-teal-950">You have already submitted this task!</h3>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Your proof has been submitted and is currently{" "}
                  <strong className="uppercase font-bold">
                    {["APPROVED", "completed"].includes(work.submissionStatus) ? "Approved & Paid" : "Under Review"}
                  </strong>
                  . You can check the review status or track your earnings in your submissions history.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/user/social-works/submissions"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>View My Submissions</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/user/social-works"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    Browse Other Tasks →
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ) : isOwnTask ? (
          <Card className="p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm bg-amber-50/60 space-y-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-base font-bold text-amber-950">You are the owner of this campaign</h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Campaign providers cannot submit proof or earn rewards for their own tasks. You can view submissions, track fulfillment progress, or adjust your task details from your campaigns page.
                </p>
                <div className="pt-2">
                  <Link
                    to="/user/social-works/my-tasks"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Go to My Created Campaigns</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm bg-white space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-gray-900">Step 2: Submit Proof of Work</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Proof Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                {work.proofConfig?.textPrompt || "Your Account Username / Verification Info"} *
              </label>
              <textarea
                rows={3}
                required
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="e.g. My username on the platform is @myuser, subscribed at 7:30 PM..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            {/* Screenshots Uploaders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800">
                  Required Screenshot Proofs ({screenshotCount}) *
                </label>
                <span className="text-[11px] text-gray-400">
                  {screenshots.filter(Boolean).length} of {screenshotCount} uploaded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: screenshotCount }).map((_, idx) => {
                  const uploadedUrl = screenshots[idx];
                  const isUploading = uploadingIndex === idx;
                  const label = screenshotLabels[idx] || `Screenshot #${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/50 space-y-2 relative"
                    >
                      <span className="block text-xs font-semibold text-gray-700 truncate">
                        {label}
                      </span>

                      {uploadedUrl ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-white">
                          <img
                            src={uploadedUrl}
                            alt={label}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition-all"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-teal-500 bg-white hover:bg-teal-50/20 cursor-pointer transition-all p-4 text-center">
                          {isUploading ? (
                            <div className="space-y-2 w-full text-center">
                              <p className="text-xs font-semibold text-teal-700">Uploading… {uploadProgress}%</p>
                              <Progress value={uploadProgress} size="sm" color="teal" />
                            </div>
                          ) : (
                            <>
                              <PhotoIcon className="w-8 h-8 text-gray-400 mb-1" />
                              <span className="text-xs font-bold text-teal-600">Click to Upload</span>
                              <span className="text-[10px] text-gray-400">PNG, JPG up to 10MB</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(idx, e.target.files?.[0])}
                              />
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <Button
                type="submit"
                disabled={submitting || uploadingIndex !== null}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold px-8 py-3 rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting Proof…</span>
                ) : (
                  <>
                    <span>Submit Work for Approval</span>
                    <CheckCircleIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
        )}
      </div>
    </div>
  );
};

export default WorkDetails;
