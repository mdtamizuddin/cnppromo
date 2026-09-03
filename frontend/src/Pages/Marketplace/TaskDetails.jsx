import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Spin, Input } from "antd";
import toast from "react-hot-toast";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { downscaleImage } from "../../util/downscaleImage";
import WatchGate from "./gates/WatchGate";
import DwellGate from "./gates/DwellGate";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task-feed", id],
    queryFn: async () => (await api.get(`tasks/feed/${id}`)).data,
  });
  const { data: types } = useQuery({
    queryKey: ["task-types"],
    queryFn: async () => (await api.get("tasks/meta/types")).data,
    staleTime: 60 * 60 * 1000,
  });

  const [gateProgress, setGateProgress] = useState({ credited: 0, min: 0 });
  const [account, setAccount] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !types) return <Spin size="large" fullscreen />;
  if (!task) return <div className="p-10 text-center text-gray-500">Task not found.</div>;

  const typeDef = types[task.taskType] || {};
  const gate = typeDef.gate || "NONE";
  const gateSatisfied = gate === "NONE" || gateProgress.credited >= gateProgress.min;

  const handleFiles = async (files) => {
    if (screenshots.length + files.length > 3) {
      toast.error("You can attach up to 3 screenshots");
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const small = await downscaleImage(file);
        const form = new FormData();
        form.append("image", small);
        form.append("folder", "task-proofs");
        const res = await api.post("/upload", form);
        setScreenshots((prev) => [...prev, res.data.url]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (url) => setScreenshots((prev) => prev.filter((s) => s !== url));

  const canSubmit = () => {
    if (!gateSatisfied) return false;
    if (task.requiresScreenshot && screenshots.length === 0) return false;
    if (task.requiresProofUrl && !proofUrl.trim()) return false;
    for (const q of task.proofQuestions || []) {
      if (!(answers[q] || "").trim()) return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!canSubmit()) {
      toast.error("Please complete all required fields first");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`tasks/feed/${id}/submit`, {
        account,
        url: proofUrl,
        note,
        screenshots,
        answers: (task.proofQuestions || []).map((q) => ({ question: q, answer: answers[q] || "" })),
      });
      toast.success("সাবমিট সফল হয়েছে! রিভিউয়ের অপেক্ষায় আছে।");
      navigate("/user/my-submissions");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] py-8 px-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-xl font-bold text-[#0b0c2a]">{task.title}</h1>
          <p className="text-sm text-gray-600 mt-2">{task.description}</p>
          {task.proofInstructions && (
            <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-3 rounded-xl">{task.proofInstructions}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <a href={task.targetUrl} target="_blank" rel="noreferrer" className="text-teal-600 text-xs font-semibold underline">
              View target link
            </a>
            <p className="text-lg font-black text-emerald-600">৳{(task.reward || 0).toFixed(2)}</p>
          </div>
        </div>

        {gate !== "NONE" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Step 1: Complete the action</h2>
            {gate === "WATCH_SESSION" ? (
              <WatchGate task={task} taskId={id} onProgress={(credited, min) => setGateProgress({ credited, min })} />
            ) : (
              <DwellGate task={task} taskId={id} onProgress={(credited, min) => setGateProgress({ credited, min })} />
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">Step {gate !== "NONE" ? "2" : "1"}: Submit proof</h2>

          {task.accountLabel && (
            <div>
              <label className="text-xs font-semibold text-gray-600">{task.accountLabel}</label>
              <Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder={task.accountLabel} className="mt-1" />
            </div>
          )}

          {task.requiresProofUrl && (
            <div>
              <label className="text-xs font-semibold text-gray-600">Proof URL (link to your comment/post/review)</label>
              <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
          )}

          {(task.proofQuestions || []).map((q) => (
            <div key={q}>
              <label className="text-xs font-semibold text-gray-600">{q}</label>
              <Input.TextArea
                rows={2}
                value={answers[q] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                className="mt-1"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-gray-600">
              Screenshot{task.requiresScreenshot ? "" : " (optional)"} — up to 3
            </label>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {screenshots.map((url) => (
                <div key={url} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <button
                    onClick={() => removeScreenshot(url)}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {screenshots.length < 3 && (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 hover:border-teal-400 hover:text-teal-500">
                  {uploading ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PhotoIcon className="w-6 h-6" />
                  )}
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files?.length && handleFiles(e.target.files)} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Note to provider (optional)</label>
            <Input.TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" />
          </div>

          <button
            onClick={onSubmit}
            disabled={!canSubmit() || submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0284c7] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : !gateSatisfied ? "Complete step 1 first" : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
