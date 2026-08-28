import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import { XCircleIcon, PlusIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import { Modal } from "../../../../Components/AdminLayout/_Ui/AdminUI";
import { youtubeThumb } from "./youtube";

const field =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-colors bg-gray-50 focus:bg-white";

const Label = ({ children, required, hint }) => (
  <div className="flex items-baseline justify-between mb-1.5">
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
  </div>
);

const SocialWorkFormModal = ({ editData, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: editData?.title || "",
    description: editData?.description || "",
    url: editData?.url || "",
    price: editData?.price ?? "",
    duration: editData?.duration ?? "",
    status: editData?.status || "active",
  });
  const [questions, setQuestions] = useState(editData?.questions || []);
  const [newQ, setNewQ] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(editData?._id);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const thumb = youtubeThumb(form.url);

  const addQuestion = () => {
    const q = newQ.trim();
    if (!q) return;
    setQuestions([...questions, q]);
    setNewQ("");
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        questions,
        price: Number(form.price),
        duration: Number(form.duration),
      };
      if (isEdit) {
        await api.put(`social-works/${editData._id}`, payload);
        toast.success("Work updated successfully");
      } else {
        await api.post("social-works/create", payload);
        toast.success("Work created successfully");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save work");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      size="lg"
      title={isEdit ? "Edit Social Work" : "Add New Social Work"}
      subtitle="Watch-to-earn task. Users watch the video, answer the questions, then submit for review."
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="outlined" color="gray" fullWidth className="normal-case rounded-xl" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="social-work-form"
            fullWidth
            className="normal-case rounded-xl bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/25"
            disabled={saving}
          >
            {saving ? "Saving…" : isEdit ? "Update Work" : "Create Work"}
          </Button>
        </div>
      }
    >
      <form id="social-work-form" onSubmit={submit} className="space-y-5">
        <div>
          <Label required>Title</Label>
          <input name="title" value={form.title} onChange={change} required placeholder="e.g. Watch our new promo video" className={field} />
        </div>

        <div>
          <Label required>Description</Label>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            required
            rows={3}
            placeholder="What should the user pay attention to while watching?"
            className={`${field} resize-none`}
          />
        </div>

        <div>
          <Label required hint="YouTube link">Video URL</Label>
          <input name="url" value={form.url} onChange={change} required type="url" placeholder="https://www.youtube.com/watch?v=…" className={field} />
          {thumb && (
            <div className="mt-3 flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="relative shrink-0">
                <img src={thumb} alt="" className="w-24 h-14 object-cover rounded-lg" />
                <PlayCircleIcon className="absolute inset-0 m-auto w-7 h-7 text-white/90 drop-shadow" />
              </div>
              <p className="text-xs text-gray-500">Video preview looks good.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required hint="৳ BDT">Reward</Label>
            <input name="price" type="number" min="0" step="any" value={form.price} onChange={change} required placeholder="0" className={field} />
          </div>
          <div>
            <Label required hint="seconds">Watch Duration</Label>
            <input name="duration" type="number" min="1" value={form.duration} onChange={change} required placeholder="60" className={field} />
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "active", label: "Active", note: "Visible to users" },
              { value: "inactive", label: "Inactive", note: "Hidden from users" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, status: opt.value })}
                className={`text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                  form.status === opt.value
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-100"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span className={`block text-sm font-bold ${form.status === opt.value ? "text-teal-700" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                <span className="block text-[11px] text-gray-400 mt-0.5">{opt.note}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label hint={`${questions.length} added`}>Verification Questions</Label>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl pl-3 pr-2 py-2 border border-gray-100">
                <span className="shrink-0 grid place-items-center w-5 h-5 rounded-md bg-teal-100 text-teal-700 text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-700 flex-1 break-words">{q}</span>
                <button
                  type="button"
                  aria-label={`Remove question ${i + 1}`}
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                placeholder="Add a question users must answer…"
                className={`${field} flex-1`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addQuestion();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outlined"
                color="teal"
                onClick={addQuestion}
                className="normal-case rounded-xl px-3 shrink-0 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </Button>
            </div>

            {questions.length === 0 && (
              <p className="text-[11px] text-gray-400">
                No questions yet — users will only be checked on watch duration.
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SocialWorkFormModal;
