import React, { useState } from "react";
import { useQuery } from "react-query";
import moment from "moment";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { ChartBarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import {
  PageHeader, StatCard, StatGrid, TableCard, TableHead, EmptyState, SkeletonRows,
} from "../../../Components/AdminLayout/_Ui/AdminUI";

const AdminRevenue = () => {
  const [type, setType] = useState("");

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["admin-marketplace-revenue"],
    queryFn: async () => (await api.get("tasks/admin/revenue")).data,
    staleTime: 30000,
  });
  const { data: reconcile } = useQuery({
    queryKey: ["admin-marketplace-reconcile"],
    queryFn: async () => (await api.get("tasks/admin/reconcile")).data,
    staleTime: 30000,
  });
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["admin-marketplace-ledger", type],
    queryFn: async () => (await api.get(`tasks/admin/ledger${type ? `?type=${type}` : ""}`)).data,
    staleTime: 15000,
  });

  const rows = ledger?.data || [];
  const outOfBalance = reconcile && Math.abs(reconcile.difference) > 0.01;

  return (
    <div className="p-4 sm:p-6">
      <PageHeader icon={ChartBarIcon} title="Marketplace Revenue" subtitle="Platform commission + fines" accent="teal" />

      <StatGrid>
        <StatCard title="Today" value={`৳${(revenue?.today || 0).toFixed(2)}`} icon={ChartBarIcon} colorClass="text-teal-500" bgClass="bg-teal-50" />
        <StatCard title="This Week" value={`৳${(revenue?.week || 0).toFixed(2)}`} icon={ChartBarIcon} colorClass="text-blue-500" bgClass="bg-blue-50" />
        <StatCard title="This Month" value={`৳${(revenue?.month || 0).toFixed(2)}`} icon={ChartBarIcon} colorClass="text-indigo-500" bgClass="bg-indigo-50" />
        <StatCard title="All-Time" value={`৳${(revenue?.total || 0).toFixed(2)}`} icon={ChartBarIcon} colorClass="text-emerald-500" bgClass="bg-emerald-50" />
      </StatGrid>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase mb-3">Last 15 Days</p>
        <div className="h-56">
          {revLoading ? (
            <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue?.chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => moment(d).format("MMM D")} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={42} />
                <Tooltip formatter={(v) => [`৳ ${Number(v).toFixed(2)}`, "Revenue"]} labelFormatter={(d) => moment(d).format("MMM D, YYYY")} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} fill="url(#gRev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {reconcile && (
        <div className={`rounded-2xl p-5 mb-6 flex items-start gap-3 ${outOfBalance ? "bg-red-50" : "bg-emerald-50"}`}>
          <ExclamationTriangleIcon className={`w-5 h-5 shrink-0 mt-0.5 ${outOfBalance ? "text-red-500" : "text-emerald-500"}`} />
          <div>
            <p className={`text-sm font-bold ${outOfBalance ? "text-red-700" : "text-emerald-700"}`}>
              {outOfBalance ? "Escrow out of balance" : "Escrow reconciled"}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Actual held: ৳{reconcile.actualHeld.toFixed(2)} · Expected: ৳{reconcile.expectedHeld.toFixed(2)} · Diff: ৳{reconcile.difference.toFixed(2)}
              {reconcile.orphanUnfundedTasks > 0 && ` · ${reconcile.orphanUnfundedTasks} orphan unfunded task(s) older than 1h`}
            </p>
          </div>
        </div>
      )}

      <TableCard
        toolbar={
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-200 rounded-lg text-xs px-3 py-2">
            <option value="">All types</option>
            <option value="ESCROW_HOLD">Escrow Hold</option>
            <option value="ESCROW_REFUND">Escrow Refund</option>
            <option value="WORKER_PAYOUT">Worker Payout</option>
            <option value="PLATFORM_FEE">Platform Fee</option>
            <option value="PROVIDER_FINE">Provider Fine</option>
          </select>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead columns={["Type", "Amount", "Provider", "Worker", "Date"]} />
            <tbody>
              {ledgerLoading ? (
                <SkeletonRows rows={5} cols={5} />
              ) : rows.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={ChartBarIcon} title="No ledger rows" /></td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-xs font-semibold">{r.type}</td>
                    <td className="px-4 py-3 text-xs font-bold text-teal-600">৳{r.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs">{r.provider?.name || r.provider?.username || "—"}</td>
                    <td className="px-4 py-3 text-xs">{r.worker?.name || r.worker?.username || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</td>
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

export default AdminRevenue;
