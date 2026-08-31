import React, { useMemo } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartPieIcon,
  InboxArrowDownIcon,
  ArrowDownTrayIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHeader } from "../../../Components/AdminLayout/_Ui/AdminUI";
import { api } from "../../../util/axios";

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return "৳ " + num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* ─────────────── KPI card ─────────────── */
const KpiCard = ({ title, value, hint, icon: Icon, colorClass = "text-[#5a32fa]", bgClass = "bg-purple-50", loading }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      <div className={`w-10 h-10 rounded-2xl ${bgClass} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${colorClass}`} strokeWidth={2} />
      </div>
    </div>
    <div>
      {loading ? (
        <div className="h-8 w-32 bg-gray-200/70 animate-pulse rounded-lg" />
      ) : (
        <div className="text-2xl font-black text-[#0b0c2a] font-mono">{value}</div>
      )}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  </div>
);

/* ─────────────── Status pill ─────────────── */
const StatusPill = ({ status }) => {
  const st = String(status || "pending").toLowerCase();
  const cls = st === "completed" || st === "approved"
    ? "bg-emerald-50 text-emerald-600"
    : st === "rejected"
    ? "bg-rose-50 text-rose-600"
    : "bg-amber-50 text-amber-600";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {st}
    </span>
  );
};

const AdminEarnings = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats-finance"],
    queryFn: async () => (await api.get("/dashboard/stats")).data,
    refetchInterval: 30000,
  });

  const { data: withdrawalsData } = useQuery({
    queryKey: ["admin-recent-withdrawals-finance"],
    queryFn: async () => {
      const res = await api.get("/withdraw?limit=10");
      return res.data?.data || res.data || [];
    },
  });

  const { data: topupsData } = useQuery({
    queryKey: ["admin-recent-topups-finance"],
    queryFn: async () => {
      const res = await api.get("/topup?limit=10");
      return res.data?.data || res.data || [];
    },
  });

  const withdraw = stats?.withdrawals || {};
  const topup = stats?.topups || {};
  const finance = stats?.finance || {};
  const dailyFlow = useMemo(() => stats?.charts?.dailyFlow || [], [stats]);

  const totalTopup = topup.totalAmount || 0;
  const totalPaidWithdraw = withdraw.totalAmount || 0;
  const totalPendingWithdraw = withdraw.pending || 0;
  const netPlatformProfit = finance.netBalance ?? (totalTopup - totalPaidWithdraw);
  const profitMargin = totalTopup > 0
    ? Math.round(((totalTopup - totalPaidWithdraw) / totalTopup) * 100)
    : 0;

  if (isLoading) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">
      {/* Premium header */}
      <PageHeader
        icon={CurrencyDollarIcon}
        title="Financial & Earning Overview"
        subtitle="Real-time tracking of platform deposits, member payouts, pending liabilities, and net margins."
        accent="blue"
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/withdrawals" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#5a32fa] to-[#7928ca] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:from-[#4b26e0] hover:to-[#6820ae] transition-all">
              <ArrowTrendingDownIcon className="w-4 h-4" />
              <span>Withdrawals</span>
            </Link>
            <Link to="/admin/topup" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
              <span>Top-Up Approvals</span>
            </Link>
          </div>
        }
      />

      {/* ── 4 Key Financial Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Deposits (Inflow)"
          value={formatCurrency(totalTopup)}
          hint="Approved user deposits & activation fees"
          icon={InboxArrowDownIcon}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          loading={isLoading}
        />
        <KpiCard
          title="Total Payouts (Outflow)"
          value={formatCurrency(totalPaidWithdraw)}
          hint="Completed member cashouts"
          icon={ArrowDownTrayIcon}
          colorClass="text-[#5a32fa]"
          bgClass="bg-purple-50"
          loading={isLoading}
        />
        <KpiCard
          title="Net Platform Balance"
          value={formatCurrency(netPlatformProfit)}
          hint={<span className={netPlatformProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>{profitMargin}% Gross Inflow Retained</span>}
          icon={WalletIcon}
          colorClass={netPlatformProfit >= 0 ? "text-purple-600" : "text-rose-600"}
          bgClass={netPlatformProfit >= 0 ? "bg-purple-50" : "bg-rose-50"}
          loading={isLoading}
        />
        <KpiCard
          title="Pending Withdrawals"
          value={formatCurrency(totalPendingWithdraw)}
          hint={`${withdraw.pending || 0} requests awaiting review`}
          icon={ClockIcon}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          loading={isLoading}
        />
      </div>

      {/* ── Daily Revenue Flow ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-black text-[#0b0c2a] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5a32fa] to-[#7928ca] text-white grid place-items-center shadow-md shadow-indigo-500/20">
                <ChartPieIcon className="w-4 h-4" />
              </span>
              <span>Daily Revenue Flow (Last 15 Days)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Visual breakdown of incoming deposits vs outgoing payouts</p>
          </div>
        </div>

        <div className="h-64">
          {isLoading ? (
            <div className="h-full w-full bg-gray-200/70 animate-pulse rounded-2xl" />
          ) : dailyFlow.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-400">No daily transaction data recorded in the last 15 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a32fa" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#5a32fa" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => moment(d).format("MMM D")}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={46} />
                <Tooltip
                  formatter={(v, name) => [`৳ ${Number(v).toLocaleString()}`, name === "in" ? "Topup (In)" : "Payout (Out)"]}
                  labelFormatter={(d) => moment(d).format("MMM D, YYYY")}
                  contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="in" name="Topup (In)" stroke="#10b981" strokeWidth={2} fill="url(#fIn)" />
                <Bar dataKey="out" name="Payout (Out)" fill="#5a32fa" radius={[4, 4, 0, 0]} maxBarSize={14} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Withdrawals & TopUps ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Withdraw Requests */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#0b0c2a] flex items-center gap-2">
              <BanknotesIcon className="w-4 h-4 text-purple-600" />
              <span>Recent Withdraw Requests</span>
            </h3>
            <Link to="/admin/withdrawals" className="text-xs font-bold text-[#5a32fa] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {Array.isArray(withdrawalsData) && withdrawalsData.length > 0 ? (
              withdrawalsData.slice(0, 6).map((w, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 hover:bg-purple-50/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{w.user?.name || w.user?.username || "User"}</p>
                    <p className="text-[11px] text-gray-500">{w.gateway || w.method || "bKash"} • {w.phone || w.accountNumber || "N/A"}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-black text-gray-900">৳ {(Number(w.amount) || 0).toLocaleString()}</span>
                    <div><StatusPill status={w.status} /></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-gray-400">No recent withdrawal records found.</p>
            )}
          </div>
        </div>

        {/* Recent TopUp Transactions */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#0b0c2a] flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
              <span>Recent Top-Up Transactions</span>
            </h3>
            <Link to="/admin/topup" className="text-xs font-bold text-[#5a32fa] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {Array.isArray(topupsData) && topupsData.length > 0 ? (
              topupsData.slice(0, 6).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 hover:bg-emerald-50/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{t.user?.name || t.user?.username || "User"}</p>
                    <p className="text-[11px] font-mono text-gray-500">TrxID: {t.transectionId || t.trxId || "N/A"}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-black text-emerald-600">+৳ {(Number(t.amount) || 0).toLocaleString()}</span>
                    <div><StatusPill status={t.status} /></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-gray-400">No recent topup records found.</p>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">© {moment().year()} CNP PROMO. All rights reserved.</p>
    </div>
  );
};

export default AdminEarnings;
