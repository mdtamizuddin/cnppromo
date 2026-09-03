import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { Input } from "antd";
import toast from "react-hot-toast";
import { ClockIcon, ArrowPathIcon, FlagIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

const STATUS_TONE = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  AUTO_APPROVED: "bg-emerald-50 text-emerald-700",
  ADMIN_APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
  REPORTED: "bg-blue-50 text-blue-700",
};

const useCountdown = (target) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const diffMs = new Date(target).getTime() - now;
  if (diffMs <= 0) return "any moment now";
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return days > 0 ? `${days}d ${rem}h` : `${hours}h`;
};

const SubmissionCard = ({ s, onRefresh }) => {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [busy, setBusy] = useState(false);
  const countdown = useCountdown(s.status === "PENDING" ? s.autoApproveAt : null);

  const report = async () => {
    if (!reportReason.trim()) return toast.error("Please describe your issue");
    setBusy(true);
    try {
      await api.post(`tasks/my-submissions/${s._id}/report`, { reportReason });
      toast.success("রিপোর্ট জমা হয়েছে");
      setReportOpen(false);
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{s.task?.title || "Task"}</h3>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STATUS_TONE[s.status] || "bg-gray-100 text-gray-600"}`}>
          {s.status}
        </span>
      </div>
      <p className="text-xs text-gray-500">Amount: ৳{(s.amount || 0).toFixed(2)} · Attempt {s.attempt}</p>

      {s.status === "PENDING" && countdown && (
        <p className="text-[11px] text-amber-600 flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" /> Auto-approves in {countdown}
        </p>
      )}

      {s.status === "REJECTED" && s.rejectionReason && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">Reason: {s.rejectionReason}</p>
      )}

      {s.status === "REPORTED" && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">Your report is being reviewed by admin.</p>
      )}
      {s.status === "REJECTED" && s.reportResolution === "DISMISSED" && (
        <p className="text-xs text-gray-500">Your report was reviewed and the rejection was upheld.</p>
      )}

      {s.status === "REJECTED" && (
        <div className="flex gap-2 pt-1">
          <Link
            to={`/user/tasks/${s.task?._id}`}
            className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center gap-1"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" /> Retry
          </Link>
          {!s.reportResolution && (
            <button
              onClick={() => setReportOpen((v) => !v)}
              className="flex-1 text-xs font-bold py-2 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center gap-1"
            >
              <FlagIcon className="w-3.5 h-3.5" /> Report
            </button>
          )}
        </div>
      )}

      {reportOpen && (
        <div className="pt-2 space-y-2">
          <Input.TextArea
            rows={2}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="কেন মনে করছেন এই প্রত্যাখ্যান ন্যায়সঙ্গত নয়?"
          />
          <button
            onClick={report}
            disabled={busy}
            className="w-full text-xs font-bold py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      )}
    </div>
  );
};

const MySubmissions = () => {
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-submissions", status],
    queryFn: async () => (await api.get(`tasks/my-submissions${status !== "all" ? `?status=${status}` : ""}`)).data,
    staleTime: 15000,
  });

  const refresh = () => queryClient.invalidateQueries(["my-submissions"]);

  const tabs = ["all", "PENDING", "APPROVED", "AUTO_APPROVED", "REJECTED", "REPORTED", "ADMIN_APPROVED"];

  return (
    <div className="min-h-screen bg-[#f8faff] py-8 px-4">
      <div className="container mx-auto max-w-3xl space-y-6">
        <h1 className="text-xl font-bold text-[#0b0c2a]">My Submissions</h1>
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
        ) : (data?.data || []).length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {data.data.map((s) => (
              <SubmissionCard key={s._id} s={s} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissions;
