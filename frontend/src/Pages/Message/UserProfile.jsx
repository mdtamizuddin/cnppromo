import React, { useState } from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import toast from "react-hot-toast";
import moment from "moment";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  IdentificationIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  GlobeAltIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

const UserProfile = ({ uid, onClose }) => {
  const [copiedField, setCopiedField] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", uid],
    queryFn: async () => {
      const res = await api.get(`/user/${uid}`);
      return res.data;
    },
    enabled: !!uid,
  });

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium tracking-wide">Loading user profile...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm">
        User profile not found.
      </div>
    );
  }

  const initial = data?.name?.trim()?.slice(0, 1)?.toUpperCase() || "?";
  const isActive = data?.active;
  const isAccountActive = data?.status === "active";

  return (
    <div className="relative -m-6 p-6 bg-white rounded-3xl">
      {/* Top Banner / Avatar Header */}
      <div className="relative flex flex-col items-center text-center pb-5 border-b border-gray-100">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-soft to-brand/10 border-2 border-brand/20 flex items-center justify-center text-brand font-black text-2xl shadow-sm">
            {initial}
          </div>
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
              isActive ? "bg-green-500 shadow-sm" : "bg-gray-300"
            }`}
            title={isActive ? "Online" : "Offline"}
          >
            {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </span>
        </div>

        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
          {data?.name || "Unnamed User"}
        </h3>
        <p className="text-xs font-semibold text-gray-400 mt-0.5">@{data?.username || "no-username"}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
              isAccountActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {data?.status || "inactive"}
          </span>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-brand-soft text-brand border border-brand/20">
            {data?.role || "user"}
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
              isActive
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "● Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Balance Highlight Card */}
      <div className="my-4 p-3.5 bg-gradient-to-r from-gray-50 to-brand-soft/40 border border-gray-100 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-brand">
            <BanknotesIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Balance</p>
            <p className="text-base font-black text-gray-900">৳ {Number(data?.balance || 0).toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(data?.balance || "0", "Balance")}
          className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-white transition-colors"
          title="Copy balance"
        >
          {copiedField === "Balance" ? <CheckIcon className="w-4 h-4 text-green-600" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[38vh] overflow-y-auto pr-1">
        <InfoItem
          icon={IdentificationIcon}
          label="Account ID"
          value={data?._id}
          isCopied={copiedField === "Account ID"}
          onCopy={() => copyToClipboard(data?._id, "Account ID")}
        />

        <InfoItem
          icon={EnvelopeIcon}
          label="Email Address"
          value={data?.email}
          isCopied={copiedField === "Email Address"}
          onCopy={() => copyToClipboard(data?.email, "Email Address")}
        />

        <InfoItem
          icon={PhoneIcon}
          label="Phone Number"
          value={data?.phone || "Not provided"}
          isCopied={copiedField === "Phone Number"}
          onCopy={data?.phone ? () => copyToClipboard(data?.phone, "Phone Number") : null}
        />

        <InfoItem
          icon={UserIcon}
          label="Gender"
          value={data?.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "Not specified"}
        />

        {data?.fb && (
          <InfoItem
            icon={GlobeAltIcon}
            label="Facebook Profile"
            value={data?.fb}
            isCopied={copiedField === "Facebook"}
            onCopy={() => copyToClipboard(data?.fb, "Facebook")}
          />
        )}

        <InfoItem
          icon={CalendarDaysIcon}
          label="Member Since"
          value={data?.createdAt ? moment(data.createdAt).format("DD MMM YYYY, h:mm A") : "—"}
        />

        <InfoItem
          icon={ClockIcon}
          label="Last Activity"
          value={data?.updatedAt ? moment(data.updatedAt).fromNow() : "—"}
        />
      </div>

      {/* Referrer Details */}
      {data?.reffer && (
        <div className="mt-4 pt-3.5 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <UserPlusIcon className="w-4 h-4 text-brand" />
            <p className="text-xs font-bold text-gray-700 tracking-tight">Referred By</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{data?.reffer?.name || "Unknown"}</p>
              <p className="text-xs text-gray-500 truncate">
                @{data?.reffer?.username} • {data?.reffer?.email}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(data?.reffer?.email || data?.reffer?.username, "Referrer details")}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-white transition-colors shrink-0"
              title="Copy referrer info"
            >
              {copiedField === "Referrer details" ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

const InfoItem = ({ icon: Icon, label, value, onCopy, isCopied }) => {
  return (
    <div className="group p-2.5 bg-gray-50/70 hover:bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
          <p className="text-xs font-semibold text-gray-800 truncate" title={typeof value === "string" ? value : ""}>
            {value || "—"}
          </p>
        </div>
      </div>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-gray-400 hover:text-brand hover:bg-white transition-all shrink-0 ml-1.5"
          title={`Copy ${label}`}
        >
          {isCopied ? <CheckIcon className="w-3.5 h-3.5 text-green-600" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
};

