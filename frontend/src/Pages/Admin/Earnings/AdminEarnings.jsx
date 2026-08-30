import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { Card, Button, Typography } from "@material-tailwind/react";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const AdminEarnings = () => {
  const [timeRange, setTimeRange] = useState("month"); // 'today' | 'week' | 'month' | 'all'

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats-finance"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
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

  const totalTopup = stats?.topup?.totalAmount || 0;
  const totalPaidWithdraw = stats?.withdraw?.completedAmount || 0;
  const totalPendingWithdraw = stats?.withdraw?.pendingAmount || 0;
  const totalPendingTopup = stats?.topup?.pendingAmount || 0;

  const netPlatformProfit = totalTopup - totalPaidWithdraw;
  const profitMargin =
    totalTopup > 0
      ? Math.round(((totalTopup - totalPaidWithdraw) / totalTopup) * 100)
      : 0;

  // Chart data from stats or generated
  const dailyEarnings = stats?.dailyEarnings || [];

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#5a32fa] text-xs font-bold">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>Financial Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
            Financial & Earning Overview
          </h1>
          <p className="text-xs text-gray-500">
            Real-time tracking of platform deposits, member payouts, pending liabilities, and net margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/withdrawals">
            <Button
              size="sm"
              className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <ArrowTrendingDownIcon className="w-4 h-4" />
              <span>Withdrawals</span>
            </Button>
          </Link>
          <Link to="/admin/topup">
            <Button
              size="sm"
              variant="outlined"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 normal-case text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
              <span>Top-Up Approvals</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 📊 4 Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Inflow */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Deposits (Inflow)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              ৳{formatCurrency(totalTopup)}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Approved user deposits & activation fees
            </p>
          </div>
        </Card>

        {/* Metric 2: Total Paid Out */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Payouts (Outflow)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5a32fa] flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#5a32fa] font-mono">
              ৳{formatCurrency(totalPaidWithdraw)}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Completed member cashouts
            </p>
          </div>
        </Card>

        {/* Metric 3: Net Balance Reserve */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Net Platform Balance
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                netPlatformProfit >= 0
                  ? "bg-purple-50 text-purple-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-black font-mono ${
                netPlatformProfit >= 0 ? "text-[#0b0c2a]" : "text-rose-600"
              }`}
            >
              ৳{formatCurrency(netPlatformProfit)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {profitMargin}% Gross Inflow Retained
            </p>
          </div>
        </Card>

        {/* Metric 4: Pending Liabilities */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Pending Withdrawals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 font-mono">
              ৳{formatCurrency(totalPendingWithdraw)}
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {stats?.withdraw?.pendingCount || 0} requests awaiting review
            </p>
          </div>
        </Card>
      </div>

      {/* 📈 15-Day Revenue & Payout Visual Grid */}
      <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-black text-[#0b0c2a] flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-[#5a32fa]" />
              <span>Daily Revenue Flow (Last 15 Days)</span>
            </h2>
            <p className="text-xs text-gray-500">
              Visual breakdown of incoming deposits vs outgoing payouts
            </p>
          </div>
        </div>

        {/* Simple Bar Visualization */}
        <div className="space-y-3">
          {dailyEarnings.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-400">
              No daily transaction data recorded in the last 15 days.
            </p>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2 items-end pt-8 pb-2 h-44">
              {dailyEarnings.map((item, idx) => {
                const maxAmount = Math.max(
                  ...dailyEarnings.map((d) => Math.max(d.topup || 0, d.withdraw || 0)),
                  1000
                );
                const topupHeight = Math.min(100, Math.round(((item.topup || 0) / maxAmount) * 100));
                const withdrawHeight = Math.min(100, Math.round(((item.withdraw || 0) / maxAmount) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] p-2 rounded-xl pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{item.date}</p>
                      <p className="text-emerald-400">In: ৳{item.topup || 0}</p>
                      <p className="text-purple-300">Out: ৳{item.withdraw || 0}</p>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      <div
                        style={{ height: `${Math.max(8, topupHeight)}%` }}
                        className="w-2.5 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all"
                        title={`Inflow: ৳${item.topup || 0}`}
                      />
                      <div
                        style={{ height: `${Math.max(8, withdrawHeight)}%` }}
                        className="w-2.5 bg-[#5a32fa] rounded-t-md hover:bg-indigo-600 transition-all"
                        title={`Outflow: ৳${item.withdraw || 0}`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 truncate w-full text-center">
                      {item.date ? item.date.slice(5) : `${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-gray-50 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Deposits (TopUp)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#5a32fa]" />
              <span className="text-gray-600">Payouts (Withdraw)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2-Column Split: Recent Withdrawals & TopUps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Withdrawal Requests */}
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#0b0c2a] flex items-center gap-2">
              <BanknotesIcon className="w-4 h-4 text-purple-600" />
              <span>Recent Withdraw Requests</span>
            </h3>
            <Link
              to="/admin/withdrawals"
              className="text-xs font-bold text-[#5a32fa] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {Array.isArray(withdrawalsData) && withdrawalsData.length > 0 ? (
              withdrawalsData.slice(0, 5).map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 hover:bg-purple-50/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">
                      {w.user?.name || w.user?.username || "User"}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {w.gateway || w.method || "bKash"} • {w.phone || w.accountNumber || "N/A"}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-black text-gray-900">
                      ৳{formatCurrency(w.amount)}
                    </span>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.status === "completed" || w.status === "approved"
                            ? "bg-emerald-50 text-emerald-600"
                            : w.status === "rejected"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {w.status || "pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-gray-400">
                No recent withdrawal records found.
              </p>
            )}
          </div>
        </Card>

        {/* Right: Recent TopUp Transactions */}
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#0b0c2a] flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
              <span>Recent Top-Up Transactions</span>
            </h3>
            <Link
              to="/admin/topup"
              className="text-xs font-bold text-[#5a32fa] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {Array.isArray(topupsData) && topupsData.length > 0 ? (
              topupsData.slice(0, 5).map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">
                      {t.user?.name || t.user?.username || "User"}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500">
                      TrxID: {t.transectionId || t.trxId || "N/A"}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-black text-emerald-600">
                      +৳{formatCurrency(t.amount)}
                    </span>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === "completed" || t.status === "approved"
                            ? "bg-emerald-50 text-emerald-600"
                            : t.status === "rejected"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {t.status || "pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-gray-400">
                No recent topup records found.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminEarnings;
