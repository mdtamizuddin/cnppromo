import React, { useMemo } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  UsersIcon, NoSymbolIcon, BanknotesIcon, ArrowsRightLeftIcon,
  SparklesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  ChevronRightIcon, BriefcaseIcon, UserGroupIcon, CreditCardIcon,
  ChatBubbleLeftRightIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";

/* ─────────────── SVG Sparkline ─────────────── */
const Sparkline = ({ data = [], color = "#6366f1", height = 60 }) => {
  if (data.length < 2) return <div style={{ height }} className="w-full bg-gray-50 rounded-lg" />;
  const W = 240, H = height;
  const values = data.map(d => (typeof d === "object" ? d.amount : d));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = H * 0.1;
  const coords = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const linePts = coords.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath = `M ${coords[0].x},${coords[0].y} ${coords.slice(1).map(p => `L ${p.x},${p.y}`).join(" ")} L ${coords.at(-1).x},${H} L ${coords[0].x},${H} Z`;
  const last = coords.at(-1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} />
    </svg>
  );
};

/* ─────────────── Skeleton ─────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200/70 animate-pulse rounded-lg ${className}`} />
);

/* ─────────────── Stat Card ─────────────── */
const StatCard = ({ icon: Icon, label, value, trend, color, sub, loading }) => {
  const positive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color.bg}`}>
          <Icon className={`w-6 h-6 ${color.icon}`} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${positive ? "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100" : "text-red-500 bg-red-50 ring-1 ring-red-100"}`}>
            {positive ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        {loading ? <Skeleton className="h-7 w-20 mb-1" /> : (
          <p className="text-2xl font-black text-gray-900">{(value ?? 0).toLocaleString()}</p>
        )}
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

/* ─────────────── Money Tile ─────────────── */
const MoneyTile = ({ title, value, spark, color, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-w-[140px]">
    <div className="px-4 pt-4 pb-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {loading ? <Skeleton className="h-6 w-28 mt-1" /> : (
        <p className="text-xl font-black text-gray-900 mt-0.5">৳ {(value || 0).toLocaleString()}</p>
      )}
    </div>
    <div className="mt-1">
      <Sparkline data={spark || []} color={color} height={48} />
    </div>
  </div>
);

/* ─────────────── Status Chip ─────────────── */
const StatusChip = ({ status }) => {
  const map = {
    pending:   { cls: "bg-amber-50 text-amber-700 ring-amber-100",  icon: <ClockIcon className="w-3 h-3" /> },
    completed: { cls: "bg-green-50 text-green-700 ring-green-100",   icon: <CheckCircleIcon className="w-3 h-3" /> },
    rejected:  { cls: "bg-red-50 text-red-600 ring-red-100",         icon: <XCircleIcon className="w-3 h-3" /> },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 capitalize ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
};

/* ─────────────── Recent List ─────────────── */
const RecentList = ({ items, loading, linkTo, linkLabel, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
    <div className="divide-y divide-gray-100 flex-1">
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No records found</div>
      ) : items.map(item => (
        <div key={item._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <img src={item.user?.avatar || "/default-avater.png"} alt={item.user?.name}
            className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{item.user?.email}</p>
          </div>
          <div className="text-right shrink-0 space-y-0.5">
            <p className="text-sm font-bold text-gray-800">৳ {(item.amount || 0).toLocaleString()}</p>
            <StatusChip status={item.status} />
          </div>
        </div>
      ))}
    </div>
    <div className="p-4 border-t border-gray-100 mt-auto">
      <Link to={linkTo} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-100 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-colors">
        <Icon className="w-4 h-4" /> {linkLabel}
      </Link>
    </div>
  </div>
);

/* ─────────────── Quick Action ─────────────── */
const QuickAction = ({ to, icon: Icon, label, color }) => (
  <Link to={to} className="flex flex-col items-center gap-2 group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-[11px] font-bold text-gray-600 text-center leading-tight max-w-[60px]">{label}</span>
  </Link>
);

/* ════════════ Main Dashboard ════════════ */
const AdminDashboard = () => {
  const { user } = useSelector(s => s.user);

  const { data: stats, isLoading, error } = useQuery(
    ["admin-dashboard-stats"],
    () => api.get("/dashboard/stats").then(r => r.data),
    { staleTime: 60_000, refetchOnWindowFocus: true }
  );

  /* Sparkline data: extract amounts from daily chart, or fallback zeros */
  const earningsSpark = useMemo(() => stats?.charts?.dailyEarnings || [], [stats]);
  const todaySpark    = useMemo(() => earningsSpark.slice(-3), [earningsSpark]);
  const weekSpark     = useMemo(() => earningsSpark.slice(-7), [earningsSpark]);

  const recentWithdrawals = stats?.recent?.withdrawals || [];
  const recentTopups      = stats?.recent?.topups || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-700">{user?.name || "Admin"}</span>! Here's what's happening today.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-semibold text-gray-600 self-start">
          📅 {moment().format("MMMM D, YYYY")}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 font-semibold">
          Failed to load dashboard data. Please refresh.
        </div>
      )}

      {/* ── 5 Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={UserGroupIcon} label="Non-Active Users"
          value={stats?.users?.pending}
          sub={`+${stats?.users?.newToday || 0} today`}
          color={{ bg: "bg-orange-50", icon: "text-orange-500" }}
          loading={isLoading}
        />
        <StatCard
          icon={UsersIcon} label="Active Users"
          value={stats?.users?.active}
          sub={`+${stats?.users?.newThisMonth || 0} this month`}
          color={{ bg: "bg-green-50", icon: "text-green-500" }}
          loading={isLoading}
        />
        <StatCard
          icon={NoSymbolIcon} label="Banned Users"
          value={stats?.users?.banned}
          color={{ bg: "bg-red-50", icon: "text-red-500" }}
          loading={isLoading}
        />
        <StatCard
          icon={BanknotesIcon} label="Pending Withdrawals"
          value={stats?.withdrawals?.pending}
          sub={`${stats?.withdrawals?.pendingExternal || 0} external`}
          color={{ bg: "bg-indigo-50", icon: "text-indigo-500" }}
          loading={isLoading}
        />
        <StatCard
          icon={UserGroupIcon} label="Total Users"
          value={stats?.users?.total}
          color={{ bg: "bg-blue-50", icon: "text-blue-500" }}
          loading={isLoading}
        />
      </div>

      {/* ── Earning Overview ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Earning Overview</h2>
              <p className="text-[11px] text-gray-400">Completed withdrawal payouts</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            This Month
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Big total */}
          <div className="md:w-56 shrink-0">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Earnings</p>
            {isLoading ? <Skeleton className="h-10 w-40 mt-1" /> : (
              <p className="text-3xl font-black text-indigo-600 mt-1">৳ {(stats?.withdrawals?.totalAmount || 0).toLocaleString()}</p>
            )}
            {!isLoading && (
              <p className={`text-xs font-bold flex items-center gap-1 mt-2 ${(stats?.withdrawals?.monthGrowthPct || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {(stats?.withdrawals?.monthGrowthPct || 0) >= 0
                  ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                  : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                {Math.abs(stats?.withdrawals?.monthGrowthPct || 0)}% from last month
              </p>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-semibold">Pending Topups</span>
                <span className="font-bold text-amber-600">{stats?.topups?.pending || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-semibold">Pending Submissions</span>
                <span className="font-bold text-teal-600">{stats?.socialWorks?.pendingSubmissions || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-semibold">Completed Topups</span>
                <span className="font-bold text-blue-600">৳ {(stats?.topups?.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sparkline + axis */}
          <div className="flex-1 w-full">
            <Sparkline data={earningsSpark} color="#6366f1" height={90} />
            <div className="flex justify-between px-1 mt-1">
              {earningsSpark.filter((_, i) => i % 2 === 0).slice(0, 8).map((d, i) => (
                <span key={i} className="text-[9px] text-gray-400">
                  {moment(d.date).format("MMM D")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3 money tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <MoneyTile title="Today's Earnings"      value={stats?.withdrawals?.todayAmount}  spark={todaySpark}  color="#10b981" loading={isLoading} />
          <MoneyTile title="This Week's Earnings"  value={stats?.withdrawals?.weekAmount}   spark={weekSpark}   color="#6366f1" loading={isLoading} />
          <MoneyTile title="This Month's Earnings" value={stats?.withdrawals?.monthAmount}  spark={earningsSpark} color="#f59e0b" loading={isLoading} />
        </div>
      </div>

      {/* ── Recent Withdrawals + Topups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Withdrawals</h2>
            <Link to="/admin/withdrawals" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RecentList items={recentWithdrawals} loading={isLoading} linkTo="/admin/withdrawals" linkLabel="View All Withdrawals" icon={BanknotesIcon} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Topups</h2>
            <Link to="/admin/topup" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RecentList items={recentTopups} loading={isLoading} linkTo="/admin/topup" linkLabel="View All Topups" icon={ArrowsRightLeftIcon} />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-6">
          <QuickAction to="/admin/works"               icon={BriefcaseIcon}           label="Manage Works"     color="bg-amber-500" />
          <QuickAction to="/admin/social-works"        icon={ClipboardDocumentCheckIcon} label="Social Works"  color="bg-teal-500" />
          <QuickAction to="/admin/users"               icon={UserGroupIcon}            label="Manage Users"     color="bg-green-500" />
          <QuickAction to="/admin/topup"               icon={CreditCardIcon}           label="Topups"           color="bg-blue-500" />
          <QuickAction to="/admin/withdrawals"         icon={BanknotesIcon}            label="Withdrawals"      color="bg-indigo-500" />
          <QuickAction to="/admin/external-withdrawals" icon={ArrowsRightLeftIcon}     label="Ext. Withdraw"    color="bg-purple-500" />
          <QuickAction to="/user/message"              icon={ChatBubbleLeftRightIcon}  label="Messages"         color="bg-pink-500" />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">© {moment().year()} CNP PROMO. All rights reserved.</p>
    </div>
  );
};

export default AdminDashboard;
