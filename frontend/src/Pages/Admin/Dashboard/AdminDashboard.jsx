import React, { useMemo } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  UsersIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  InboxArrowDownIcon,
  WalletIcon,
  BuildingLibraryIcon,
  ArrowUpRightIcon,
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
import { PageHeader, StatCard, StatGrid } from "../../../Components/AdminLayout/_Ui/AdminUI";
import { api } from "../../../util/axios";

/* ─────────────── Skeleton ─────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200/70 animate-pulse rounded-lg ${className}`} />
);

/* ─────────────── Premium metric card (purple-3xl dialect) ─────────────── */
const MoneyCard = ({ title, value, sub, icon: Icon, gradient, shadow = "shadow-md shadow-gray-200", loading, subTone = "text-gray-400" }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-all duration-300">
    <div>
      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
      {loading ? (
        <Skeleton className="h-8 w-28 mt-2" />
      ) : (
        <p className="text-2xl font-black text-[#0b0c2a] mt-1.5 font-mono">৳ {(value || 0).toLocaleString()}</p>
      )}
      {sub && <p className={`text-[11px] font-semibold mt-1 ${subTone}`}>{sub}</p>}
    </div>
    {Icon && (
      <div className={`shrink-0 grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} ${shadow}`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
    )}
  </div>
);

/* ─────────────── Status pill ─────────────── */
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

/* ─────────────── Recent list ─────────────── */
const RecentList = ({ items, loading, linkTo, linkLabel, icon: Icon }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="divide-y divide-gray-100">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
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
        <div key={item._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-purple-50/30 transition-colors">
          <img
            src={item.user?.avatar || "/default-avater.png"}
            alt={item.user?.name}
            className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
          />
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
    <div className="p-4 border-t border-gray-100">
      <Link to={linkTo} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-50 text-[#5a32fa] text-xs font-bold hover:bg-purple-100 transition-colors">
        <Icon className="w-4 h-4" /> {linkLabel}
      </Link>
    </div>
  </div>
);

/* ─────────────── Recent Onboarding list (flat user records) ─────────────── */
const OnboardList = ({ items, loading }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="divide-y divide-gray-100">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No new signups yet</div>
      ) : items.map(item => (
        <div key={item._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-purple-50/30 transition-colors">
          <img
            src={item.avatar || "/default-avater.png"}
            alt={item.name}
            className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
            <p className="text-xs text-gray-400 truncate">@{item.username || item.email}</p>
          </div>
          <div className="text-right shrink-0 space-y-0.5">
            <p className="text-[11px] font-semibold text-gray-500">{moment(item.createdAt).format("MMM D")}</p>
            <StatusChip status={item.status === "active" ? "completed" : (item.status || "pending")} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────── Premium Action Card ─────────────── */
const QuickActionCard = ({
  to,
  icon: Icon,
  title,
  subtitle,
  gradient,
  shadow,
  badgeText,
  badgeTone = "amber",
  accentBorder = "hover:border-indigo-200",
}) => (
  <Link
    to={to}
    className={`group relative p-4 sm:p-5 rounded-2xl bg-white border border-gray-100/90 shadow-sm hover:shadow-md ${accentBorder} transition-all duration-300 flex flex-col justify-between overflow-hidden active:scale-[0.98]`}
  >
    {/* Ambient Glow */}
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/5 to-indigo-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

    {/* Top Row: Icon + Badge or Action Arrow */}
    <div className="flex items-start justify-between gap-2 mb-3.5 relative z-10">
      <div
        className={`w-12 h-12 rounded-2xl ${gradient} ${shadow} flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 stroke-[1.9]" />
      </div>

      {badgeText ? (
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${
            badgeTone === "rose"
              ? "bg-rose-50 text-rose-600 ring-rose-100"
              : badgeTone === "teal"
              ? "bg-teal-50 text-teal-600 ring-teal-100"
              : badgeTone === "sky"
              ? "bg-sky-50 text-sky-600 ring-sky-100"
              : "bg-amber-50 text-amber-600 ring-amber-100"
          } flex items-center gap-1 shrink-0 animate-pulse`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              badgeTone === "rose"
                ? "bg-rose-500"
                : badgeTone === "teal"
                ? "bg-teal-500"
                : badgeTone === "sky"
                ? "bg-sky-500"
                : "bg-amber-500"
            }`}
          />
          {badgeText}
        </span>
      ) : (
        <div className="w-7 h-7 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#5a32fa] group-hover:bg-purple-50 group-hover:border-purple-200 transition-all duration-300 shrink-0">
          <ArrowUpRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      )}
    </div>

    {/* Bottom Content: Title & Micro-caption */}
    <div className="relative z-10 min-w-0">
      <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-[#5a32fa] transition-colors leading-tight truncate">
        {title}
      </h4>
      <p className="text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors leading-snug line-clamp-1 mt-0.5">
        {subtitle}
      </p>
    </div>
  </Link>
);

/* ════════════ Main Dashboard ════════════ */
const AdminDashboard = () => {
  const { user } = useSelector(s => s.user);

  const { data: stats, isLoading, error, refetch } = useQuery(
    ["admin-dashboard-stats"],
    () => api.get("/dashboard/stats").then(r => r.data),
    { staleTime: 60_000, refetchOnWindowFocus: true }
  );

  const dailyFlow = useMemo(() => stats?.charts?.dailyFlow || [], [stats]);
  const dailyEarnings = useMemo(() => stats?.charts?.dailyEarnings || [], [stats]);

  const withdraw = stats?.withdrawals || {};
  const topup = stats?.topups || {};
  const finance = stats?.finance || {};
  const recentWithdrawals = stats?.recent?.withdrawals || [];
  const recentOnboarded = stats?.recent?.onboarded || [];

  const netPositive = (finance.netBalance || 0) >= 0;
  const growth = withdraw.monthGrowthPct || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Premium header */}
      <PageHeader
        icon={ChartPieIcon}
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || "Admin"}! Here's what's happening today.`}
        accent="blue"
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-semibold text-gray-600">
              📅 {moment().format("MMMM D, YYYY")}
            </span>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#5a32fa] to-[#7928ca] text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:from-[#4b26e0] hover:to-[#6820ae] transition-all"
            >
              <SparklesIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 font-semibold">
          Failed to load dashboard data. Please refresh.
        </div>
      )}

      {/* ── 4 Key user/site stats (shared AdminUI primitives) ── */}
      <StatGrid>
        <StatCard
          title="Active Users"
          value={(stats?.users?.active ?? 0).toLocaleString()}
          hint={`+${stats?.users?.newThisMonth || 0} this month`}
          icon={UsersIcon}
          colorClass="text-green-500"
          bgClass="bg-green-50"
        />
        <StatCard
          title="Total Users"
          value={(stats?.users?.total ?? 0).toLocaleString()}
          hint={`+${stats?.users?.newToday || 0} today`}
          icon={UserGroupIcon}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Pending Withdrawals"
          value={(withdraw.pending ?? 0).toLocaleString()}
          hint={`${withdraw.pendingExternal || 0} external`}
          icon={BanknotesIcon}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          title="Pending Submissions"
          value={(stats?.socialWorks?.pendingSubmissions ?? 0).toLocaleString()}
          hint={`${stats?.socialWorks?.active || 0} active works`}
          icon={ClipboardDocumentCheckIcon}
          colorClass="text-teal-600"
          bgClass="bg-teal-50"
        />
      </StatGrid>

      {/* ── Financial Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inflow / Outflow / Net cards */}
        <div className="lg:col-span-1 space-y-4">
          <MoneyCard
            title="Total Inflow (Topups)"
            value={topup.totalAmount}
            sub="Approved user deposits & activation fees"
            icon={InboxArrowDownIcon}
            gradient="from-emerald-500 to-teal-600"
            shadow="shadow-md shadow-emerald-500/25"
            loading={isLoading}
          />
          <MoneyCard
            title="Total Outflow (Payouts)"
            value={withdraw.totalAmount}
            sub={(
              <span className={`inline-flex items-center gap-1 ${growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {growth >= 0 ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                {Math.abs(growth)}% from last month
              </span>
            )}
            icon={ArrowDownTrayIcon}
            gradient="from-indigo-500 to-purple-600"
            shadow="shadow-md shadow-indigo-500/25"
            loading={isLoading}
          />
          <MoneyCard
            title="Net Platform Balance"
            value={finance.netBalance}
            sub={`${netPositive ? "+" : ""} net of all-time inflow minus outflow`}
            icon={WalletIcon}
            gradient={netPositive ? "from-violet-600 to-purple-700" : "from-rose-500 to-red-600"}
            shadow={netPositive ? "shadow-md shadow-violet-500/25" : "shadow-md shadow-rose-500/25"}
            subTone={netPositive ? "text-emerald-600" : "text-rose-600"}
            loading={isLoading}
          />

          {/* Mini stat strip */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Pending Topups</span>
              <span className="font-bold text-amber-600">{topup.pending || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Completed Topups</span>
              <span className="font-bold text-emerald-600">{topup.completed || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Rejected Withdrawals</span>
              <span className="font-bold text-red-500">{withdraw.rejected || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-semibold">Banned Users</span>
              <span className="font-bold text-gray-700">{stats?.users?.banned || 0}</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inflow vs Outflow (15 days) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-[#0b0c2a] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5a32fa] to-[#7928ca] text-white grid place-items-center shadow-md shadow-indigo-500/20">
                    <ArrowsRightLeftIcon className="w-4 h-4" />
                  </span>
                  <span>Daily Revenue Flow (Last 15 Days)</span>
                </h2>
                <p className="text-[11px] text-gray-400 mt-1">Incoming deposits vs outgoing payouts</p>
              </div>
            </div>
            <div className="h-56">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
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
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={42} />
                    <Tooltip
                      formatter={(v, name) => [`৳ ${Number(v).toLocaleString()}`, name === "in" ? "Topup (In)" : "Payout (Out)"]}
                      labelFormatter={(d) => moment(d).format("MMM D, YYYY")}
                      contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} fill="url(#gIn)" />
                    <Bar dataKey="out" fill="#5a32fa" radius={[4, 4, 0, 0]} maxBarSize={14} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Earnings area trend */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-[#0b0c2a] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white grid place-items-center shadow-md shadow-amber-500/20">
                    <SparklesIcon className="w-4 h-4" />
                  </span>
                  <span>Earnings Trend (Payout Area)</span>
                </h2>
                <p className="text-[11px] text-gray-400 mt-1">Daily completed withdrawal payouts</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Today</p>
                  <p className="text-sm font-black text-gray-900">৳ {(withdraw.todayAmount || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Week</p>
                  <p className="text-sm font-black text-gray-900">৳ {(withdraw.weekAmount || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Month</p>
                  <p className="text-sm font-black text-[#5a32fa]">৳ {(withdraw.monthAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="h-48">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyEarnings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gEarn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
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
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={42} />
                    <Tooltip
                      formatter={(v) => [`৳ ${Number(v).toLocaleString()}`, "Earnings"]}
                      labelFormatter={(d) => moment(d).format("MMM D, YYYY")}
                      contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gEarn)" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Withdrawals + Onboarding ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Withdrawals</h2>
            <Link to="/admin/withdrawals" className="text-xs font-bold text-[#5a32fa] hover:underline flex items-center gap-0.5">
              View All <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RecentList items={recentWithdrawals} loading={isLoading} linkTo="/admin/withdrawals" linkLabel="View All Withdrawals" icon={BanknotesIcon} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Onboarding</h2>
            <Link to="/admin/users" className="text-xs font-bold text-[#5a32fa] hover:underline flex items-center gap-0.5">
              View All <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <OnboardList items={recentOnboarded} loading={isLoading} />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle decorative gradient top-border accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-[#5a32fa] to-pink-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5a32fa] to-[#7928ca] text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <SparklesIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0b0c2a] leading-tight">
                Quick Actions & Direct Navigation
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Fast shortcuts to manage tasks, review financials, user accounts and system configurations
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Action Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Manage Works */}
          <QuickActionCard
            to="/admin/works"
            icon={BriefcaseIcon}
            title="Manage Works"
            subtitle="Task listings & job controls"
            gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            shadow="shadow-md shadow-amber-500/25"
            accentBorder="hover:border-amber-200 hover:bg-amber-50/20"
          />

          {/* 2. Social Works */}
          <QuickActionCard
            to="/admin/social-works"
            icon={ClipboardDocumentCheckIcon}
            title="Social Works"
            subtitle="Proof submissions & review"
            gradient="bg-gradient-to-br from-teal-400 to-emerald-500"
            shadow="shadow-md shadow-teal-500/25"
            badgeText={stats?.socialWorks?.pendingSubmissions > 0 ? `${stats.socialWorks.pendingSubmissions} Pending` : null}
            badgeTone="teal"
            accentBorder="hover:border-teal-200 hover:bg-teal-50/20"
          />

          {/* 3. Manage Users */}
          <QuickActionCard
            to="/admin/users"
            icon={UserGroupIcon}
            title="Manage Users"
            subtitle="Member accounts, bans & KYC"
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            shadow="shadow-md shadow-emerald-500/25"
            badgeText={stats?.users?.pending > 0 ? `${stats.users.pending} Pending` : null}
            badgeTone="amber"
            accentBorder="hover:border-emerald-200 hover:bg-emerald-50/20"
          />

          {/* 4. Topups */}
          <QuickActionCard
            to="/admin/topup"
            icon={CreditCardIcon}
            title="Topups"
            subtitle="Manual deposits & approvals"
            gradient="bg-gradient-to-br from-sky-400 to-blue-600"
            shadow="shadow-md shadow-sky-500/25"
            badgeText={topup?.pending > 0 ? `${topup.pending} Pending` : null}
            badgeTone="sky"
            accentBorder="hover:border-sky-200 hover:bg-sky-50/20"
          />

          {/* 5. Withdrawals */}
          <QuickActionCard
            to="/admin/withdrawals"
            icon={BanknotesIcon}
            title="Withdrawals"
            subtitle="Payout requests & processing"
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
            shadow="shadow-md shadow-indigo-500/25"
            badgeText={withdraw?.pending > 0 ? `${withdraw.pending} Pending` : null}
            badgeTone="rose"
            accentBorder="hover:border-indigo-200 hover:bg-indigo-50/20"
          />

          {/* 6. Payment Gateway */}
          <QuickActionCard
            to="/admin/payment-gateway"
            icon={BuildingLibraryIcon}
            title="Payment Gateway"
            subtitle="Methods, limits & QR codes"
            gradient="bg-gradient-to-br from-purple-500 to-violet-600"
            shadow="shadow-md shadow-purple-500/25"
            accentBorder="hover:border-purple-200 hover:bg-purple-50/20"
          />

          {/* 7. Ext. Withdraw */}
          <QuickActionCard
            to="/admin/external-withdrawals"
            icon={ArrowsRightLeftIcon}
            title="Ext. Withdraw"
            subtitle="External wallet transactions"
            gradient="bg-gradient-to-br from-fuchsia-400 to-pink-600"
            shadow="shadow-md shadow-fuchsia-500/25"
            badgeText={withdraw?.pendingExternal > 0 ? `${withdraw.pendingExternal} Pending` : null}
            badgeTone="rose"
            accentBorder="hover:border-fuchsia-200 hover:bg-fuchsia-50/20"
          />

          {/* 8. Messages */}
          <QuickActionCard
            to="/admin/message"
            icon={ChatBubbleLeftRightIcon}
            title="Staff Messages"
            subtitle="Live user support & inquiries"
            gradient="bg-gradient-to-br from-pink-400 to-rose-500"
            shadow="shadow-md shadow-rose-500/25"
            accentBorder="hover:border-rose-200 hover:bg-rose-50/20"
          />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">© {moment().year()} CNP PROMO. All rights reserved.</p>
    </div>
  );
};

export default AdminDashboard;
