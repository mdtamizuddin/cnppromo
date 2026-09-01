import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  QrCodeIcon,
  InformationCircleIcon,
  BuildingLibraryIcon,
  UserIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import logoProvider from "../Admin/Users/_Ui/logoProvider";
import Loader from "../../Components/Loader";

const typeColor = {
  "Mobile Banking": "bg-teal-50 text-teal-700 border-teal-100",
  Bank: "bg-blue-50 text-blue-700 border-blue-100",
  "Online Payment": "bg-indigo-50 text-indigo-700 border-indigo-100",
  Crypto: "bg-amber-50 text-amber-700 border-amber-100",
  Other: "bg-gray-50 text-gray-600 border-gray-100",
};

const GatewayLogo = ({ name, icon, className = "w-12 h-12" }) => {
  const logoSrc = icon || logoProvider(name);
  return (
    <div
      className={`${className} rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden`}
    >
      <img
        src={logoSrc}
        alt={name || "Gateway"}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.src = "/logo/bank.png";
        }}
      />
    </div>
  );
};

const CopyButton = ({ value, label = "কপি করুন" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("কপি হয়েছে!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("কপি করা যায়নি");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
        copied
          ? "bg-emerald-500 text-white"
          : "bg-primary-light text-primary hover:bg-primary hover:text-white"
      }`}
    >
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5" />
      ) : (
        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
      )}
      <span>{copied ? "কপি হয়েছে" : label}</span>
    </button>
  );
};

const PaymentGateway = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);

  // Admin-configured gateways (deposit accounts shown for reference)
  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery({
    queryKey: ["user-payment-gateways"],
    queryFn: async () => {
      try {
        const res = await api.get("/gateway?status=Active");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });

  // The user's own saved withdrawal accounts
  const { data: myAccounts = [], refetch: refetchMyAccounts } = useQuery({
    queryKey: ["my-payment-accounts"],
    queryFn: async () => {
      try {
        const res = await api.get("/user/payment-accounts");
        return res.data?.accounts || [];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });

  const types = useMemo(() => {
    const set = new Set(gateways.map((g) => g.type).filter(Boolean));
    return ["All", ...set];
  }, [gateways]);

  const filtered = useMemo(() => {
    return gateways.filter((g) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (g.name || "").toLowerCase().includes(q) ||
        (g.accountNumber || "").includes(q) ||
        (g.subName || "").toLowerCase().includes(q);
      const matchType = typeFilter === "All" || g.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [gateways, search, typeFilter]);

  const getMyAccount = (gatewayId) =>
    myAccounts.find((a) => a.gatewayId === gatewayId);

  const startEdit = (g) => {
    const mine = getMyAccount(g._id);
    setEditing(g);
    setAccountNumber(mine?.accountNumber || "");
  };

  const handleSave = async () => {
    if (!editing) return;
    const number = accountNumber.trim();
    if (number.length < 6) {
      toast.error("সঠিক অ্যাকাউন্ট নম্বর দিন (কমপক্ষে ৬ ডিজিট)");
      return;
    }
    setSaving(true);
    try {
      await api.post("/user/payment-accounts", {
        gatewayId: editing._id,
        gatewayName: editing.name,
        accountNumber: number,
      });
      toast.success("আপনার পেমেন্ট একাউন্ট সংরক্ষিত হয়েছে");
      setEditing(null);
      setAccountNumber("");
      queryClient.invalidateQueries("my-payment-accounts");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "সংরক্ষণ ব্যর্থ হয়েছে"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gatewayId) => {
    if (!window.confirm("আপনার সংরক্ষিত এই অ্যাকাউন্টটি মুছে ফেলবেন?")) return;
    try {
      await api.delete(`/user/payment-accounts/${gatewayId}`);
      toast.success("অ্যাকাউন্ট মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries("my-payment-accounts");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "মুছে ফেলা যায়নি");
    }
  };

  if (gatewaysLoading) {
    return (
      <div className="bg-[#f8faff] min-h-screen pt-10">
        <Loader />
      </div>
    );
  }

  const savedCount = myAccounts.length;

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-4 sm:pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-5">
        {/* 🏷️ Page Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] text-white p-6 sm:p-8 shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 bottom-0 w-56 h-56 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center shadow-lg">
              <BanknotesIcon className="w-7 h-7 text-teal-300" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight">
                পেমেন্ট গেটওয়ে
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-400">
                উইথড্রয়ালের জন্য আপনার নিজস্ব অ্যাকাউন্ট সেট করুন
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                মোট মেথড
              </p>
              <p className="text-xl font-black text-white mt-0.5">
                {gateways.length}
              </p>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ArrowDownTrayIcon className="w-3 h-3" /> টপ-আপ
              </p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">
                {gateways.filter((g) => g.isDepositSupported !== false).length}
              </p>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ArrowUpTrayIcon className="w-3 h-3" /> উইথড্র
              </p>
              <p className="text-xl font-black text-rose-400 mt-0.5">
                {gateways.filter((g) => g.isWithdrawSupported !== false).length}
              </p>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3" /> সংরক্ষিত
              </p>
              <p className="text-xl font-black text-amber-300 mt-0.5">
                {savedCount}
              </p>
            </div>
          </div>
        </div>

        {/* 🔍 Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="মেথড বা নম্বর খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setTypeFilter("All")}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                typeFilter === "All"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              সব
            </button>
            {types
              .filter((t) => t !== "All")
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    typeFilter === t
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
          </div>
        </div>

        {/* 📋 Gateway List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <BuildingLibraryIcon className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              কোনো পেমেন্ট মেথড পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              বর্তমানে কোনো অ্যাক্টিভ পেমেন্ট গেটওয়ে নেই অথবা আপনার খোঁজের সাথে মিলে এমন কোনো মেথড নেই।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const mine = getMyAccount(g._id);
              const supportsWithdraw = g.isWithdrawSupported !== false;
              return (
                <div
                  key={g._id}
                  className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <GatewayLogo name={g.name} icon={g.icon} />
                      <div>
                        <h3 className="text-sm font-black text-[#0b0c2a] flex items-center gap-1.5">
                          {g.name}
                          {g.status === "Maintenance" && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-700">
                              Maintenance
                            </span>
                          )}
                        </h3>
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {g.subName || g.accountType || "Payment Method"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border shrink-0 ${
                        typeColor[g.type] || typeColor.Other
                      }`}
                    >
                      {g.type || "Other"}
                    </span>
                  </div>

                  {/* Deposit account (site account for top-up) */}
                  {g.isDepositSupported !== false && (
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 space-y-1">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <ArrowDownTrayIcon className="w-3 h-3" />
                        টপ-আপ অ্যাকাউন্ট (সাইটের)
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black font-mono text-[#0b0c2a] tracking-wide truncate">
                          {g.accountNumber || "—"}
                        </p>
                        <CopyButton value={g.accountNumber || ""} />
                      </div>
                    </div>
                  )}

                  {/* My personal withdraw account */}
                  <div className={`rounded-2xl p-3 space-y-1 flex-1 relative overflow-hidden border ${
                    mine
                      ? "bg-emerald-50/70 border-emerald-100"
                      : "bg-gray-50 border-dashed border-gray-200"
                  }`}>
                    {supportsWithdraw && (
                      <>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                          mine ? "text-emerald-600" : "text-gray-400"
                        }`}>
                          <ArrowUpTrayIcon className="w-3 h-3" />
                          আমার উইথড্র অ্যাকাউন্ট
                        </span>
                        {mine ? (
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black font-mono text-[#0b0c2a] tracking-wide truncate">
                              {mine.accountNumber}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(g)}
                                className="p-1.5 rounded-lg bg-white border border-gray-200 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                title="সম্পাদনা করুন"
                              >
                                <PencilIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(g._id)}
                                className="p-1.5 rounded-lg bg-white border border-gray-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(g)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-colors text-[11px] font-bold cursor-pointer"
                          >
                            <PlusIcon className="w-4 h-4" />
                            আমার অ্যাকাউন্ট যোগ করুন
                          </button>
                        )}
                      </>
                    )}
                    {!supportsWithdraw && (
                      <p className="text-[11px] text-gray-400 font-medium">
                        এই মেথডে উইথড্র সুবিধা নেই
                      </p>
                    )}
                  </div>

                  {/* Quick Info Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold">
                      <ClockIcon className="w-3 h-3" />
                      {g.processingTime || "5-15 Minutes"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      <BanknotesIcon className="w-3 h-3" />
                      {Number(g.minAmount) || 10} - {Number(g.maxAmount) || 50000}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-bold">
                      ফি: {g.fee || "0%"}
                    </span>
                  </div>

                  {/* Support Badges */}
                  <div className="flex items-center gap-2 pt-1">
                    {g.isDepositSupported !== false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                        <ArrowDownTrayIcon className="w-3 h-3" />
                        টপ-আপ
                      </span>
                    )}
                    {supportsWithdraw && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                        <ArrowUpTrayIcon className="w-3 h-3" />
                        উইথড্র
                      </span>
                    )}
                    {(g.qrCode || "") && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                        <QrCodeIcon className="w-3 h-3" />
                        QR
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ✏️ Edit / Add My Account Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GatewayLogo name={editing.name} icon={editing.icon} className="w-10 h-10" />
                  <div>
                    <h3 className="text-sm font-black text-[#0b0c2a]">
                      {editing.name} - আমার অ্যাকাউন্ট
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      উইথড্রয়াল পেতে এই অ্যাকাউন্টে টাকা যাবে
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">
                    আপনার {editing.name} একাউন্ট নম্বর
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                  />
                </div>
                <p className="text-[11px] text-gray-400 flex items-start gap-1.5">
                  <InformationCircleIcon className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <span>
                    উইথড্রয়ালের সময় এই অ্যাকাউন্ট নম্বরে টাকা যাবে। নিশ্চিত করুন নম্বরটি সঠিক, কারণ ভুল নম্বরে পাঠানো টাকা ফেরত পাওয়া যাবে না।
                  </span>
                </p>
              </div>

              <div className="p-5 pt-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-teal-500/25 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;