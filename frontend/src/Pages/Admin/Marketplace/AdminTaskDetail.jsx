import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Input } from "antd";
import toast from "react-hot-toast";
import { ClipboardDocumentCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import {
  PageHeader, DetailTile, TableCard, TableHead, EmptyState, SkeletonRows,
  StatusPill, SegmentedTabs, Modal,
} from "../../../Components/AdminLayout/_Ui/AdminUI";

const STATUS_TABS = [
  { key: "all", label: "All" }, { key: "PENDING", label: "Pending" }, { key: "APPROVED", label: "Approved" },
  { key: "AUTO_APPROVED", label: "Auto" }, { key: "REJECTED", label: "Rejected" },
  { key: "REPORTED", label: "Reported" }, { key: "ADMIN_APPROVED", label: "Admin" },
];

const AdminTaskDetail = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("all");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);
  const queryClient = useQueryClient();

  const { data: task } = useQuery({
    queryKey: ["admin-task", id],
    queryFn: async () => (await api.get(`tasks/admin/${id}`)).data,
  });
  const { data: subs, isLoading } = useQuery({
    queryKey: ["admin-task-subs", id, status],
    queryFn: async () => (await api.get(`tasks/admin/${id}/submissions${status !== "all" ? `?status=${status}` : ""}`)).data,
  });

  const refresh = () => {
    queryClient.invalidateQueries(["admin-task", id]);
    queryClient.invalidateQueries(["admin-task-subs", id]);
  };

  const approve = async (subId) => {
    setBusy(subId);
    try {
      await api.put(`tasks/admin/submissions/${subId}/approve`);
      toast.success("Approved (admin override)");
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (!reason.trim()) return toast.error("A reason is required");
    setBusy(rejectTarget._id);
    try {
      await api.put(`tasks/admin/submissions/${rejectTarget._id}/reject`, { reason });
      toast.success("Rejected (admin override)");
      setRejectTarget(null);
      setReason("");
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  const purgeNow = async () => {
    setBusy("purge");
    try {
      await api.post(`tasks/admin/${id}/purge-media`);
      toast.success("Media purged");
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Not eligible yet");
    } finally {
      setBusy(null);
    }
  };

  if (!task) return <div className="p-6 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="p-4 sm:p-6">
      <PageHeader icon={ClipboardDocumentCheckIcon} title={task.title} subtitle={`Provider: ${task.provider?.name || task.provider?.username || "—"}`} accent="teal" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <DetailTile label="Cost / Unit (gross)">৳{task.costPerUnit?.toFixed(2)}</DetailTile>
        <DetailTile label="Net / Unit">৳{task.netPerUnit?.toFixed(2)}</DetailTile>
        <DetailTile label="Fee / Unit">৳{task.feePerUnit?.toFixed(2)}</DetailTile>
        <DetailTile label="Commission Rate">{task.commissionRate}%</DetailTile>
        <DetailTile label="Total Budget">৳{task.totalBudget?.toFixed(2)}</DetailTile>
        <DetailTile label="Escrow Held">৳{task.escrowHeld?.toFixed(2)}</DetailTile>
        <DetailTile label="Escrow Released">৳{task.escrowReleased?.toFixed(2)}</DetailTile>
        <DetailTile label="Progress">{task.approvedCount}/{task.targetQuantity}</DetailTile>
      </div>

      <div className="flex items-center justify-between mb-4">
        <StatusPill tone={task.status === "ACTIVE" ? "green" : task.status === "REJECTED" ? "red" : "gray"}>{task.status}</StatusPill>
        {["COMPLETED", "CANCELLED"].includes(task.status) && !task.mediaPurgedAt && (
          <button onClick={purgeNow} disabled={busy === "purge"} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:underline">
            <TrashIcon className="w-4 h-4" /> Purge Media Now
          </button>
        )}
        {task.mediaPurgedAt && <span className="text-xs text-gray-400">Media purged</span>}
      </div>

      <TableCard toolbar={<SegmentedTabs tabs={STATUS_TABS} value={status} onChange={setStatus} accent="teal" fullWidth />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead columns={["Worker", "Account", "Amounts (G/N/F)", "Status", "Submitted", ""]} />
            <tbody>
              {isLoading ? (
                <SkeletonRows rows={5} cols={6} />
              ) : (subs?.data || []).length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={ClipboardDocumentCheckIcon} title="No submissions" /></td></tr>
              ) : (
                subs.data.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100 align-top">
                    <td className="px-4 py-3 text-xs font-semibold">{s.worker?.name || s.worker?.username || "—"}</td>
                    <td className="px-4 py-3 text-xs">{s.proof?.account || "—"}</td>
                    <td className="px-4 py-3 text-xs">৳{s.grossAmount?.toFixed(2)} / ৳{s.netAmount?.toFixed(2)} / ৳{s.feeAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusPill tone={s.status === "PENDING" ? "amber" : s.status === "REJECTED" ? "red" : "green"}>{s.status}</StatusPill></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {s.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(s._id)} disabled={busy === s._id} className="text-emerald-600 hover:underline text-xs font-bold">Approve</button>
                          <button onClick={() => setRejectTarget(s)} className="text-red-500 hover:underline text-xs font-bold">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableCard>

      {rejectTarget && (
        <Modal
          title="Reject Submission (admin override)"
          onClose={() => setRejectTarget(null)}
          footer={
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-bold">Cancel</button>
              <button onClick={reject} disabled={!!busy} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Reject</button>
            </div>
          }
        >
          <Input.TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
        </Modal>
      )}
    </div>
  );
};

export default AdminTaskDetail;
