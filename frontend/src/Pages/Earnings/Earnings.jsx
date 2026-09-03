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
  UserPlusIcon,
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
  ArrowsRightLeftIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Image } from "antd";
import { api } from "../../util/axios";
import Loader from "../../Components/Loader";

const PAGE_SIZE = 10;

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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

  // 1. Fetch Withdrawals API
  const { data: withdrawalsData, isLoading: isWithdrawLoading } = useQuery({
    queryKey: ["user-withdrawals", user?._id],
    queryFn: async () => {
      const res = await api.get(`/withdraw?user=${user?._id}&limit=100`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 2. Fetch External Withdrawals API
  const { data: extWithdrawalsData } = useQuery({
    queryKey: ["user-ext-withdrawals", user?._id],
    queryFn: async () => {
      const res = await api.get(`/external-withdraw/user/${user?._id}`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 3. Fetch Referral Transactions API
  const { data: referData, isLoading: isReferLoading } = useQuery({
    queryKey: ["earnings-refer-history", user?._id],
    queryFn: async () => {
      const res = await api.get(`/refer/user/${user?._id}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!user?._id,
  });

  // 4. Fetch Task Marketplace Submissions API
  const { data: workSubmitsData } = useQuery({
    queryKey: ["user-work-submits", user?._id],
    queryFn: async () => {
      const res = await api.get(`/tasks/my-submissions`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // 5. Fetch TopUp / Deposit Transactions API
  const { data: topupData } = useQuery({
    queryKey: ["user-topup-history", user?._id],
    queryFn: async () => {
      const res = await api.get(`/topup?user=${user?._id}&limit=100`);
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
            : "Withdrawal Request",
          amount: Number(w.amount || 0),
          flow: "debit",
          status: isCompleted ? "Paid" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
          method: w.method,
          account: w.account,
          image: w.image,
          note: w.note || (isCompleted ? `Payment has been sent successfully to the user ${w.method} number. Please check and confirm.` : ""),
          adminUser: "Admin User",
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
            : "External Withdrawal Request",
          amount: Number(ew.amount || 0),
          flow: "debit",
          status: isCompleted ? "Paid" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: ew.createdAt,
          updatedAt: ew.updatedAt,
          method: ew.method || ew.gateway || "Payment Gateway",
          account: ew.account || ew.walletNumber,
          image: ew.image,
          note: ew.note || (isCompleted ? "Payment processed via External Gateway." : ""),
          adminUser: "Admin User",
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
          amount: Number(r.amount || (r.gen === 1 ? 50 : 20)),
          flow: "credit",
          status: "Credit",
          statusCode: "success",
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          gen: r.gen || 1,
          referredUser: r.user,
          user: user,
        });
      });
    }

    // Map task marketplace submissions. `amount` is the worker's own net
    // reward, snapshotted server-side at submit time — not looked through to
    // the (possibly since-edited) task price.
    if (workSubmitsData && Array.isArray(workSubmitsData)) {
      workSubmitsData.forEach((ws) => {
        const isCompleted = ["APPROVED", "AUTO_APPROVED", "ADMIN_APPROVED"].includes(ws.status);
        const isPending = ws.status === "PENDING" || ws.status === "REPORTED";

        list.push({
          id: ws._id,
          trxId: `TRX${String(ws._id).slice(-7).toUpperCase()}`,
          rawType: "task",
          title: ws.task?.title || "Task Completed",
          amount: Number(ws.amount || 0),
          flow: "credit",
          status: isCompleted ? "Credit" : isPending ? "Pending" : "Rejected",
          statusCode: isCompleted ? "success" : isPending ? "pending" : "rejected",
          createdAt: ws.createdAt,
          updatedAt: ws.reviewedAt || ws.createdAt,
          taskTitle: ws.task?.title,
          image: ws.proof?.screenshots?.[0],
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

  // Auto-select the first transaction on desktop if none selected
  const activeTransaction = selectedTransaction || (filteredTransactions.length > 0 ? filteredTransactions[0] : null);

  const copyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("Transaction ID কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Paid":
      case "Success":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Paid
          </span>
        );
      case "Credit":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Credit
          </span>
        );
      case "Debit":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
            Debit
          </span>
        );
      case "Pending":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-gray-50 text-gray-600 border border-gray-100">
            {status}
          </span>
        );
    }
  };

  // Helper for item icon
  const renderItemIcon = (item) => {
    if (item.rawType === "withdrawal") {
      if (item.status === "Paid") {
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircleSolid className="w-6 h-6 text-emerald-500" />
          </div>
        );
      } else if (item.status === "Pending") {
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
          </div>
        );
      } else {
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
          </div>
        );
      }
    } else if (item.rawType === "referral") {
      return (
        <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
          <GiftIcon className="w-5 h-5 text-pink-500" />
        </div>
      );
    } else if (item.rawType === "topup") {
      return (
        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
          <ArrowsRightLeftIcon className="w-5 h-5 text-primary" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
          <ClipboardDocumentCheckIcon className="w-5 h-5 text-amber-500" />
        </div>
      );
    }
  };

  if (isWithdrawLoading || isReferLoading) {
    return <Loader />;
  }

  // ── Render Transaction Details Content Component ─────────────────────────────
  const renderDetailsContent = (item) => {
    if (!item) {
      return (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary-light text-primary flex items-center justify-center text-2xl mx-auto">
            📋
          </div>
          <h3 className="text-sm font-bold text-gray-800">কোনো লেনদেন নির্বাচিত নেই</h3>
          <p className="text-xs text-gray-400">
            বিস্তারিত দেখতে বাম পাশের তালিকা থেকে যেকোনো লেনদেনে ক্লিক করুন।
          </p>
        </div>
      );
    }

    const isPaid = item.status === "Paid";
    const isPending = item.status === "Pending";
    const isCredit = item.flow === "credit";

    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Top Status & Amount Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center space-y-4">
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
            <div className="flex items-center justify-center gap-2 mt-1.5">
              {renderStatusBadge(item.status)}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Transaction ID
              </p>
              <button
                onClick={() => copyText(item.trxId)}
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-800 hover:text-primary transition-colors mt-0.5"
                title="কপি করুন"
              >
                <span>{item.trxId}</span>
                {copiedId ? (
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <DocumentDuplicateIcon className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-emerald-600">৳{formatCurrency(item.amount)}</p>
              <p className="text-[11px] font-semibold text-gray-400">Amount</p>
            </div>
          </div>
        </div>

        {/* Section 1: User Information */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="w-7 h-7 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              User Information
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Name</span>
              <span className="font-bold text-gray-900">{user?.name || "Yeasmin Akter"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Username</span>
              <span className="font-bold text-gray-900">{user?.username || "user"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">User ID</span>
              <span className="font-mono font-bold text-gray-900">
                #CNP{String(user?._id || "12568").slice(-5).toUpperCase()}
              </span>
            </div>
            {user?.phone && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">WhatsApp</span>
                <span className="font-bold text-gray-900">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Transaction / Withdrawal Information */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              {item.rawType === "withdrawal" ? "Withdrawal Information" : "Transaction Information"}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">
                {item.rawType === "withdrawal" ? "Withdrawal Amount" : "Transaction Amount"}
              </span>
              <span className="font-bold text-gray-900">৳{formatCurrency(item.amount)}</span>
            </div>

            {item.method && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Method</span>
                <span className="font-bold text-primary">{item.method}</span>
              </div>
            )}

            {item.account && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Number</span>
                <span className="font-mono font-bold text-gray-900">{item.account}</span>
              </div>
            )}

            {item.gen && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Referral Generation</span>
                <span className="font-bold text-primary">Gen {item.gen}</span>
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
                <span className="text-gray-500 font-medium">Approve Date & Time</span>
                <span className="font-medium text-gray-700">
                  {dayjs(item.updatedAt).format("DD MMM YYYY, hh:mm A")}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Status</span>
              <div>{renderStatusBadge(item.status)}</div>
            </div>
          </div>
        </div>

        {/* Section 3: Admin Action / Real Payment Proof */}
        {(item.image || item.note || item.rawType === "withdrawal") && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Admin Action
              </h3>
            </div>

            {/* Proof Screenshot */}
            {item.image ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-500">
                  Payment Proof (Screenshot)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-28 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                    <Image
                      src={item.image}
                      alt="Proof"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-1.5 p-2 text-center hover:bg-gray-50 transition-colors">
                    <CloudArrowDownIcon className="w-6 h-6 text-primary" />
                    <span className="text-[11px] font-bold text-gray-700">View Full Size</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Admin Note Box */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                <span>📝 Admin Note</span>
              </div>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                {item.note ||
                  `Payment has been sent successfully to the user ${item.method || "bKash"} number. Please check and confirm.`}
              </p>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Admin</span>
                <span className="font-bold text-gray-900">{item.adminUser || "Admin User"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Action Date</span>
                <span className="font-medium text-gray-700">
                  {dayjs(item.updatedAt || item.createdAt).format("DD MMM YYYY, hh:mm A")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Back Button (Shown on mobile details view) */}
        <div className="pt-2 block lg:hidden">
          <button
            onClick={() => setSelectedTransaction(null)}
            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-teal-500/25 active:scale-[0.99] transition-all"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  };

  // ── Render Dedicated Mobile Details View ─────────────────────────────────────
  if (selectedTransaction && window.innerWidth < 1024) {
    return (
      <div className="bg-[#f8faff] min-h-screen pb-16 pt-4">
        <div className="container mx-auto px-4 max-w-lg space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">
              Transaction Details
            </h1>
            <Link
              to="/user/notifications"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all relative"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
            </Link>
          </div>

          {renderDetailsContent(selectedTransaction)}
        </div>
      </div>
    );
  }

  // ── Render Earning History List View (Mobile + Desktop 2-Column) ──────────────
  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-4 sm:pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Earning History
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                আপনার সকল আয়, বোনাস ও উইথড্রয়াল ট্রানজেকশন হিস্ট্রি
              </p>
            </div>
          </div>

          <Link
            to="/user/notifications"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all relative"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
          </Link>
        </div>

        {/* 🌟 Segmented Control / Main Tabs */}
        <div className="p-1.5 bg-[#f0f2f8] rounded-2xl flex items-center gap-1.5 max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => {
              setMainTab("all");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mainTab === "all"
                ? "bg-primary text-white shadow-md shadow-teal-500/20"
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
                ? "bg-primary text-white shadow-md shadow-teal-500/20"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Search Bar + Filter Button */}
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
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-white border border-gray-200/90 shadow-sm text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => {
              setStatusFilter("All");
              setSearchQuery("");
            }}
            className="w-11 h-11 rounded-2xl bg-white border border-gray-200/90 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary active:scale-95 transition-all shrink-0"
            title="ফিল্টার রিসেট করুন"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 stroke-[2]" />
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
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  active
                    ? "bg-primary text-white shadow-md shadow-teal-500/20"
                    : chip.label === "Credit" || chip.label === "Success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/60"
                    : chip.label === "Debit" || chip.label === "Rejected"
                    ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/60"
                    : chip.label === "Pending"
                    ? "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100/60"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* ======================================================================= */}
        {/* 🚀 RESPONSIVE 2-COLUMN LAYOUT (Desktop: List on Left + Live Details on Right) */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Transaction List */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-2.5">
            {paginatedList.length > 0 ? (
              paginatedList.map((item) => {
                const isPaid = item.status === "Paid";
                const isPending = item.status === "Pending";
                const isCredit = item.flow === "credit";
                const isSelected = activeTransaction?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedTransaction(item);
                    }}
                    className={`bg-white rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-primary ring-2 ring-teal-400/20 bg-primary-light/40 shadow-sm"
                        : "border-gray-100 hover:border-teal-100 hover:bg-gray-50/50 shadow-sm"
                    }`}
                  >
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">{renderItemIcon(item)}</div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          {item.trxId}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount + Status Badge */}
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-black text-gray-900">
                        ৳{formatCurrency(item.amount)}
                      </p>
                      <div className="mt-1">{renderStatusBadge(item.status)}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center text-xl mx-auto">
                  📋
                </div>
                <h3 className="text-sm font-bold text-gray-800">কোনো লেনদেন পাওয়া যায়নি</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  নির্বাচিত ফিল্টার অনুযায়ী কোনো ট্রানজেকশন রেকর্ড নেই।
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                <span className="font-semibold text-gray-600 text-xs">
                  Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
                </span>

                <div className="flex items-center gap-1 self-center sm:self-auto">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50 transition-all font-bold"
                    title="First Page"
                  >
                    «
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50 transition-all font-bold"
                    title="Previous Page"
                  >
                    ‹
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    const active = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                          active
                            ? "bg-[#6035f8] text-white shadow-sm"
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
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50 transition-all font-bold"
                    title="Next Page"
                  >
                    ›
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-50 transition-all font-bold"
                    title="Last Page"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Transaction Details Panel (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-6">
            {renderDetailsContent(activeTransaction)}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Earnings;
