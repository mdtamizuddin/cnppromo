import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Input } from "antd";
import toast from "react-hot-toast";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

const STATUS_TONE = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  AUTO_APPROVED: "bg-emerald-50 text-emerald-700",
  ADMIN_APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
  REPORTED: "bg-blue-50 text-blue-700",
};

const SubmissionRow = ({ s, onDone }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);

  const approve = async () => {
    setBusy("approve");
    try {
      await api.put(`tasks/mine/submissions/${s._id}/approve`);
      toast.success(`Approved — ৳${(s.amount || 0).toFixed(2)} paid from escrow`);
      onDone();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 5) return toast.error("Please give a reason (5+ characters)");
    setBusy("reject");
    try {
      await api.put(`tasks/mine/submissions/${s._id}/reject`, { reason });
      toast.success("Submission rejected");
      onDone();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const proof = s.proof || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">{s.worker?.name || s.worker?.username || "Worker"}</span>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STATUS_TONE[s.status] || "bg-gray-100"}`}>{s.status}</span>
      </div>
      {proof.account && <p className="text-xs text-gray-600">Account: <b>{proof.account}</b></p>}
      {proof.url && <a href={proof.url} target="_blank" rel="noreferrer" className="text-xs text-teal-600 underline block">Proof link</a>}
      {proof.note && <p className="text-xs text-gray-500 italic">"{proof.note}"</p>}
      {s.creditedSeconds != null && <p className="text-xs text-gray-500">Verified watch time: {Math.floor(s.creditedSeconds)}s</p>}

      {(proof.answers || []).map((a, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-2">
          <p className="text-[11px] font-bold text-gray-500">{a.question}</p>
          <p className="text-xs text-gray-800">{a.answer}</p>
        </div>
      ))}

      {(proof.screenshots || []).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {proof.screenshots.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 block">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement("div"), { className: "w-full h-full flex items-center justify-center text-[9px] text-gray-400", innerText: "N/A" })); }}
              />
            </a>
          ))}
        </div>
      )}
      {s.proofMediaPurged && <p className="text-[11px] text-gray-400">Proof archived — task completed.</p>}

      <p className="text-xs font-bold text-emerald-600">Amount: ৳{(s.amount || 0).toFixed(2)}</p>

      {s.status === "PENDING" && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {!rejecting ? (
            <div className="flex gap-2">
              <button onClick={approve} disabled={!!busy} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50">
                <CheckCircleIcon className="w-4 h-4" /> {busy === "approve" ? "Approving..." : "Approve"}
              </button>
              <button onClick={() => setRejecting(true)} disabled={!!busy} className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5">
                <XCircleIcon className="w-4 h-4" /> Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input.TextArea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection" />
              <div className="flex gap-2">
                <button onClick={reject} disabled={busy === "reject"} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold">
                  {busy === "reject" ? "Rejecting..." : "Confirm Reject"}
                </button>
                <button onClick={() => setRejecting(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-bold">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProviderSubmissions = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: task } = useQuery({
    queryKey: ["provider-task", id],
    queryFn: async () => (await api.get(`tasks/mine/${id}`)).data,
  });
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["provider-task-submissions", id, status],
    queryFn: async () => (await api.get(`tasks/mine/${id}/submissions${status !== "all" ? `?status=${status}` : ""}`)).data,
    staleTime: 10000,
  });

  const refresh = () => {
    queryClient.invalidateQueries(["provider-task-submissions", id]);
    queryClient.invalidateQueries(["provider-task", id]);
  };

  const tabs = ["all", "PENDING", "APPROVED", "AUTO_APPROVED", "REJECTED", "REPORTED", "ADMIN_APPROVED"];
  const sorted = [...(submissions?.data || [])].sort((a, b) => {
    if (a.status !== "PENDING" || b.status !== "PENDING") return 0;
    return new Date(a.autoApproveAt) - new Date(b.autoApproveAt);
  });

  return (
    <div className="min-h-screen bg-[#f8faff] py-8 px-4">
      <div className="container mx-auto max-w-3xl space-y-6">
        {task && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-lg font-bold text-[#0b0c2a]">{task.title}</h1>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Progress</p>
                <p className="text-sm font-black text-gray-900">{task.approvedCount}/{task.targetQuantity}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Escrow Held</p>
                <p className="text-sm font-black text-teal-600">৳{(task.escrowHeld || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Pending</p>
                <p className="text-sm font-black text-amber-600">{task.pendingCount}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatus(t)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 ${
                status === t ? "bg-[#0d9488] text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-gray-400 py-10">Loading...</p>
        ) : sorted.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No submissions here yet.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((s) => (
              <SubmissionRow key={s._id} s={s} onDone={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSubmissions;
