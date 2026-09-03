import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Input } from "antd";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { refreshUser } from "../../redux/features/user/userSlice";

const PLATFORM_LABELS = {
  youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook", instagram: "Instagram",
  twitter: "X / Twitter", telegram: "Telegram", whatsapp: "WhatsApp", linkedin: "LinkedIn",
  website: "Website", app: "App", other: "Other",
};

const CreateTask = () => {
  const { user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: types } = useQuery({
    queryKey: ["task-types"],
    queryFn: async () => (await api.get("tasks/meta/types")).data,
    staleTime: 60 * 60 * 1000,
  });

  const [taskType, setTaskType] = useState("");
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [proofInstructions, setProofInstructions] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [requiresScreenshot, setRequiresScreenshot] = useState(true);
  const [requiresProofUrl, setRequiresProofUrl] = useState(false);
  const [proofQuestions, setProofQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [typeConfig, setTypeConfig] = useState({});
  const [targetQuantity, setTargetQuantity] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const typeDef = taskType ? types?.[taskType] : null;

  const totalBudget = useMemo(() => {
    const q = Number(targetQuantity);
    const c = Number(costPerUnit);
    if (!Number.isFinite(q) || !Number.isFinite(c)) return 0;
    return Math.round(q * c * 100) / 100;
  }, [targetQuantity, costPerUnit]);

  const insufficientBalance = totalBudget > (user?.balance || 0);

  const selectType = (key) => {
    setTaskType(key);
    setPlatform("");
    const def = types[key];
    const defaults = {};
    Object.entries(def.config || {}).forEach(([k, spec]) => { defaults[k] = spec.default; });
    setTypeConfig(defaults);
    setRequiresScreenshot(def.proof.screenshot !== "none");
    setRequiresProofUrl(def.proof.url === "required");
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    if (proofQuestions.length >= 10) return toast.error("Maximum 10 questions");
    setProofQuestions((prev) => [...prev, newQuestion.trim()]);
    setNewQuestion("");
  };

  const canSubmit = taskType && platform && title.trim() && description.trim() && targetUrl.trim()
    && Number(targetQuantity) > 0 && Number(costPerUnit) > 0 && !insufficientBalance;

  const onSubmit = async () => {
    if (!canSubmit) return toast.error("Please fill in all required fields");
    setSubmitting(true);
    try {
      await api.post("tasks", {
        taskType, platform, title, description, targetUrl,
        proofInstructions, accountLabel,
        requiresScreenshot, requiresProofUrl, proofQuestions,
        typeConfig, targetQuantity: Number(targetQuantity), costPerUnit: Number(costPerUnit),
      });
      toast.success("টাস্ক জমা হয়েছে এবং এডমিন অনুমোদনের অপেক্ষায় আছে");
      dispatch(refreshUser(user._id));
      navigate("/user/provider/tasks");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!types) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8faff] py-8 px-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-bold text-[#0b0c2a]">Create a Task</h1>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">1. Choose task type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(types).map(([key, def]) => (
              <button
                key={key}
                onClick={() => selectType(key)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  taskType === key ? "bg-[#0d9488] text-white border-[#0d9488]" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                }`}
              >
                {def.label}
              </button>
            ))}
          </div>

          {typeDef && (
            <div>
              <label className="text-xs font-semibold text-gray-600">Platform</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {typeDef.platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${
                      platform === p ? "bg-teal-50 border-teal-400 text-teal-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    {PLATFORM_LABELS[p] || p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {typeDef && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700">2. Task details</h2>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input.TextArea placeholder="Description / instructions for the worker" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Target URL (e.g. your video/page link)" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />

            {Object.entries(typeDef.config || {}).map(([key, spec]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-600">
                  Minimum duration (seconds){spec.required ? "" : " (optional)"}
                </label>
                <Input
                  type="number"
                  min={spec.min}
                  value={typeConfig[key] ?? ""}
                  onChange={(e) => setTypeConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={String(spec.default)}
                />
              </div>
            ))}
          </div>
        )}

        {typeDef && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700">3. Proof requirements</h2>
            {typeDef.proof.account !== "none" && (
              <Input
                placeholder='Account label, e.g. "Your YouTube channel name"'
                value={accountLabel}
                onChange={(e) => setAccountLabel(e.target.value)}
              />
            )}
            {typeDef.proof.screenshot !== "none" && (
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={requiresScreenshot} disabled={typeDef.proof.screenshot === "required"} onChange={(e) => setRequiresScreenshot(e.target.checked)} />
                Require a screenshot
              </label>
            )}
            {typeDef.proof.url !== "none" && (
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={requiresProofUrl} disabled={typeDef.proof.url === "required"} onChange={(e) => setRequiresProofUrl(e.target.checked)} />
                Require a proof link (URL to the comment/post/review)
              </label>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600">Extra questions for the worker (optional)</label>
              <div className="space-y-2 mt-2">
                {proofQuestions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-xs bg-gray-50 rounded-lg px-3 py-2">{q}</span>
                    <button onClick={() => setProofQuestions((prev) => prev.filter((_, idx) => idx !== i))}>
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input placeholder="Add a question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} onPressEnter={addQuestion} />
                  <button onClick={addQuestion} className="p-2 bg-teal-50 rounded-lg text-teal-600"><PlusIcon className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <Input.TextArea placeholder="Additional proof instructions (optional)" rows={2} value={proofInstructions} onChange={(e) => setProofInstructions(e.target.value)} />
          </div>
        )}

        {typeDef && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700">4. Quantity & price</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Target quantity</label>
                <Input type="number" min={1} value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} placeholder="e.g. 100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Cost per unit (৳)</label>
                <Input type="number" min={0} step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} placeholder="e.g. 2.00" />
              </div>
            </div>

            <div className={`rounded-xl p-4 ${insufficientBalance ? "bg-red-50" : "bg-teal-50"}`}>
              <p className="text-xs text-gray-600">Total budget (held in escrow)</p>
              <p className={`text-2xl font-black ${insufficientBalance ? "text-red-600" : "text-teal-700"}`}>৳{totalBudget.toFixed(2)}</p>
              <p className="text-[11px] text-gray-500 mt-1">Your balance: ৳{(user?.balance || 0).toFixed(2)}</p>
              {insufficientBalance && <p className="text-[11px] text-red-600 font-semibold mt-1">Insufficient balance</p>}
            </div>

            <button
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0284c7] text-white font-bold text-sm disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTask;
