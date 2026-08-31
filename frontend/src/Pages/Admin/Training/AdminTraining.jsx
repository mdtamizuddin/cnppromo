import React, { useState, useMemo } from "react";
import { Button } from "@material-tailwind/react";
import {
  PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon,
  XMarkIcon, BookOpenIcon, VideoCameraIcon, UserGroupIcon, BoltIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";
import {
  PageHeader, TableCard, TableHead, EmptyState, SkeletonRows,
  IconAction, SegmentedTabs, StatusPill, Modal, ACCENTS,
} from "../../../Components/AdminLayout/_Ui/AdminUI";
import DeleteConfirmModal from "../../../Components/DeleteConfirmModal";

const ACCENT = ACCENTS.purple || { gradient: "from-violet-600 to-indigo-600", text: "text-violet-600", solid: "bg-violet-600", shadow: "shadow-violet-500/25", row: "hover:bg-violet-50/40" };

const TABS = [
  { key: "courses", label: "Courses" },
  { key: "trainers", label: "Trainers" },
  { key: "quickActions", label: "Quick Actions" },
];

/* ── Small labelled input ─────────────────────────────────────────────── */
const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</span>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
    />
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</span>
    <textarea
      {...props}
      className="w-full border border-gray-200 rounded-xl bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors resize-none"
    />
  </label>
);

/* ── Course form modal ────────────────────────────────────────────────── */
const CourseFormModal = ({ editData, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    title: editData?.title || "",
    subtitle: editData?.subtitle || "",
    lessons: editData?.lessons || "",
    level: editData?.level || "",
    icon: editData?.icon || "💻",
    bg: editData?.bg || "from-purple-600 via-indigo-600 to-purple-800",
    tagColor: editData?.tagColor || "bg-purple-50 text-[#5a32fa]",
    videoUrl: editData?.videoUrl || "",
    status: editData?.status || "active",
    order: editData?.order ?? 0,
  }));
  const [topics, setTopics] = useState(
    () => (editData?.topics?.length ? editData.topics : [""])
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, topics: topics.map((t) => t.trim()).filter(Boolean), order: Number(form.order) || 0 };
    try {
      if (editData?._id) {
        await api.put(`training/course/${editData._id}`, payload);
        toast.success("Course updated");
      } else {
        await api.post("training/course", payload);
        toast.success("Course created");
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editData?._id ? "Edit Course" : "Add Course"}
      subtitle="Video + topics shown on the user Training page"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="text" color="gray" className="normal-case rounded-xl" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="course-form"
            disabled={saving}
            className={`normal-case rounded-xl text-white shadow-md ${ACCENT.solid}`}
          >
            {saving ? "Saving..." : editData?._id ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      }
    >
      <form id="course-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" required value={form.title} onChange={set("title")} placeholder="How to find & complete tasks" />
          <Field label="Icon (emoji)" value={form.icon} onChange={set("icon")} placeholder="💻" />
        </div>
        <Field label="Subtitle" value={form.subtitle} onChange={set("subtitle")} placeholder="Short description shown under the title" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Lessons" value={form.lessons} onChange={set("lessons")} placeholder="12 টি লেসন" />
          <Field label="Level" value={form.level} onChange={set("level")} placeholder="শুরুকারীদের জন্য" />
          <Field label="Order" type="number" value={form.order} onChange={set("order")} placeholder="0" />
        </div>
        <Field label="Video URL" value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://www.youtube.com/watch?v=..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Gradient (bg)" value={form.bg} onChange={set("bg")} placeholder="from-purple-600 via-indigo-600 to-purple-800" />
          <Field label="Tag color (classes)" value={form.tagColor} onChange={set("tagColor")} placeholder="bg-purple-50 text-[#5a32fa]" />
        </div>
        <label className="block">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Topics (learning points)</span>
          <div className="space-y-2">
            {topics.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={t}
                  onChange={(e) => setTopics((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Topic ${i + 1}`}
                  className="w-full border border-gray-200 rounded-xl bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setTopics((arr) => arr.filter((_, j) => j !== i))}
                  className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  disabled={topics.length === 1}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTopics((arr) => [...arr, ""])}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Add topic
          </button>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</span>
          <select
            value={form.status}
            onChange={set("status")}
            className="border border-gray-200 rounded-xl bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-violet-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

/* ── Trainer form modal ───────────────────────────────────────────────── */
const TrainerFormModal = ({ editData, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    name: editData?.name || "",
    title: editData?.title || "",
    image: editData?.image || "",
    time: editData?.time || "",
    whatsapp: editData?.whatsapp || "",
    status: editData?.status || "active",
    order: editData?.order ?? 0,
  }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editData?._id) {
        await api.put(`training/trainer/${editData._id}`, payload);
        toast.success("Trainer updated");
      } else {
        await api.post("training/trainer", payload);
        toast.success("Trainer created");
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save trainer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editData?._id ? "Edit Trainer" : "Add Trainer"}
      subtitle="Support team members shown on the user Training page"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="text" color="gray" className="normal-case rounded-xl" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="trainer-form"
            disabled={saving}
            className={`normal-case rounded-xl text-white shadow-md ${ACCENT.solid}`}
          >
            {saving ? "Saving..." : editData?._id ? "Save Changes" : "Create Trainer"}
          </Button>
        </div>
      }
    >
      <form id="trainer-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" required value={form.name} onChange={set("name")} placeholder="Promity Remeen" />
          <Field label="Title" value={form.title} onChange={set("title")} placeholder="CNP Promo Trainer & Admin" />
        </div>
        {form.image ? (
          <div className="flex items-center gap-3">
            <img src={form.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-violet-200" />
            <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))} className="text-xs font-bold text-rose-500 hover:underline">Remove image</button>
          </div>
        ) : null}
        <Field label="Image URL" value={form.image} onChange={set("image")} placeholder="https://.../photo.jpg" />
        <Field label="Availability Time" value={form.time} onChange={set("time")} placeholder="4:00 PM to 6:00 PM" />
        <Field label="WhatsApp Link" value={form.whatsapp} onChange={set("whatsapp")} placeholder="https://wa.me/+8801772271543" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Field label="Order" type="number" value={form.order} onChange={set("order")} placeholder="0" />
          <label className="block">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</span>
            <select value={form.status} onChange={set("status")} className="w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </form>
    </Modal>
  );
};

/* ── Quick Action form modal ──────────────────────────────────────────── */
const QuickActionFormModal = ({ editData, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    title: editData?.title || "",
    subtitle: editData?.subtitle || "",
    to: editData?.to || "",
    icon: editData?.icon || "play",
    color: editData?.color || "#5a32fa",
    bg: editData?.bg || "bg-purple-50",
    status: editData?.status || "active",
    order: editData?.order ?? 0,
  }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editData?._id) {
        await api.put(`training/quick-action/${editData._id}`, payload);
        toast.success("Quick action updated");
      } else {
        await api.post("training/quick-action", payload);
        toast.success("Quick action created");
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save quick action");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editData?._id ? "Edit Quick Action" : "Add Quick Action"}
      subtitle="Shortcut cards on the user Training page"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="text" color="gray" className="normal-case rounded-xl" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="qa-form"
            disabled={saving}
            className={`normal-case rounded-xl text-white shadow-md ${ACCENT.solid}`}
          >
            {saving ? "Saving..." : editData?._id ? "Save Changes" : "Create Quick Action"}
          </Button>
        </div>
      }
    >
      <form id="qa-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" required value={form.title} onChange={set("title")} placeholder="Video Lessons" />
          <Field label="Subtitle" value={form.subtitle} onChange={set("subtitle")} placeholder="Watch & learn" />
        </div>
        <Field label="Link (to)" value={form.to} onChange={set("to")} placeholder="/user/social-works" />
        <Field label="Icon key" value={form.icon} onChange={set("icon")} placeholder="play | document | lightbulb | chat | shield | sparkles | video" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Field label="Color (hex)" value={form.color} onChange={set("color")} placeholder="#5a32fa" />
          <Field label="Bg classes" value={form.bg} onChange={set("bg")} placeholder="bg-purple-50" />
          <Field label="Order" type="number" value={form.order} onChange={set("order")} placeholder="0" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</span>
          <select value={form.status} onChange={set("status")} className="border border-gray-200 rounded-xl bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-violet-500">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

/* ── Main page ────────────────────────────────────────────────────────── */
const AdminTraining = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading, isFetching, refetch } = useQuery(
    ["admin-training"],
    async () => (await api.get("training/all")).data,
    { staleTime: 30000 }
  );

  const courses = data?.courses || [];
  const trainers = data?.trainers || [];
  const quickActions = data?.quickActions || [];

  const term = search.trim().toLowerCase();
  const filterBy = (arr, keys) =>
    term
      ? arr.filter((x) => keys.some((k) => (x[k] || "").toLowerCase().includes(term)))
      : arr;

  const visibleCourses = useMemo(() => filterBy(courses, ["title", "subtitle"]), [courses, term]);
  const visibleTrainers = useMemo(() => filterBy(trainers, ["name", "title"]), [trainers, term]);
  const visibleActions = useMemo(() => filterBy(quickActions, ["title", "to"]), [quickActions, term]);

  const refresh = () => {
    refetch();
    queryClient.invalidateQueries(["user-training"]);
  };

  const openCreate = (type) => { setFormType(type); setFormData(null); };
  const openEdit = (type, item) => { setFormType(type); setFormData(item); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    if (!item?._id) return;
    setDeletingId(item._id);
    const path = type === "courses" ? "course" : type === "trainers" ? "trainer" : "quick-action";
    try {
      await api.delete(`training/${path}/${item._id}`);
      toast.success("Deleted");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const openDelete = (type, item) => setDeleteTarget({ type, item });

  const counts = {
    courses: courses.filter((c) => c.status === "active").length,
    trainers: trainers.filter((t) => t.status === "active").length,
    quickActions: quickActions.filter((q) => q.status === "active").length,
  };

  const columnMap = {
    courses: ["Course", "Video", "Level", "Order", "Status", ""],
    trainers: ["Trainer", "Availability", "WhatsApp", "Order", "Status", ""],
    quickActions: ["Action", "Link", "Icon", "Order", "Status", ""],
  };

  const current = TABS.find((t) => t.key === activeTab);
  const countBadge = (key) => counts[key] ?? 0;

  return (
    <div className="w-full pb-10">
      <PageHeader
        icon={BookOpenIcon}
        accent="purple"
        title="Manage Training"
        subtitle="Courses, trainers and quick actions shown on the user Training page."
        action={
          <div className="flex items-center gap-2">
            <IconAction icon={ArrowPathIcon} label="Refresh" tone="purple" onClick={refresh} disabled={isFetching} />
            <Button
              size="sm"
              onClick={() => openCreate(activeTab)}
              className={`normal-case text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
            >
              <PlusIcon className="w-4 h-4" strokeWidth={2.2} />
              Add {current?.label.slice(0, -1) || "Course"}
            </Button>
          </div>
        }
      />

      <div className="mb-5">
        <SegmentedTabs
          accent="purple"
          value={activeTab}
          onChange={setActiveTab}
          tabs={TABS.map((t) => ({ key: t.key, label: t.label, count: countBadge(t.key) }))}
        />
      </div>

      <TableCard
        toolbar={
          <>
            <div className="relative w-full lg:w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-colors"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-500">
              Showing{" "}
              <span className={ACCENT.text}>
                {activeTab === "courses" ? visibleCourses.length : activeTab === "trainers" ? visibleTrainers.length : visibleActions.length}
              </span>
            </p>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] table-auto text-left">
            <TableHead columns={columnMap[activeTab]} />
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <SkeletonRows rows={5} cols={columnMap[activeTab].length} />
              ) : activeTab === "courses" ? (
                visibleCourses.map((c) => (
                  <tr key={c._id} className={`${ACCENT.row} transition-colors group`}>
                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl grid place-items-center text-lg bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-200/60">
                          {c.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.subtitle}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{c.topics?.length ?? 0} topics • {c.lessons || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      {c.videoUrl ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-semibold">
                          <VideoCameraIcon className="w-4 h-4" />
                          <a href={c.videoUrl} target="_blank" rel="noreferrer" className="hover:underline">{c.videoUrl.length > 28 ? `${c.videoUrl.slice(0, 28)}…` : c.videoUrl}</a>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-gray-600">{c.level || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-gray-600">{c.order ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <StatusPill tone={c.status === "active" ? "green" : "gray"}>{c.status}</StatusPill>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex justify-end gap-0.5">
                        <IconAction icon={PencilSquareIcon} label="Edit" tone="blue" onClick={() => openEdit("courses", c)} />
                        <IconAction icon={TrashIcon} label="Delete" tone="red" disabled={deletingId === c._id} onClick={() => openDelete("courses", c)} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : activeTab === "trainers" ? (
                visibleTrainers.map((t) => (
                  <tr key={t._id} className={`${ACCENT.row} transition-colors group`}>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-3">
                        {t.image ? (
                          <img src={t.image} alt="" className="shrink-0 w-10 h-10 rounded-full object-cover border-2 border-violet-200" />
                        ) : (
                          <div className="shrink-0 w-10 h-10 rounded-full grid place-items-center bg-violet-100 text-violet-600">
                            <UserGroupIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.title || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-gray-600">{t.time || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      {t.whatsapp ? (
                        <a href={t.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline">
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-gray-600">{t.order ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <StatusPill tone={t.status === "active" ? "green" : "gray"}>{t.status}</StatusPill>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex justify-end gap-0.5">
                        <IconAction icon={PencilSquareIcon} label="Edit" tone="blue" onClick={() => openEdit("trainers", t)} />
                        <IconAction icon={TrashIcon} label="Delete" tone="red" disabled={deletingId === t._id} onClick={() => openDelete("trainers", t)} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                visibleActions.map((q) => (
                  <tr key={q._id} className={`${ACCENT.row} transition-colors group`}>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl grid place-items-center text-white" style={{ backgroundColor: q.color }}>
                          <BoltIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{q.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{q.subtitle || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-violet-600 font-semibold break-all">{q.to || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-gray-600">{q.icon || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-xs text-gray-600">{q.order ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <StatusPill tone={q.status === "active" ? "green" : "gray"}>{q.status}</StatusPill>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex justify-end gap-0.5">
                        <IconAction icon={PencilSquareIcon} label="Edit" tone="blue" onClick={() => openEdit("quickActions", q)} />
                        <IconAction icon={TrashIcon} label="Delete" tone="red" disabled={deletingId === q._id} onClick={() => openDelete("quickActions", q)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && (
          activeTab === "courses" && visibleCourses.length === 0 ? (
            <EmptyState icon={BookOpenIcon} title="No courses yet" message="Create your first training course for users to watch." action={<Button size="sm" onClick={() => openCreate("courses")} className={`normal-case rounded-xl text-white shadow-md ${ACCENT.solid}`}>Add Course</Button>} />
          ) : activeTab === "trainers" && visibleTrainers.length === 0 ? (
            <EmptyState icon={UserGroupIcon} title="No trainers yet" message="Add support team members shown on the training page." action={<Button size="sm" onClick={() => openCreate("trainers")} className={`normal-case rounded-xl text-white shadow-md ${ACCENT.solid}`}>Add Trainer</Button>} />
          ) : activeTab === "quickActions" && visibleActions.length === 0 ? (
            <EmptyState icon={BoltIcon} title="No quick actions yet" message="Add shortcut cards shown on the training page." action={<Button size="sm" onClick={() => openCreate("quickActions")} className={`normal-case rounded-xl text-white shadow-md ${ACCENT.solid}`}>Add Quick Action</Button>} />
          ) : null
        )}
      </TableCard>

      {formType === "courses" && (
        <CourseFormModal editData={formData} onClose={() => setFormType(null)} onSuccess={refresh} />
      )}
      {formType === "trainers" && (
        <TrainerFormModal editData={formData} onClose={() => setFormType(null)} onSuccess={refresh} />
      )}
      {formType === "quickActions" && (
        <QuickActionFormModal editData={formData} onClose={() => setFormType(null)} onSuccess={refresh} />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.item?.title || deleteTarget?.item?.name || "item"}"?`}
        message="আপনি কি নিশ্চিত যে এটি স্থায়ীভাবে মুছে ফেলতে চান? এই অ্যাকশনটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।"
        itemName={deleteTarget?.item?.title || deleteTarget?.item?.name}
        confirmText="Delete"
        loading={deletingId === deleteTarget?.item?._id}
      />
    </div>
  );
};

export default AdminTraining;
