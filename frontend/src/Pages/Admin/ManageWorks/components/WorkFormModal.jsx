import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import { category } from "../../Works/AllWorks";
import { Modal } from "../../../../Components/AdminLayout/_Ui/AdminUI";

const field =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-colors bg-gray-50 focus:bg-white";

const Label = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

// `category[0]` is the "All Works" pseudo-entry used by the filter bar, not a
// value a work can actually be saved with.
const selectableCategories = category.filter((c) => c.path && c.path !== "all");

const WorkFormModal = ({ editData, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    category: editData?.category || "",
    name: editData?.name || "",
    link: editData?.link || "",
    desc: editData?.desc || "",
  });
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(editData?._id);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit) {
        await api.put(`/work/${editData._id}`, form);
        toast.success("Work updated successfully");
      } else {
        await api.post("/work", form);
        toast.success("Work added successfully");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Work" : "Add New Work"}
      subtitle={isEdit ? "Update the task link and tutorial shown to users." : "Publish a new task link for users to complete."}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="outlined" color="gray" fullWidth className="normal-case rounded-xl" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="work-form"
            fullWidth
            className="normal-case rounded-xl bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/25"
            disabled={saving}
          >
            {saving ? "Saving…" : isEdit ? "Update Work" : "Create Work"}
          </Button>
        </div>
      }
    >
      <form id="work-form" onSubmit={submit} className="space-y-4">
        <div>
          <Label required>Category</Label>
          <select name="category" value={form.category} onChange={change} required className={field}>
            <option value="" disabled>Select a category</option>
            {selectableCategories.map((c) => (
              <option key={c.path} value={c.path}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label required>Title</Label>
          <input name="name" value={form.name} onChange={change} required placeholder="e.g. TikTok like & follow task" className={field} />
        </div>

        <div>
          <Label required>Task Link</Label>
          <input name="link" value={form.link} onChange={change} required type="url" placeholder="https://…" className={field} />
        </div>

        <div>
          <Label required>Description</Label>
          <textarea
            name="desc"
            value={form.desc}
            onChange={change}
            required
            rows={4}
            placeholder="Explain what the user has to do to complete this task."
            className={`${field} resize-none`}
          />
        </div>
      </form>
    </Modal>
  );
};

export default WorkFormModal;
