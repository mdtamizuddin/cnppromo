import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Input } from "antd";
import toast from "react-hot-toast";
import { FlagIcon } from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import {
  PageHeader, TableCard, TableHead, EmptyState, SkeletonRows, StatusPill, Modal,
} from "../../../Components/AdminLayout/_Ui/AdminUI";

const ResolveModal = ({ report, onClose, onDone }) => {
  const [mode, setMode] = useState(null); // "dismiss" | "approve"
  const [fineAmount, setFineAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.put(`tasks/admin/reports/${report._id}/resolve`, {
        resolution: mode === "dismiss" ? "DISMISSED" : "UPHELD",
        fineAmount: mode === "approve" ? Number(fineAmount) || 0 : 0,
      });
      toast.success(mode === "dismiss" ? "Report dismissed" : "Force-approved and resolved");
      onDone();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const proof = report.proof || {};

  return (
    <Modal
      title="Resolve Report"
      subtitle={report.task?.title}
      onClose={onClose}
      footer={
        mode ? (
          <div className="flex gap-3">
            <button onClick={() => setMode(null)} className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-bold">Back</button>
            <button onClick={submit} disabled={busy} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
              {busy ? "Submitting..." : "Confirm"}
            </button>
          </div>
        ) : null
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-gray-500">Worker: <b>{report.worker?.name || report.worker?.username}</b></p>
        <p className="text-xs text-gray-500">Provider: <b>{report.provider?.name || report.provider?.username}</b> (balance ৳{(report.provider?.balance || 0).toFixed(2)})</p>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[11px] font-bold text-gray-500">Worker's report</p>
          <p className="text-sm text-gray-800">{report.reportReason}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[11px] font-bold text-gray-500">Provider's rejection reason</p>
          <p className="text-sm text-gray-800">{report.rejectionReason}</p>
        </div>
        {proof.account && <p className="text-xs">Account: <b>{proof.account}</b></p>}
        {(proof.screenshots || []).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {proof.screenshots.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 block">
                <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0.2; }} />
              </a>
            ))}
          </div>
        )}

        {!mode ? (
          <div className="flex gap-3 pt-2">
            <button onClick={() => setMode("dismiss")} className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-bold">Dismiss Report</button>
            <button onClick={() => setMode("approve")} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">Force-Approve</button>
          </div>
        ) : mode === "approve" ? (
          <div>
            <label className="text-xs font-semibold text-gray-600">Fine on provider (BDT, optional)</label>
            <Input type="number" min={0} value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} placeholder="0" />
            <p className="text-[11px] text-gray-400 mt-1">Worker is paid ৳{(report.netAmount || 0).toFixed(2)} from escrow regardless.</p>
          </div>
        ) : (
          <p className="text-xs text-gray-500">The original rejection stands. The worker will be notified.</p>
        )}
      </div>
    </Modal>
  );
};

const AdminReports = () => {
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => (await api.get("tasks/admin/reports")).data,
    staleTime: 10000,
  });

  const refresh = () => queryClient.invalidateQueries(["admin-reports"]);
  const reports = data?.data || [];

  return (
    <div className="p-4 sm:p-6">
      <PageHeader icon={FlagIcon} title="Reports" subtitle="Workers disputing a provider's rejection" accent="purple" />
      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead columns={["Task", "Worker", "Provider", "Reported", ""]} />
            <tbody>
              {isLoading ? (
                <SkeletonRows rows={5} cols={5} />
              ) : reports.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={FlagIcon} title="No open reports" /></td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-xs font-semibold">{r.task?.title}</td>
                    <td className="px-4 py-3 text-xs">{r.worker?.name || r.worker?.username}</td>
                    <td className="px-4 py-3 text-xs">{r.provider?.name || r.provider?.username}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.reportedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(r)} className="text-xs font-bold text-blue-600 hover:underline">Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableCard>

      {selected && <ResolveModal report={selected} onClose={() => setSelected(null)} onDone={refresh} />}
    </div>
  );
};

export default AdminReports;
