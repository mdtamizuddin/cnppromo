import React, { useState } from 'react';
import { Card, Button, Input, Textarea } from "@material-tailwind/react";
import { 
  PlusIcon, ChevronUpIcon, PencilSquareIcon, TrashIcon, 
  ClockIcon, BanknotesIcon, CheckCircleIcon, XCircleIcon 
} from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../../../../util/axios";
import toast from "react-hot-toast";
import moment from "moment";

const SocialWorkFormModal = ({ editData, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: editData?.title || "",
    description: editData?.description || "",
    url: editData?.url || "",
    price: editData?.price || "",
    duration: editData?.duration || "",
    status: editData?.status || "active",
  });
  const [questions, setQuestions] = useState(editData?.questions || []);
  const [newQ, setNewQ] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addQuestion = () => {
    if (newQ.trim()) { setQuestions([...questions, newQ.trim()]); setNewQ(""); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...form, questions, price: Number(form.price), duration: Number(form.duration) };
      if (editData?._id) {
        await api.put(`social-works/${editData._id}`, payload);
        toast.success("Work updated successfully");
      } else {
        await api.post("social-works/create", payload);
        toast.success("Work created successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-5">{editData ? "Edit Social Work" : "Add New Social Work"}</h2>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Title *" name="title" value={form.title} onChange={handleChange} required />
            <Textarea label="Description *" name="description" value={form.description} onChange={handleChange} rows={3} required />
            <Input label="Work URL *" name="url" value={form.url} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price (৳) *" name="price" type="number" value={form.price} onChange={handleChange} required />
              <Input label="Duration (seconds) *" name="duration" type="number" value={form.duration} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Questions ({questions.length})</label>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-700 flex-1">{q}</span>
                    <button type="button" onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    type="text" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Add a question..." 
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                  />
                  <Button type="button" size="sm" variant="outlined" onClick={addQuestion} className="normal-case">Add</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outlined" color="gray" fullWidth className="normal-case" onClick={onClose}>Cancel</Button>
              <Button type="submit" color="blue" fullWidth className="normal-case" disabled={loading}>
                {loading ? "Saving..." : editData ? "Update Work" : "Create Work"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

const SubmitReviewModal = ({ submit, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      await api.put(`social-works/complete/${submit._id}`);
      toast.success("Submission approved & balance credited!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Reject & delete this submission?");
    if (!confirm) return;
    try {
      setLoading(true);
      await api.delete(`social-works/submit/${submit._id}`);
      toast.success("Submission rejected");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Review Submission</h2>
          <p className="text-sm text-gray-500 mb-5">Task: <span className="font-semibold text-gray-800">{submit.workId?.title}</span></p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">User</p>
              <p className="text-sm font-bold text-gray-900">{submit.userId?.name}</p>
              <p className="text-xs text-gray-500">@{submit.userId?.username}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Duration</p>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-teal-500" />
                {submit.duration}s
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Reward</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <BanknotesIcon className="w-4 h-4" />
                ৳{submit.workId?.price}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Submitted</p>
              <p className="text-sm font-bold text-gray-900">{moment(submit.createdAt).fromNow()}</p>
            </div>
          </div>

          {submit.answers?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Answers</p>
              <div className="space-y-2">
                {submit.answers.map((ans, i) => (
                  <div key={i} className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-500 font-semibold mb-0.5">Q{i + 1}: {submit.workId?.questions?.[i]}</p>
                    <p className="text-sm text-gray-800">{ans}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outlined" color="red" fullWidth className="normal-case flex items-center justify-center gap-1.5" onClick={handleDelete} disabled={loading}>
              <XCircleIcon className="w-4 h-4" /> Reject
            </Button>
            <Button color="green" fullWidth className="normal-case flex items-center justify-center gap-1.5" onClick={handleComplete} disabled={loading}>
              <CheckCircleIcon className="w-4 h-4" /> Approve
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

const PremiumAdminSocialWorksTable = () => {
  const [activeTab, setActiveTab] = useState("works"); // "works" | "submissions"
  const [showForm, setShowForm] = useState(false);
  const [editWork, setEditWork] = useState(null);
  const [reviewSubmit, setReviewSubmit] = useState(null);
  const queryClient = useQueryClient();

  const { data: works, isLoading: worksLoading, refetch: refetchWorks } = useQuery(
    ["admin-social-works"],
    async () => { const res = await api.get("social-works/all"); return res.data; },
    { staleTime: 30000 }
  );

  const { data: submissions, isLoading: subsLoading, refetch: refetchSubs } = useQuery(
    ["admin-social-work-submits"],
    async () => { const res = await api.get("social-works/all-submits?status=pending"); return res.data; },
    { staleTime: 30000 }
  );

  const handleDeleteWork = async (id) => {
    const ok = window.confirm("Delete this social work? Any pending submissions cannot be deleted first.");
    if (!ok) return;
    try {
      await api.delete(`social-works/${id}`);
      toast.success("Work deleted");
      refetchWorks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return "-";
    if (sec >= 60) { const m = Math.floor(sec/60); const s = sec % 60; return s > 0 ? `${m}m ${s}s` : `${m}m`; }
    return `${sec}s`;
  };

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Social Works</h1>
          <p className="text-sm text-gray-500 mt-1">Create watch-to-earn tasks and review user submissions.</p>
        </div>
        {activeTab === "works" && (
          <Button
            size="sm"
            onClick={() => { setEditWork(null); setShowForm(true); }}
            className="bg-teal-600 normal-case text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-md shadow-teal-500/20 rounded-xl"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Social Work
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "works", label: `Works (${works?.length || 0})` },
          { key: "submissions", label: `Pending Submissions (${submissions?.length || 0})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Works Table */}
      {activeTab === "works" && (
        <Card className="w-full shadow-sm border border-gray-200 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto text-left">
              <thead>
                <tr>
                  {["Title", "Duration", "Price", "Status", "Submissions", "Action"].map(h => (
                    <th key={h} className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {worksLoading ? (
                  <tr><td colSpan="6" className="py-10 text-center text-sm text-gray-400">Loading...</td></tr>
                ) : works?.map(work => (
                  <tr key={work._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{work.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{work.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 flex items-center gap-1"><ClockIcon className="w-4 h-4 text-gray-400" />{formatDuration(work.duration)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-emerald-600">৳{work.price}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${work.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {work.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-teal-700">{work.count || 0} pending</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="text" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          onClick={() => { setEditWork(work); setShowForm(true); }}>
                          <PencilSquareIcon className="w-5 h-5" />
                        </Button>
                        <Button size="sm" variant="text" className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDeleteWork(work._id)}>
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Submissions Table */}
      {activeTab === "submissions" && (
        <Card className="w-full shadow-sm border border-gray-200 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto text-left">
              <thead>
                <tr>
                  {["User", "Task", "Duration", "Submitted", "Action"].map(h => (
                    <th key={h} className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subsLoading ? (
                  <tr><td colSpan="5" className="py-10 text-center text-sm text-gray-400">Loading...</td></tr>
                ) : submissions?.length === 0 ? (
                  <tr><td colSpan="5" className="py-10 text-center text-sm text-gray-500">No pending submissions 🎉</td></tr>
                ) : submissions?.map(sub => (
                  <tr key={sub._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{sub.userId?.name}</p>
                      <p className="text-xs text-gray-500">@{sub.userId?.username}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{sub.workId?.title}</p>
                      <p className="text-xs text-emerald-600 font-bold">৳{sub.workId?.price}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 flex items-center gap-1"><ClockIcon className="w-4 h-4 text-gray-400" />{sub.duration}s</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{moment(sub.createdAt).fromNow()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outlined" color="teal" className="normal-case py-1.5 px-3"
                        onClick={() => setReviewSubmit(sub)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <SocialWorkFormModal
          editData={editWork}
          onClose={() => { setShowForm(false); setEditWork(null); }}
          onSuccess={refetchWorks}
        />
      )}

      {/* Submission Review Modal */}
      {reviewSubmit && (
        <SubmitReviewModal
          submit={reviewSubmit}
          onClose={() => setReviewSubmit(null)}
          onSuccess={refetchSubs}
        />
      )}
    </div>
  );
};

export default PremiumAdminSocialWorksTable;
