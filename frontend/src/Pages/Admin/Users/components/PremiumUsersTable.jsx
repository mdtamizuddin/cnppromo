import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Spinner } from '@material-tailwind/react';
import { useInfiniteQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { api } from '../../../../util/axios';
import moment from 'moment';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  NoSymbolIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import PremiumUserDetailsModal from './PremiumUserDetailsModal';
import { getAccountState } from '../../../../util/accountState';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, active = false, activeClass, onClick }) => (
  <Card 
    onClick={onClick}
    className={`flex flex-col p-4 sm:p-5 shadow-xs hover:shadow-md rounded-2xl bg-white hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group select-none ${
      onClick ? "cursor-pointer" : ""
    } ${
      active 
        ? `${activeClass || "ring-2 ring-blue-500 border-blue-400"}` 
        : "border border-gray-100 hover:border-gray-200"
    }`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-gray-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
    <div className="flex items-center justify-between relative z-10">
      <div className={`p-2.5 rounded-xl ${bgClass}`}>
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colorClass}`} />
      </div>
      <div className="flex flex-col items-end">
        <h4 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
        <span className="text-xs sm:text-sm font-medium text-gray-500 mt-1">{title}</span>
      </div>
    </div>
  </Card>
);

const PremiumUsersTable = ({
  status = "",
  lock = false,
  role = "user",
  deleted = false,
  title,
  subtitle,
  defaultStatus = "all",
}) => {
  const [option, setOption] = useState({ limit: 50 });
  const [searchParams, setSearchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim();
  const statusParam = searchParams.get("status");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const { user: currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.role === "admin";

  // Tab state for regular users view
  let activeTab = statusParam || defaultStatus || "all";
  if (!isAdmin && activeTab === "deleted") {
    activeTab = "all";
  }

  // Derive query filters based on role and activeTab
  let effectiveStatus = status;
  let effectiveLock = lock;
  let effectiveDeleted = deleted;
  let displayTitle = title;
  let displaySubtitle = subtitle;

  if (role === "user") {
    if (activeTab === "active") {
      effectiveStatus = "active";
      effectiveLock = false;
      effectiveDeleted = false;
      displayTitle = title || "Active Users";
      displaySubtitle = subtitle || "Manage all active and approved users in the system.";
    } else if (activeTab === "pending") {
      effectiveStatus = "pending";
      effectiveLock = false;
      effectiveDeleted = false;
      displayTitle = title || "Non-Active Users (Pending)";
      displaySubtitle = subtitle || "Review and manage users waiting for account activation.";
    } else if (activeTab === "banned") {
      effectiveStatus = "";
      effectiveLock = true;
      effectiveDeleted = false;
      displayTitle = title || "Banned Users";
      displaySubtitle = subtitle || "Manage all locked and restricted accounts in the system.";
    } else if (activeTab === "deleted") {
      effectiveStatus = "";
      effectiveLock = false;
      effectiveDeleted = true;
      displayTitle = title || "Deleted Users";
      displaySubtitle = subtitle || "Review deleted accounts, who removed them and why, and restore them if needed.";
    } else {
      // "all"
      effectiveStatus = "";
      effectiveLock = false;
      effectiveDeleted = false;
      displayTitle = title || "All Users";
      displaySubtitle = subtitle || "Unified overview and management of all registered users in the platform.";
    }
  } else {
    displayTitle = title || (role === "admin" ? "Admins" : "Moderators");
    displaySubtitle = subtitle || `Manage all ${role === "admin" ? "admins" : "moderators"} in the system.`;
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied!`);
  };

  const applySearch = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("search", value);
      else next.delete("search");
      return next;
    }, { replace: true });
  };

  const searchHandler = (e) => {
    e.preventDefault();
    applySearch(e.target.search.value.trim());
  };

  const handleTabChange = (tabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === "all") {
        next.delete("status");
      } else {
        next.set("status", tabId);
      }
      return next;
    }, { replace: true });
  };

  const dateHead = effectiveDeleted
    ? "Deleted"
    : effectiveStatus === "active"
    ? "Activated"
    : "Joined";

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["Premium Users Table", effectiveStatus, effectiveLock, role, effectiveDeleted, option.limit, search, dateRange],
    async ({ pageParam = null }) => {
      let url = `/user?limit=${option.limit}&reverse=true`;
      if (effectiveDeleted) url += `&deleted=true`;
      if (effectiveStatus && !effectiveDeleted) url += `&status=${effectiveStatus}`;
      if (effectiveLock && !effectiveDeleted) url += `&lock=true`;
      if (role === "user" && activeTab === "all") url += `&all=true`;
      if (role === "admin") url += `&admin=true`;
      if (role === "moderator") url += `&moderator=true`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (pageParam) url += `&cursor=${pageParam}`;
      if (dateRange.start) url += `&startDate=${dateRange.start}`;
      if (dateRange.end) url += `&endDate=${dateRange.end}`;
      const res = await api.get(url);
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allUsers = data?.pages.flatMap((page) => page.users) || [];
  const grandTotal = data?.pages[0]?.grandTotal || 0;
  const todayAdded = data?.pages[0]?.todayAdded || 0;
  const totalPending = data?.pages[0]?.pending || 0;
  const totalActive = data?.pages[0]?.active || 0;
  const totalBanned = data?.pages[0]?.banned || 0;
  const deletedTotal = data?.pages[0]?.deletedTotal || 0;
  const filteredCount = data?.pages[0]?.total || 0;

  const dateValue = (user) =>
    user.deletedAt
      ? user.deletedAt
      : effectiveStatus === "active"
      ? user.activatedAt || user.createdAt
      : user.createdAt;

  const statusTabs = [
    {
      id: "all",
      label: "All Users",
      count: grandTotal,
      icon: UsersIcon,
      activeBg: "bg-blue-600 text-white shadow-md shadow-blue-500/25",
    },
    {
      id: "active",
      label: "Active Users",
      count: totalActive,
      icon: CheckCircleIcon,
      activeBg: "bg-emerald-600 text-white shadow-md shadow-emerald-500/25",
    },
    {
      id: "pending",
      label: "Non-Active",
      count: totalPending,
      icon: ClockIcon,
      activeBg: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
    },
    {
      id: "banned",
      label: "Banned Users",
      count: totalBanned,
      icon: NoSymbolIcon,
      activeBg: "bg-rose-600 text-white shadow-md shadow-rose-500/25",
    },
    ...(isAdmin ? [{
      id: "deleted",
      label: "Deleted Users",
      count: deletedTotal,
      icon: TrashIcon,
      activeBg: "bg-gray-800 text-white shadow-md shadow-gray-700/25",
    }] : []),
  ];

  const renderStatusBadge = (user) => {
    const state = getAccountState(user);
    if (state === "deleted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-900 text-white shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Deleted
        </span>
      );
    }
    if (state === "banned") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Banned
        </span>
      );
    }
    if (state === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Active
        </span>
      );
    }
    if (state === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
        Inactive
      </span>
    );
  };

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">{displaySubtitle}</p>
      </div>

      {/* Stat Cards Grid */}
      {role === "user" ? (
        <div className={`grid gap-3 sm:gap-4 mb-6 ${isAdmin ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4"}`}>
          <StatCard 
            title="All Users" 
            value={grandTotal} 
            icon={UsersIcon} 
            colorClass="text-blue-600" 
            bgClass="bg-blue-50"
            active={activeTab === "all"}
            activeClass="ring-2 ring-blue-500 border-blue-400"
            onClick={() => handleTabChange("all")}
          />
          <StatCard 
            title="Active Users" 
            value={totalActive} 
            icon={CheckCircleIcon} 
            colorClass="text-emerald-600" 
            bgClass="bg-emerald-50"
            active={activeTab === "active"}
            activeClass="ring-2 ring-emerald-500 border-emerald-400"
            onClick={() => handleTabChange("active")}
          />
          <StatCard 
            title="Non-Active" 
            value={totalPending} 
            icon={ClockIcon} 
            colorClass="text-amber-500" 
            bgClass="bg-amber-50"
            active={activeTab === "pending"}
            activeClass="ring-2 ring-amber-500 border-amber-400"
            onClick={() => handleTabChange("pending")}
          />
          <StatCard 
            title="Banned Users" 
            value={totalBanned} 
            icon={NoSymbolIcon} 
            colorClass="text-rose-600" 
            bgClass="bg-rose-50"
            active={activeTab === "banned"}
            activeClass="ring-2 ring-rose-500 border-rose-400"
            onClick={() => handleTabChange("banned")}
          />
          {isAdmin && (
            <StatCard 
              title="Deleted Users" 
              value={deletedTotal} 
              icon={TrashIcon} 
              colorClass="text-gray-700" 
              bgClass="bg-gray-100"
              active={activeTab === "deleted"}
              activeClass="ring-2 ring-gray-800 border-gray-400"
              onClick={() => handleTabChange("deleted")}
            />
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-6 mb-6 sm:mb-8 grid-cols-2 lg:grid-cols-2">
          <StatCard 
            title="Filtered Results" 
            value={filteredCount} 
            icon={UsersIcon} 
            colorClass="text-orange-500" 
            bgClass="bg-orange-50" 
          />
          <StatCard 
            title={`Total ${role === 'admin' ? 'Admins' : 'Moderators'}`} 
            value={filteredCount}
            icon={UserPlusIcon} 
            colorClass="text-purple-500" 
            bgClass="bg-purple-50" 
          />
        </div>
      )}

      {/* Status Filter Tabs (For Users view) */}
      {role === "user" && (
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/70 overflow-x-auto max-w-full">
            {statusTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? tab.activeBg
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-white text-gray-700 shadow-2xs border border-gray-200/70"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {(search || dateRange.start || dateRange.end) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
              <span>Filtered: <strong className="text-gray-800">{filteredCount}</strong> results</span>
              <button
                type="button"
                onClick={() => {
                  applySearch("");
                  setDateRange({ start: "", end: "" });
                }}
                className="text-blue-600 hover:underline font-semibold ml-1"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      <Card className="w-full shadow-xs border border-gray-200 overflow-hidden rounded-2xl">
        {/* Table Filters Header */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 bg-white">
          <form onSubmit={searchHandler} className="w-full md:w-80 relative">
            <Input
              key={search}
              name="search"
              defaultValue={search}
              placeholder="Name, username, email, phone or ID..."
              className={`!border !border-gray-200 bg-gray-50 text-gray-900 shadow-none ring-0 placeholder:text-gray-400 focus:!border-blue-500 focus:bg-white transition-colors ${search ? "!pr-16" : ""}`}
              labelProps={{
                className: "hidden",
              }}
              icon={<button type="submit"><MagnifyingGlassIcon className="h-4 w-4 text-gray-400" /></button>}
            />
            {search && (
              <button
                type="button"
                onClick={() => applySearch("")}
                className="absolute top-1/2 -translate-y-1/2 right-10 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                title="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </form>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="!border !border-gray-200 bg-gray-50 text-gray-900 shadow-none ring-0 focus:!border-blue-500 focus:bg-white transition-colors"
              labelProps={{ className: "hidden" }}
            />
            <span className="text-gray-400 text-sm hidden md:block">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="!border !border-gray-200 bg-gray-50 text-gray-900 shadow-none ring-0 focus:!border-blue-500 focus:bg-white transition-colors"
              labelProps={{ className: "hidden" }}
            />
            {(dateRange.start || dateRange.end) && (
              <button 
                onClick={() => setDateRange({ start: "", end: "" })}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-1"
                title="Clear Dates"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 📱 Mobile View: User Cards */}
        <div className="divide-y divide-gray-100 md:hidden">
          {isLoading && allUsers.length === 0 ? (
            <div className="text-center p-8 text-gray-400 font-medium">Loading users...</div>
          ) : allUsers.length === 0 ? (
            <div className="text-center p-8 text-gray-400 font-medium">No users found</div>
          ) : (
            allUsers.map((user) => (
              <div key={user._id} className="p-3.5 space-y-2.5 hover:bg-blue-50/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatar || "/default-avater.png"}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold text-gray-900 truncate max-w-[130px] cursor-pointer hover:text-blue-600"
                          onClick={() => handleCopy(user.name, "Name")}
                        >
                          {user.name}
                        </span>
                        {role === "user" && renderStatusBadge(user)}
                      </div>
                      <span
                        className="text-[11px] text-gray-400 cursor-pointer hover:text-blue-600"
                        onClick={() => handleCopy(user.username, "Username")}
                      >
                        #{user.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100" title="Max Devices">
                      📱 {user.maxActiveSessions ?? 5}
                    </span>
                    <span className="text-xs font-bold text-gray-900 font-mono">
                      ৳ {user.balance}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50/70 p-2 rounded-lg border border-gray-100">
                  <div className="truncate">
                    <span className="text-gray-400 block text-[10px]">Email</span>
                    <span
                      className="text-gray-700 font-medium truncate block cursor-pointer hover:text-blue-600"
                      onClick={() => handleCopy(user.email, "Email")}
                    >
                      {user.email || "N/A"}
                    </span>
                  </div>
                  <div className="truncate">
                    <span className="text-gray-400 block text-[10px]">Phone</span>
                    <span
                      className="text-gray-700 font-medium truncate block cursor-pointer hover:text-blue-600"
                      onClick={() => handleCopy(user.phone, "Phone")}
                    >
                      {user.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100/60 text-[11px] text-gray-400">
                  <div className="flex flex-col text-[10px]">
                    {effectiveDeleted || user.deletedAt ? (
                      <span>By: <strong className="text-gray-600">{user.deletedBy ? user.deletedBy.name : "Unknown"}</strong></span>
                    ) : (
                      <span>Ref: <strong className="text-gray-600">{user.reffer ? user.reffer.name : "Direct"}</strong></span>
                    )}
                    <span>
                      {dateHead}: {moment(dateValue(user)).format("DD MMM YYYY")}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="blue"
                    className="py-1 px-3 normal-case text-xs shadow-none hover:shadow-md"
                    onClick={() => setSelectedUser(user)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🖥️ Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px] table-auto text-left whitespace-nowrap">
            <thead>
              <tr>
                {[
                  "User",
                  "Contact Info",
                  ...(role === "user" ? ["Status"] : []),
                  "Balance",
                  "Device Limit",
                  effectiveDeleted ? "Deleted By" : role === "user" && activeTab === "all" ? "Referrer / Deleted By" : "Referrer",
                  dateHead,
                  "Action"
                ].map((head) => (
                  <th key={head} className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && allUsers.length === 0 ? (
                <tr>
                  <td colSpan={role === "user" ? 8 : 7} className="text-center p-12 text-gray-400 font-medium">
                    Loading users...
                  </td>
                </tr>
              ) : allUsers.length === 0 ? (
                <tr>
                  <td colSpan={role === "user" ? 8 : 7} className="text-center p-12 text-gray-400 font-medium">
                    No users found
                  </td>
                </tr>
              ) : (
                allUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/80 hover:shadow-[0_2px_15px_-3px_rgba(6,81,237,0.08)] transition-all duration-300 relative z-0 hover:z-10 group border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || "/default-avater.png"} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 group-hover:ring-2 ring-blue-100 transition-all cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        />
                        <div className="flex flex-col items-start">
                          <span 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleCopy(user.name, "Name")}
                          >
                            {user.name}
                          </span>
                          <span 
                            className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleCopy(user.username, "Username")}
                          >
                            #{user.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start">
                        <span 
                          className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleCopy(user.email, "Email")}
                        >
                          {user.email}
                        </span>
                        <span 
                          className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleCopy(user.phone, "Phone")}
                        >
                          {user.phone}
                        </span>
                      </div>
                    </td>
                    {role === "user" && (
                      <td className="px-4 py-3">
                        {renderStatusBadge(user)}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">৳ {user.balance}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                        {user.maxActiveSessions ?? 5}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {effectiveDeleted || user.deletedAt ? (
                        <div className="flex flex-col">
                          <span>{user.deletedBy ? user.deletedBy.name : "Unknown"}</span>
                          <span className="text-xs text-gray-400 truncate max-w-[180px]" title={user.deleteReason}>
                            {user.deleteReason || "No reason"}
                          </span>
                        </div>
                      ) : (
                        user.reffer ? user.reffer.name : "Direct"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">
                          {moment(dateValue(user)).format("MMM DD, YYYY")}
                        </span>
                        {user.deletedAt ? (
                          <span className="text-[10px] text-rose-500 font-medium">
                            Deleted {moment(user.deletedAt).format("MMM DD, YYYY")}
                          </span>
                        ) : activeTab === "all" && user.status === "active" && user.activatedAt ? (
                          <span className="text-[10px] text-gray-400">
                            Joined {moment(user.createdAt).format("MMM DD, YYYY")}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="text"
                        color="blue"
                        className="px-3 py-1.5 normal-case text-xs focus:ring-0 rounded-md font-medium bg-blue-50/0 group-hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedUser(user)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Infinite Scroll Footer */}
        {allUsers.length > 0 && (
          <div ref={ref} className="p-6 flex flex-col items-center justify-center border-t border-gray-100 bg-white">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-3 text-blue-600">
                <Spinner className="h-5 w-5" />
                <span className="text-sm font-medium">Loading more...</span>
              </div>
            ) : hasNextPage ? (
              <span className="text-sm font-medium text-gray-400">Scroll down to load more</span>
            ) : (
              <span className="text-sm font-medium text-gray-400">You've reached the end</span>
            )}
          </div>
        )}
      </Card>

      {/* Selected User Details Bottom Card */}
      <PremiumUserDetailsModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
        refetch={refetch} 
        deleted={Boolean(effectiveDeleted || selectedUser?.deletedAt)}
      />
    </div>
  );
};

export default PremiumUsersTable;
