import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Card,
  Button,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  BanknotesIcon,
  UserIcon,
  DocumentDuplicateIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  PlusIcon,
  MinusIcon,
  UserGroupIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import moment from "moment";
import { api } from "../../../util/axios";
import {
  PageHeader,
  StatCard,
  StatGrid,
  TableCard,
  TableHead,
} from "../../../Components/AdminLayout/_Ui/AdminUI";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000];

export default function Check() {
  const { settings } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  const [searchText, setSearchText] = useState("");
  const [lastSearched, setLastSearched] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // User transaction history state
  const [userTransactions, setUserTransactions] = useState([]);
  const [isTxLoading, setIsTxLoading] = useState(false);

  const [creditType, setCreditType] = useState("add"); // "add" | "deduct"
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const q =
      searchParams.get("search") ||
      searchParams.get("query") ||
      searchParams.get("user") ||
      searchParams.get("username") ||
      searchParams.get("email");
    if (q) {
      setSearchText(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchTransactions = async (userId) => {
    if (!userId) return;
    try {
      setIsTxLoading(true);
      const res = await api.get(`/transaction/user/${userId}?limit=15`);
      setUserTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch user transactions:", err);
    } finally {
      setIsTxLoading(false);
    }
  };

  const handleSearch = async (query) => {
    const term = (query !== undefined ? query : searchText).trim();
    if (!term) {
      toast.error("Please enter a username or email");
      return;
    }

    try {
      setIsLoading(true);
      setData(null);
      setUserTransactions([]);
      const res = await api.get(`/refer/statistic/${encodeURIComponent(term)}`);
      setData(res.data);
      setLastSearched(term);
      setAmountInput("");
      setNoteInput("");

      // Fetch transaction history
      if (res.data?.user?._id) {
        fetchTransactions(res.data.user._id);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "User not found"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (lastSearched) {
      handleSearch(lastSearched);
    }
  };

  // Submit credit/debit transaction
  const handleCreditSubmit = async (e) => {
    e?.preventDefault();
    if (!data?.user) return;

    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (creditType === "deduct" && amount > (data.user.balance || 0)) {
      toast.error("Cannot deduct more than user's current balance");
      return;
    }

    const type = creditType === "add" ? "credit" : "debit";

    try {
      setUpdating(true);
      const res = await api.post("/transaction/adjust", {
        userId: data.user._id,
        amount,
        type,
        note: noteInput.trim(),
        title: creditType === "add" ? "Admin Balance Credit" : "Admin Balance Deduction",
      });

      toast.success(
        res.data?.message || `Successfully ${type === "credit" ? "credited" : "deducted"} ৳${amount}!`
      );

      setAmountInput("");
      setNoteInput("");
      await handleSearch(lastSearched || data.user.email);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to process transaction"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Quick amount chip selection
  const handleQuickAmount = (val) => {
    setAmountInput(String(val));
  };

  const user = data?.user;
  const currentBalance = Number(user?.balance) || 0;
  const parsedAmount = parseFloat(amountInput) || 0;
  const calculatedCreditBalance =
    creditType === "add"
      ? currentBalance + parsedAmount
      : Math.max(0, currentBalance - parsedAmount);

  // Referral tier calculations
  const genRates = {
    gen1: Number(settings?.ref_comm?.gen1) || 0,
    gen2: Number(settings?.ref_comm?.gen2) || 0,
    gen3: Number(settings?.ref_comm?.gen3) || 0,
    gen4: Number(settings?.ref_comm?.gen4) || 0,
    gen5: Number(settings?.ref_comm?.gen5) || 0,
    gen6: Number(settings?.ref_comm?.gen6) || 0,
  };

  const genCounts = {
    gen1: Number(data?.gen1) || 0,
    gen2: Number(data?.gen2) || 0,
    gen3: Number(data?.gen3) || 0,
    gen4: Number(data?.gen4) || 0,
    gen5: Number(data?.gen5) || 0,
    gen6: Number(data?.gen6) || 0,
  };

  const totalReferrals = Object.values(genCounts).reduce((a, b) => a + b, 0);
  const totalEstimatedEarnings = Object.keys(genCounts).reduce((acc, key) => {
    return acc + genCounts[key] * genRates[key];
  }, 0);

  const generations = [
    { key: "gen1", name: "1st Generation", badge: "Direct Referrals", color: "bg-emerald-500 text-white" },
    { key: "gen2", name: "2nd Generation", badge: "Tier 2", color: "bg-blue-500 text-white" },
    { key: "gen3", name: "3rd Generation", badge: "Tier 3", color: "bg-indigo-500 text-white" },
    { key: "gen4", name: "4th Generation", badge: "Tier 4", color: "bg-purple-500 text-white" },
    { key: "gen5", name: "5th Generation", badge: "Tier 5", color: "bg-pink-500 text-white" },
    { key: "gen6", name: "6th Generation", badge: "Tier 6", color: "bg-amber-500 text-white" },
  ];

  return (
    <div className="container mx-auto px-2.5 sm:px-6 py-4 sm:py-6 max-w-7xl">
      {/* Page Header */}
      <PageHeader
        icon={BanknotesIcon}
        title="Check User & Balance"
        subtitle="Lookup user profiles, inspect multi-generation referral stats, and record balance transactions."
        accent="teal"
        action={
          user ? (
            <Button
              variant="outlined"
              size="sm"
              className="flex items-center justify-center gap-2 border-gray-300 text-gray-700 normal-case hover:bg-gray-50 w-full sm:w-auto text-xs py-2 sm:py-2.5"
              onClick={handleRefresh}
              disabled={isLoading || updating}
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh User
            </Button>
          ) : null
        }
      />

      {/* Search Bar Card */}
      <Card className="p-3.5 sm:p-5 mb-5 sm:mb-6 shadow-sm border border-gray-100 rounded-2xl sm:rounded-3xl bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full"
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by Username or Email..."
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900 placeholder-gray-400"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !searchText.trim()}
            className="w-full sm:w-auto shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 normal-case rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-4 h-4 stroke-[2.5]" />
                Search User
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-5 h-96 bg-gray-100 rounded-2xl" />
          <div className="lg:col-span-7 h-96 bg-gray-100 rounded-2xl" />
        </div>
      )}

      {/* Empty State: No user searched yet */}
      {!isLoading && !user && (
        <Card className="p-12 text-center shadow-sm border border-gray-100 rounded-3xl bg-gradient-to-b from-white to-gray-50/50 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500/10 to-emerald-500/20 text-teal-600 flex items-center justify-center mb-4 shadow-inner">
            <UserGroupIcon className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Search a User to Get Started
          </h3>
          <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
            Enter a user's username or email address above to inspect their profile, view account balances, analyze their 6-tier referral downline, or send/adjust funds with automatic transaction recording.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 font-medium text-gray-600">
              <BanknotesIcon className="w-4 h-4 text-teal-600" /> Send / Credit Balance
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 font-medium text-gray-600">
              <SparklesIcon className="w-4 h-4 text-emerald-600" /> 6-Tier Referral Tree
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 font-medium text-gray-600">
              <ClockIcon className="w-4 h-4 text-blue-600" /> Auto Transaction Logging
            </span>
          </div>
        </Card>
      )}

      {/* Main Content: User Found */}
      {!isLoading && user && (
        <div className="space-y-6">
          {/* Top Row: Profile Card & Balance Action Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* User Profile Overview (Left: 5 cols) */}
            <Card className="lg:col-span-5 p-4 sm:p-6 shadow-sm border border-gray-100 rounded-2xl sm:rounded-3xl bg-white flex flex-col justify-between">
              <div>
                {/* Profile Top: Avatar + Name + Status */}
                <div className="flex items-start gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-gray-100">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar || "/default-avater.png"}
                      alt={user.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                      onError={(e) => {
                        e.target.src = "/default-avater.png";
                      }}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white ${user.status === "active"
                        ? "bg-emerald-500"
                        : user.status === "pending"
                          ? "bg-amber-500"
                          : "bg-red-500"
                        }`}
                      title={`Status: ${user.status}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {user.name}
                      </h2>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${user.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                          : user.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                            : "bg-red-50 text-red-700 border border-red-200/50"
                          }`}
                      >
                        {user.status || "active"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <span className="font-semibold text-gray-700 font-mono">
                        @{user.username}
                      </span>
                      <button
                        onClick={() => handleCopy(user.username, "Username")}
                        className="text-gray-400 hover:text-teal-600 transition-colors p-0.5"
                        title="Copy Username"
                      >
                        {copiedField === "Username" ? (
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 capitalize">
                        {user.role || "User"}
                      </span>
                      {user.lock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                          <LockClosedIcon className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <LockOpenIcon className="w-3 h-3" /> Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="py-3 sm:py-4 space-y-2.5 sm:space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2 shrink-0">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" /> Email
                    </span>
                    <span className="font-medium text-gray-900 flex items-center gap-1.5 truncate max-w-[170px] sm:max-w-[220px]">
                      <span className="truncate">{user.email}</span>
                      <button
                        onClick={() => handleCopy(user.email, "Email")}
                        className="text-gray-400 hover:text-teal-600 transition-colors shrink-0 p-0.5"
                        title="Copy Email"
                      >
                        {copiedField === "Email" ? (
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2 shrink-0">
                      <PhoneIcon className="w-4 h-4 text-gray-400" /> Phone / WA
                    </span>
                    <span className="font-medium text-gray-900 flex items-center gap-1.5 truncate">
                      <span>{user.phone || "Not set"}</span>
                      {user.phone && (
                        <button
                          onClick={() => handleCopy(user.phone, "Phone")}
                          className="text-gray-400 hover:text-teal-600 transition-colors shrink-0 p-0.5"
                          title="Copy Phone"
                        >
                          {copiedField === "Phone" ? (
                            <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2 shrink-0">
                      <UserGroupIcon className="w-4 h-4 text-gray-400" /> Referrer
                    </span>
                    <span className="font-semibold text-gray-800 truncate max-w-[180px]">
                      {user.reffer?.username ? `@${user.reffer.username}` : "Direct Signup (None)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500 flex items-center gap-2 shrink-0">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400" /> Joined Date
                    </span>
                    <span className="font-medium text-gray-700">
                      {user.createdAt ? moment(user.createdAt).format("MMM DD, YYYY") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User ID Badge footer */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-gray-400">
                <span className="truncate max-w-[220px]">User ID: <span className="font-mono text-gray-600 select-all">{user._id}</span></span>
                <button
                  onClick={() => handleCopy(user._id, "User ID")}
                  className="text-teal-600 hover:underline flex items-center gap-1 font-medium shrink-0"
                >
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Copy ID
                </button>
              </div>
            </Card>

            {/* Balance & Fund Adjustment Manager (Right: 7 cols) */}
            <Card className="lg:col-span-7 p-4 sm:p-6 shadow-sm border border-gray-100 rounded-2xl sm:rounded-3xl bg-white flex flex-col justify-between">
              <div>
                {/* Balance Hero Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-900 via-[#0d1b2a] to-[#1b263b] text-white shadow-lg mb-4 sm:mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-300/80 flex items-center gap-1.5 mb-1">
                        <BanknotesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" /> Current User Balance
                      </span>
                      <div className="text-2xl sm:text-4xl font-black tracking-tight text-white font-mono flex items-baseline gap-1.5">
                        <span className="text-teal-400">৳</span>
                        {currentBalance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 text-emerald-300 font-medium backdrop-blur-md border border-white/10">
                        <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> Auto-Logged on Ledger
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreditSubmit} className="space-y-3.5 sm:space-y-4">
                  {/* Operation Type Switcher (Add vs Deduct) */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-gray-100 w-full sm:w-max">
                    <button
                      type="button"
                      onClick={() => setCreditType("add")}
                      className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${creditType === "add"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Credit / Send (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreditType("deduct")}
                      className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${creditType === "deduct"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      <MinusIcon className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Deduct (-)</span>
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {creditType === "add" ? "Amount to Send / Add (৳)" : "Amount to Deduct (৳)"}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">
                        ৳
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="Enter amount (e.g. 500)"
                        className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Quick Amount Chips */}
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                      Quick Amounts:
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickAmount(amt)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 border border-gray-200/60 active:scale-95 transition-all"
                        >
                          +৳{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Note / Reason Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-500" />
                      Transaction Note / Purpose (Visible to User)
                    </label>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="e.g. Performance Bonus, Task Reward, Correction..."
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900"
                    />
                  </div>

                  {/* Real-time preview calculation box */}
                  {parsedAmount > 0 && (
                    <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="font-semibold">Current: ৳{currentBalance}</span>
                        <span>{creditType === "add" ? "+" : "-"}</span>
                        <span className="font-bold text-teal-700">৳{parsedAmount}</span>
                      </div>
                      <div className="font-bold text-teal-900 flex items-center gap-1.5">
                        <span>Resulting:</span>
                        <span className="text-sm font-black font-mono">
                          ৳{calculatedCreditBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={updating || !parsedAmount}
                    className={`w-full py-2.5 sm:py-3 rounded-xl normal-case font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${creditType === "add"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      }`}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <BanknotesIcon className="w-4 h-4" />
                        {creditType === "add"
                          ? `Send & Credit ৳${parsedAmount || 0}`
                          : `Deduct ৳${parsedAmount || 0}`}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Row 2: User's Recent Balance Transactions Table */}
          <TableCard
            toolbar={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-teal-600" />
                    Transaction History for this User
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live balance adjustment log (also visible on the user's "My Earnings" panel).
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 self-start sm:self-auto">
                  Showing Latest {userTransactions.slice(0, 15).length} Transactions
                </span>
              </div>
            }
          >
            {isTxLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading transactions...</div>
            ) : userTransactions.length > 0 ? (
              <>
                {/* 📱 Mobile View: Responsive Transaction Cards (Shown on small screens) */}
                <div className="divide-y divide-gray-100 md:hidden">
                  {userTransactions.slice(0, 15).map((tx) => {
                    const isCredit = tx.type === "credit";
                    const hasBalance =
                      tx.balanceBefore != null &&
                      tx.balanceAfter != null &&
                      !(tx.balanceBefore === 0 && tx.balanceAfter === 0);

                    return (
                      <div key={tx._id} className="p-3.5 space-y-2.5 hover:bg-gray-50/70 transition-colors">
                        {/* Top: Status Badge + Date */}
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {isCredit ? "Credit (+)" : "Debit (-)"}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {moment(tx.createdAt).format("DD MMM YYYY, hh:mm A")}
                          </span>
                        </div>

                        {/* Middle: Trx ID + Big Amount */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 font-mono text-xs text-gray-700 font-semibold">
                            <span>{tx.trxId}</span>
                            <button
                              onClick={() => handleCopy(tx.trxId, "Trx ID")}
                              className="text-gray-400 hover:text-teal-600 p-0.5"
                              title="Copy Trx ID"
                            >
                              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className={`text-base font-black font-mono ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
                            {isCredit ? "+" : "-"}৳{tx.amount?.toLocaleString()}
                          </span>
                        </div>

                        {/* Bottom Info: Balance Transition + Note */}
                        <div className="pt-1 border-t border-gray-100/60 flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-500">
                          <div>
                            <span className="text-gray-400">Balance: </span>
                            {hasBalance ? (
                              <span className="font-mono text-gray-700">
                                ৳{tx.balanceBefore} → <strong className="text-gray-900">৳{tx.balanceAfter}</strong>
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">N/A</span>
                            )}
                          </div>
                          {tx.note && (
                            <span className="text-gray-600 italic truncate max-w-[170px]" title={tx.note}>
                              {tx.note}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 🖥️ Desktop / Tablet View: Full Data Table (Shown on md+ screens) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full table-auto text-left text-xs min-w-[680px]">
                    <TableHead
                      columns={[
                        "Trx ID",
                        "Type",
                        "Amount",
                        "Balance (Before → After)",
                        "Note / Reason",
                        "Issued By",
                        "Date & Time",
                      ]}
                    />
                    <tbody className="divide-y divide-gray-100">
                      {userTransactions.slice(0, 15).map((tx) => {
                        const isCredit = tx.type === "credit";
                        return (
                          <tr key={tx._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-gray-800">
                              <span className="flex items-center gap-1">
                                {tx.trxId}
                                <button
                                  onClick={() => handleCopy(tx.trxId, "Trx ID")}
                                  className="text-gray-400 hover:text-teal-600 transition-colors"
                                >
                                  <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${isCredit
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                              >
                                {isCredit ? "Credit (+)" : "Debit (-)"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-black font-mono text-sm">
                              <span className={isCredit ? "text-emerald-600" : "text-red-600"}>
                                {isCredit ? "+" : "-"}৳{tx.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-500">
                              {tx.balanceBefore != null &&
                              tx.balanceAfter != null &&
                              !(tx.balanceBefore === 0 && tx.balanceAfter === 0) ? (
                                <>
                                  ৳{tx.balanceBefore} →{" "}
                                  <strong className="text-gray-900">৳{tx.balanceAfter}</strong>
                                </>
                              ) : (
                                <span className="text-gray-400 font-sans font-medium text-xs">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                              {tx.note || <span className="text-gray-400 italic">No note</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-medium">
                              {tx.adminUser?.name || "Admin"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-medium">
                              {moment(tx.createdAt).format("DD MMM YYYY, hh:mm A")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No manual balance transactions recorded yet for this user.
              </div>
            )}
          </TableCard>

          {/* Row 3: Referral Network Statistics Cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-teal-600" />
                Referral Network Breakdown
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                Total Downline: <strong className="text-gray-900">{totalReferrals} users</strong>
              </span>
            </div>

            <StatGrid>
              <StatCard
                title="Total Downline"
                value={totalReferrals}
                hint="Across all 6 generations"
                icon={UserGroupIcon}
                colorClass="text-teal-600"
                bgClass="bg-teal-50"
              />
              <StatCard
                title="Direct Referrals (Gen 1)"
                value={genCounts.gen1}
                hint={`৳${genRates.gen1} commission / refer`}
                icon={UserIcon}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <StatCard
                title="Network Downline (Gen 2-6)"
                value={totalReferrals - genCounts.gen1}
                hint="Multi-tier sub-referrals"
                icon={ArrowTrendingUpIcon}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />
              <StatCard
                title="Est. Commission Yield"
                value={`৳${totalEstimatedEarnings.toLocaleString()}`}
                hint="Calculated based on active rates"
                icon={BanknotesIcon}
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
            </StatGrid>
          </div>

          {/* Row 4: Generation Tier Table */}
          <TableCard
            toolbar={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  6-Tier Referral Distribution
                </span>
                <span className="text-xs text-gray-400">
                  Settings Rates applied automatically
                </span>
              </div>
            }
          >
            {/* 📱 Mobile View: Generation Distribution Cards */}
            <div className="divide-y divide-gray-100 sm:hidden">
              {generations.map(({ key, name, badge, color }) => {
                const count = genCounts[key];
                const rate = genRates[key];
                const tierValue = count * rate;
                const percent = totalReferrals > 0 ? ((count / totalReferrals) * 100).toFixed(1) : "0.0";

                return (
                  <div key={key} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color}`}>
                          {badge}
                        </span>
                        <span className="font-bold text-gray-900 text-xs">{name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        ৳{rate} <span className="text-[10px] text-gray-400 font-normal">/ refer</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-gray-500">
                        Referrals: <strong className="text-gray-900 font-mono font-bold">{count} users</strong>
                      </span>
                      <span className="font-black text-teal-700 font-mono text-sm">
                        ৳{tierValue.toLocaleString()}
                      </span>
                    </div>

                    {/* Percentage bar */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 w-10 text-right font-medium">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🖥️ Desktop View: Full Generation Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full table-auto text-left min-w-[550px]">
                <TableHead
                  columns={[
                    "Tier / Level",
                    "Commission Rate",
                    "Total Referrals",
                    "Total Value",
                    "Network Share",
                  ]}
                />
                <tbody className="divide-y divide-gray-100 text-sm">
                  {generations.map(({ key, name, badge, color }) => {
                    const count = genCounts[key];
                    const rate = genRates[key];
                    const tierValue = count * rate;
                    const percent = totalReferrals > 0 ? ((count / totalReferrals) * 100).toFixed(1) : "0.0";

                    return (
                      <tr key={key} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color}`}>
                              {badge}
                            </span>
                            <span className="font-bold text-gray-900">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-xs font-semibold">
                            ৳ {rate} / refer
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-black text-gray-900 font-mono text-base">
                            {count}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">users</span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-teal-700 font-mono">
                          ৳ {tierValue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="font-mono text-gray-700">{percent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>
      )}
    </div>
  );
}
