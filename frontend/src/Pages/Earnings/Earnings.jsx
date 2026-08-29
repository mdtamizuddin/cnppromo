import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import {
  ArrowLeftIcon,
  BellIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  GiftIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  WalletIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Image } from "antd";
import { api } from "../../util/axios";
import Loader from "../../Components/Loader";

const PAGE_SIZE = 10;

const Earnings = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Navigation / View State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [mainTab, setMainTab] = useState("all"); // 'all' | 'withdrawals'
  const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'Credit' | 'Debit' | 'Pending' | 'Success' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(false);

  // 1. Fetch Real Withdrawals API
  const { data: withdrawalsData, isLoading: isWithdrawLoading } = useQuery({
    queryKey: ["user-withdrawals", user?._id],
    queryFn: async () => {
      const res = await api.get("/withdraw");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 2. Fetch Real External Withdrawals API
  const { data: extWithdrawalsData } = useQuery({
    queryKey: ["user-ext-withdrawals", user?._id],
    queryFn: async () => {
      const res = await api.get(`/external-withdraw/user/${user?._id}`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 3. Fetch Real Referral Transactions API
  const { data: referData, isLoading: isReferLoading } = useQuery({
    queryKey: ["earnings-refer-history", user?._id],
    queryFn: async () => {
      const res = await api.get(`/refer/user/${user?._id}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!user?._id,
  });

  // 4. Fetch Real Social Work Submissions API
  const { data: workSubmitsData } = useQuery({
    queryKey: ["user-work-submits", user?._id],
    queryFn: async () => {
      const res = await api.get(`/social-works/submit/${user?._id}`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 5. Fetch Real TopUp / Deposit Transactions API
  const { data: topupData } = useQuery({
    queryKey: ["user-topup-history", user?._id],
    queryFn: async () => {
      const res = await api.get("/topup");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 6. Merge all real API responses into a unified transaction stream
  const allTransactions = useMemo(() => {
    const list = [];

    // Map withdrawals
    if (withdrawalsData && Array.isArray(withdrawalsData)) {
      withdrawalsData.forEach((w) => {
        const isCompleted = w.status === "completed";
        const isPending = w.status === "pending";
        const isRejected = w.status === "rejected";

        list.push({
          id: w._id,
          trxId: `TRX${String(w._id).slice(-7).toUpperCase()}`,
          rawType: "withdrawal",
          title: isCompleted
            ? "Withdrawal Payment"
            : isPending
            ? "Withdrawal Request"
            : "Withdrawal Rejected",
          amount: Number(w.amount || 0),
          flow: "debit",
          status: isCompleted ? "Paid" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
          method: w.method,
          account: w.account,
          image: w.image,
          note: w.note,
          user: w.user || user,
        });
      });
    }

    // Map external withdrawals
    if (extWithdrawalsData && Array.isArray(extWithdrawalsData)) {
      extWithdrawalsData.forEach((ew) => {
        const isCompleted = ew.status === "completed" || ew.status === "approved";
        const isPending = ew.status === "pending";

        list.push({
          id: ew._id,
          trxId: `TRX${String(ew._id).slice(-7).toUpperCase()}`,
          rawType: "withdrawal",
          title: isCompleted
            ? "External Withdrawal Payment"
            : isPending
            ? "External Withdrawal Request"
            : "External Withdrawal Rejected",
          amount: Number(ew.amount || 0),
          flow: "debit",
          status: isCompleted ? "Paid" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: ew.createdAt,
          updatedAt: ew.updatedAt,
          method: ew.method || ew.gateway || "Payment Gateway",
          account: ew.account || ew.walletNumber,
          image: ew.image,
          note: ew.note,
          user: user,
        });
      });
    }

    // Map referral bonuses
    if (referData && Array.isArray(referData)) {
      referData.forEach((r) => {
        list.push({
          id: r._id,
          trxId: `TRX${String(r._id).slice(-7).toUpperCase()}`,
          rawType: "referral",
          title: "Referral Bonus",
          amount: Number(r.amount || (r.gen === 1 ? 30 : 10)),
          flow: "credit",
          status: "Credit",
          statusCode: "credit",
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          gen: r.gen || 1,
          referredUser: r.user,
          user: user,
        });
      });
    }

    // Map submitted social works
    if (workSubmitsData && Array.isArray(workSubmitsData)) {
      workSubmitsData.forEach((ws) => {
        const isCompleted = ws.status === "completed" || ws.status === "approved";
        const isPending = ws.status === "pending";
        const taskReward = Number(ws.amount || ws.workId?.reward || ws.workId?.amount || 0);

        list.push({
          id: ws._id,
          trxId: `TRX${String(ws._id).slice(-7).toUpperCase()}`,
          rawType: "task",
          title: ws.workId?.title || "Task Completed",
          amount: taskReward,
          flow: "credit",
          status: isCompleted ? "Credit" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: ws.createdAt,
          updatedAt: ws.updatedAt,
          taskTitle: ws.workId?.title,
          image: ws.proofImage || ws.image,
          user: user,
        });
      });
    }

    // Map topups / deposits
    if (topupData && Array.isArray(topupData)) {
      topupData.forEach((tp) => {
        const isCompleted = tp.status === "completed" || tp.status === "approved";
        const isPending = tp.status === "pending";

        list.push({
          id: tp._id,
          trxId: `TRX${String(tp._id).slice(-7).toUpperCase()}`,
          rawType: "topup",
          title: isCompleted ? "Wallet TopUp Completed" : isPending ? "Wallet TopUp Pending" : "Wallet TopUp Rejected",
          amount: Number(tp.amount || 0),
          flow: "credit",
          status: isCompleted ? "Credit" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: tp.createdAt,
          updatedAt: tp.updatedAt,
          method: tp.method,
          account: tp.account || tp.trxNumber,
          image: tp.image,
          user: user,
        });
      });
    }

    // Sort strictly by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [withdrawalsData, extWithdrawalsData, referData, workSubmitsData, topupData, user]);

  // 7. Filters
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      // Main tab filter
      if (mainTab === "withdrawals" && item.rawType !== "withdrawal") {
        return false;
      }

      // Status chip filter
      if (statusFilter !== "All") {
        if (statusFilter === "Credit" && item.flow !== "credit") return false;
        if (statusFilter === "Debit" && item.flow !== "debit") return false;
        if (statusFilter === "Pending" && item.statusCode !== "pending") return false;
        if (statusFilter === "Success" && item.status !== "Paid" && item.status !== "Credit") return false;
        if (statusFilter === "Rejected" && item.statusCode !== "rejected") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTrx = item.trxId.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMethod = item.method?.toLowerCase().includes(q);
        const matchUsername = item.referredUser?.username?.toLowerCase().includes(q);
        const matchName = item.referredUser?.name?.toLowerCase().includes(q);
        if (!matchTrx && !matchTitle && !matchMethod && !matchUsername && !matchName) {
          return false;
        }
      }

      return true;
    });
  }, [allTransactions, mainTab, statusFilter, searchQuery]);

  // 8. Pagination calculation
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  const copyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isWithdrawLoading || isReferLoading) {
    return <Loader />;
  }

  // ── Render Transaction Details View ──────────────────────────────────────────
  if (selectedTransaction) {
    const item = selectedTransaction;
    const isPaid = item.status === "Paid";
    const isPending = item.status === "Pending";
    const isCredit = item.flow === "credit";

    return (
      <div className="bg-[#f8f9fd] min-h-screen pb-16 pt-4">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between py-3 mb-3">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Transaction Details</h1>
            <Link
              to="/user/notifications"
              className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors relative"
            >
              <BellIcon className="w-5 h-5" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Top Status & Amount Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-center space-y-4">
              <div className="flex justify-center">
                {isPaid || isCredit ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl shadow-sm border border-emerald-100">
                    <CheckCircleSolid className="w-10 h-10 text-emerald-500" />
                  </div>
                ) : isPending ? (
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-3xl shadow-sm border border-amber-100">
                    <ClockIcon className="w-10 h-10 text-amber-500" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl shadow-sm border border-red-100">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900">{item.title}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      isPaid || isCredit
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : isPending
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transaction ID</p>
                  <button
                    onClick={() => copyText(item.trxId)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-[#5a32fa] transition-colors mt-0.5"
                  >
                    <span>{item.trxId}</span>
                    {copiedId ? (
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <DocumentDuplicateIcon className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-600">৳{item.amount.toFixed(2)}</p>
                  <p className="text-[11px] font-semibold text-gray-400">Amount</p>
                </div>
              </div>
            </div>

            {/* Section 1: User Information */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#5a32fa] flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">User Information</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Name</span>
                  <span className="font-bold text-gray-900">{user?.name || "User"}</span>
                </div>
                {user?.username && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Username</span>
                    <span className="font-bold text-gray-900">{user.username}</span>
                  </div>
                )}
                {user?._id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">User ID</span>
                    <span className="font-mono font-bold text-gray-900">#CNP{String(user._id).slice(-5).toUpperCase()}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">WhatsApp / Phone</span>
                    <span className="font-bold text-gray-900">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Transaction / Withdrawal Information */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <WalletIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  {item.rawType === "withdrawal" ? "Withdrawal Information" : "Transaction Information"}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Amount</span>
                  <span className="font-bold text-gray-900">৳{item.amount.toFixed(2)}</span>
                </div>

                {item.method && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Payment Method</span>
                    <span className="font-bold text-[#5a32fa]">{item.method}</span>
                  </div>
                )}

                {item.account && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Payment Number / Account</span>
                    <span className="font-mono font-bold text-gray-900">{item.account}</span>
                  </div>
                )}

                {item.gen && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Referral Generation</span>
                    <span className="font-bold text-[#5a32fa]">Gen {item.gen}</span>
                  </div>
                )}

                {item.referredUser && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Referred Member</span>
                    <span className="font-bold text-gray-900">
                      {item.referredUser.name || item.referredUser.username || item.referredUser.email}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Request Date & Time</span>
                  <span className="font-medium text-gray-700">
                    {dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </span>
                </div>

                {item.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Approve / Update Date</span>
                    <span className="font-medium text-gray-700">
                      {dayjs(item.updatedAt).format("DD MMM YYYY, hh:mm A")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isPaid || isCredit
                        ? "bg-emerald-50 text-emerald-600"
                        : isPending
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Admin Action / Real Payment Proof */}
            {(item.image || item.note) && (
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Payment Verification</h3>
                </div>

                {/* Real Screenshot from API */}
                {item.image && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500">Payment Proof (Screenshot)</p>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <Image
                          src={item.image}
                          alt="Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Real Note from API */}
                {item.note && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                      📝 Note
                    </p>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Back Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-3.5 rounded-2xl bg-[#5a32fa] hover:bg-[#4a24e0] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99]"
              >
                Back to History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Earning History List View ──────────────────────────────────────────
  return (
    <div className="bg-[#f8f9fd] min-h-screen pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-lg space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Earning History</h1>
          <Link
            to="/user/notifications"
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors relative"
          >
            <BellIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Segmented Control / Main Tabs */}
        <div className="p-1 bg-[#ebeef5] rounded-2xl flex items-center gap-1">
          <button
            onClick={() => {
              setMainTab("all");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === "all"
                ? "bg-[#5a32fa] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All History
          </button>
          <button
            onClick={() => {
              setMainTab("withdrawals");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === "withdrawals"
                ? "bg-[#5a32fa] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Search Bar + Filter Icon */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction ID or username..."
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-white border border-gray-100 shadow-xs text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a32fa]/30 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setStatusFilter("All");
              setSearchQuery("");
            }}
            className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center justify-center text-gray-500 hover:text-[#5a32fa] transition-colors shrink-0"
            title="Reset Filters"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { label: "All" },
            { label: "Credit" },
            { label: "Debit" },
            { label: "Pending" },
            { label: "Success" },
            { label: "Rejected" },
          ].map((chip) => {
            const active = statusFilter === chip.label;
            return (
              <button
                key={chip.label}
                onClick={() => {
                  setStatusFilter(chip.label);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  active
                    ? "bg-[#5a32fa] text-white shadow-sm"
                    : chip.label === "Credit" || chip.label === "Success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/60"
                    : chip.label === "Debit" || chip.label === "Rejected"
                    ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/60"
                    : chip.label === "Pending"
                    ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100/60"
                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Transaction History Items List */}
        <div className="space-y-2.5">
          {paginatedList.length > 0 ? (
            paginatedList.map((item) => {
              const isPaid = item.status === "Paid";
              const isPending = item.status === "Pending";
              const isCredit = item.flow === "credit";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTransaction(item)}
                  className="bg-white rounded-2xl p-3.5 border border-gray-100 hover:border-indigo-100 shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      {item.rawType === "withdrawal" ? (
                        isPaid ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <CheckCircleSolid className="w-6 h-6 text-emerald-500" />
                          </div>
                        ) : isPending ? (
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                            <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          </div>
                        )
                      ) : item.rawType === "referral" ? (
                        <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                          <GiftIcon className="w-5 h-5 text-pink-500" />
                        </div>
                      ) : item.rawType === "topup" ? (
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                          <ArrowsRightLeftIcon className="w-5 h-5 text-blue-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                          <ClipboardDocumentCheckIcon className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">{item.trxId}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount + Status Badge */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">
                      {isCredit ? "+" : "-"} ৳{item.amount.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPaid || isCredit
                          ? "bg-emerald-50 text-emerald-600"
                          : isPending
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5a32fa] flex items-center justify-center text-xl mx-auto">
                📋
              </div>
              <h3 className="text-sm font-bold text-gray-800">No Transactions Found</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                No activity found matching the selected filters.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Pagination */}
        {totalItems > 0 && (
          <div className="pt-3 pb-6 flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-[11px]">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)} to{" "}
              {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50"
              >
                <ChevronDoubleLeftIcon className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                const active = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      active
                        ? "bg-[#5a32fa] text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50"
              >
                <ChevronDoubleRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Earnings;
