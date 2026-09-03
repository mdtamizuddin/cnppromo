import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Input } from "antd";
import toast from "react-hot-toast";
import {
  ClipboardDocumentCheckIcon, BanknotesIcon, ClockIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XCircleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import {
  PageHeader, StatCard, StatGrid, TableCard, TableHead, EmptyState,
  SkeletonRows, SegmentedTabs, StatusPill, Modal,
} from "../../../Components/AdminLayout/_Ui/AdminUI";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "REJECTED", label: "Rejected" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const STATUS_TONE = {
  PENDING_APPROVAL: "amber", ACTIVE: "green", REJECTED: "red", PAUSED: "gray", COMPLETED: "blue", CANCELLED: "gray",
};

const AdminTasks = () => {
  const [status, setStatus] = useState("PENDING_APPROVAL");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tasks", status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      return (await api.get(`tasks/admin/all?${params.toString()}`)).data;
    },
    staleTime: 15000,
  });

  const refresh = () => queryClient.invalidateQueries(["admin-tasks"]);

  const approve = async (id) => {
    setBusy(id);
    try {
      await api.put(`tasks/admin/${id}/approve`);
      toast.success("Task approved — now live for workers");
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
      await api.put(`tasks/admin/${rejectTarget._id}/reject`, { reason });
      toast.success("Task rejected — escrow refunded");
      setRejectTarget(null);
      setReason("");
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  const tasks = data?.data || [];

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon={ClipboardDocumentCheckIcon}
        title="Task Marketplace"
        subtitle="Moderate provider-funded tasks across the platform"
        accent="teal"
      />

      <StatGrid>
        <StatCard title="Pending" value={tasks.filter((t) => t.status === "PENDING_APPROVAL").length} icon={ClockIcon} colorClass="text-amber-500" bgClass="bg-amber-50" />
        <StatCard title="Active" value={tasks.filter((t) => t.status === "ACTIVE").length} icon={CheckCircleIcon} colorClass="text-emerald-500" bgClass="bg-emerald-50" />
        <StatCard title="Escrow Held" value={`৳${tasks.reduce((s, t) => s + (t.escrowHeld || 0), 0).toFixed(0)}`} icon={BanknotesIcon} colorClass="text-teal-500" bgClass="bg-teal-50" />
        <StatCard title="Total Shown" value={data?.total || 0} icon={ClipboardDocumentCheckIcon} colorClass="text-blue-500" bgClass="bg-blue-50" />
      </StatGrid>

      <TableCard
        toolbar={
          <>
            <SegmentedTabs tabs={STATUS_TABS} value={status} onChange={setStatus} accent="teal" fullWidth />
            <Input placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead columns={["Task", "Provider", "Type", "Qty", "Escrow", "Status", ""]} />
            <tbody>
              {isLoading ? (
                <SkeletonRows rows={5} cols={7} />
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={ClipboardDocumentCheckIcon} title="No tasks" message="Nothing matches this filter." /></td></tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/admin/marketplace/${t._id}`} className="font-semibold text-gray-800 hover:text-teal-600">{t.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.provider?.name || t.provider?.username || "—"}</td>
                    <td className="px-4 py-3 text-xs">{t.taskType}</td>
                    <td className="px-4 py-3 text-xs">{t.approvedCount}/{t.targetQuantity}</td>
                    <td className="px-4 py-3 text-xs font-bold text-teal-600">৳{(t.escrowHeld || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusPill tone={STATUS_TONE[t.status]}>{t.status}</StatusPill></td>
                    <td className="px-4 py-3">
                      {t.status === "PENDING_APPROVAL" && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(t._id)} disabled={busy === t._id} className="text-emerald-600 hover:underline text-xs font-bold">Approve</button>
                          <button onClick={() => setRejectTarget(t)} className="text-red-500 hover:underline text-xs font-bold">Reject</button>
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
          title="Reject Task"
          subtitle={rejectTarget.title}
          onClose={() => setRejectTarget(null)}
          footer={
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-xl bg-gray-100 text-sm font-bold">Cancel</button>
              <button onClick={reject} disabled={!!busy} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Reject & Refund</button>
            </div>
          }
        >
          <Input.TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection (shown to the provider)" />
        </Modal>
      )}
    </div>
  );
};

export default AdminTasks;
