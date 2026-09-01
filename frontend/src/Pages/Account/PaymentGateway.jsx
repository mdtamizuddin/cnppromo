import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const { data: gateways = [], isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="bg-[#f8faff] min-h-screen pt-10">
        <Loader />
      </div>
    );
  }

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
                টপ-আপ ও উইথড্রয়ালের জন্য অ্যাকাউন্ট নম্বর ও নিয়মাবলি
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
                <ShieldCheckIcon className="w-3 h-3" /> নিরাপদ
              </p>
              <p className="text-xl font-black text-amber-300 mt-0.5">100%</p>
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
              const isSelected = selected?._id === g._id;
              return (
                <div
                  key={g._id}
                  onClick={() => setSelected(isSelected ? null : g)}
                  className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-100"
                  }`}
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

                  {/* Account Number */}
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {g.accountName || "Account"}
                      </span>
                      <CopyButton value={g.accountNumber || ""} />
                    </div>
                    <p className="text-sm font-black font-mono text-[#0b0c2a] tracking-wide">
                      {g.accountNumber || "—"}
                    </p>
                    {g.branchName && (
                      <p className="text-[10px] text-gray-400">
                        শাখা: {g.branchName}
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
                    {g.isWithdrawSupported !== false && (
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

        {/* 🔎 Selected Gateway Detail Panel */}
        {selected && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GatewayLogo name={selected.name} icon={selected.icon} className="w-12 h-12" />
                <div>
                  <h3 className="text-base font-black text-[#0b0c2a]">
                    {selected.name}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {selected.subName || "Payment Method"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[11px] font-bold text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                বন্ধ করুন ✕
              </button>
            </div>

            {/* Account Info */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  অ্যাকাউন্ট নম্বর
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-black font-mono text-[#0b0c2a] tracking-wide">
                    {selected.accountNumber}
                  </p>
                  <CopyButton value={selected.accountNumber || ""} />
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  {selected.accountName || "Account"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {selected.accountType} {selected.accountType === "Agent" ? "এজেন্ট" : ""}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  লিমিট ও ফি
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-700">
                  <span>ন্যূনতম: ৳{Number(selected.minAmount) || 10}</span>
                  <span>সর্বোচ্চ: ৳{Number(selected.maxAmount) || 50000}</span>
                  <span>দৈনিক: ৳{Number(selected.dailyLimit) || 200000}</span>
                  <span>ফি: {selected.fee || "0%"}</span>
                </div>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                  <ClockIcon className="w-3 h-3" />
                  প্রসেসিং: {selected.processingTime || "5-15 Minutes"}
                </p>
              </div>
            </div>

            {/* QR Code */}
            {selected.qrCode && (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-4">
                <img
                  src={selected.qrCode}
                  alt={`${selected.name} QR`}
                  className="w-24 h-24 rounded-xl object-contain bg-white border border-gray-200 shadow-sm"
                />
                <div>
                  <p className="text-xs font-bold text-[#0b0c2a] flex items-center gap-1">
                    <QrCodeIcon className="w-4 h-4 text-primary" />
                    QR কোড
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    বিকাশ/নগদ অ্যাপ দিয়ে QR স্ক্যান করে সরাসরি টাকা পাঠাতে পারবেন।
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {selected.instructions && (
              <div className="rounded-2xl bg-teal-50/60 border border-teal-100 p-4">
                <p className="text-xs font-bold text-[#0b0c2a] flex items-center gap-1.5 mb-2">
                  <InformationCircleIcon className="w-4 h-4 text-teal-600" />
                  নির্দেশনা
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {selected.instructions}
                </p>
              </div>
            )}

            {/* Notice */}
            {selected.notice && (
              <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-4 flex items-start gap-2.5">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {selected.notice}
                </p>
              </div>
            )}

            {/* CTA Links */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {selected.isDepositSupported !== false && (
                <a
                  href="/user/account"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-teal-500/25 transition-all text-center cursor-pointer"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  এই মেথডে টপ-আপ করুন
                </a>
              )}
              {selected.isWithdrawSupported !== false && (
                <a
                  href="/user/account/withdraw"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#d9176c] via-[#b81da8] to-[#6d25d9] text-white text-xs font-bold shadow-md shadow-pink-500/25 transition-all text-center cursor-pointer"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  এই মেথডে উইথড্র করুন
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;