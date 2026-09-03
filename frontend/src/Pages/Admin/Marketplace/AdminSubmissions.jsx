import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { Input } from "antd";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import {
  PageHeader, TableCard, TableHead, EmptyState, SkeletonRows, StatusPill, SegmentedTabs,
} from "../../../Components/AdminLayout/_Ui/AdminUI";

const STATUS_TABS = [
  { key: "all", label: "All" }, { key: "PENDING", label: "Pending" }, { key: "APPROVED", label: "Approved" },
  { key: "AUTO_APPROVED", label: "Auto" }, { key: "REJECTED", label: "Rejected" },
  { key: "REPORTED", label: "Reported" }, { key: "ADMIN_APPROVED", label: "Admin" },
];

const AdminSubmissions = () => {
  const [status, setStatus] = useState("all");
  const [workerId, setWorkerId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-all-submissions", status, workerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (workerId.trim()) params.set("workerId", workerId.trim());
      return (await api.get(`tasks/admin/submissions?${params.toString()}`)).data;
    },
  });

  const submissions = data?.data || [];

  return (
    <div className="p-4 sm:p-6">
      <PageHeader icon={ClipboardDocumentCheckIcon} title="All Submissions" subtitle="Cross-task lookup for support work" accent="teal" />
      <TableCard
        toolbar={
          <>
            <SegmentedTabs tabs={STATUS_TABS} value={status} onChange={setStatus} accent="teal" fullWidth />
            <Input placeholder="Worker id..." value={workerId} onChange={(e) => setWorkerId(e.target.value)} style={{ maxWidth: 200 }} />
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead columns={["Worker", "Task", "Status", "Submitted", ""]} />
            <tbody>
              {isLoading ? (
                <SkeletonRows rows={5} cols={5} />
              ) : submissions.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={ClipboardDocumentCheckIcon} title="No submissions" /></td></tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-xs font-semibold">{s.worker?.name || s.worker?.username || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      <Link to={`/admin/marketplace/${s.task?._id}`} className="text-teal-600 hover:underline">{s.task?.title}</Link>
                    </td>
                    <td className="px-4 py-3"><StatusPill tone={s.status === "PENDING" ? "amber" : s.status === "REJECTED" ? "red" : "green"}>{s.status}</StatusPill></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/marketplace/${s.task?._id}`} className="text-xs font-bold text-teal-600 hover:underline">View task</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
};

export default AdminSubmissions;
