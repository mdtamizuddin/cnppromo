import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Chip, Spinner } from '@material-tailwind/react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { api } from '../../../../util/axios';
import moment from 'moment';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PremiumUserDetailsModal from './PremiumUserDetailsModal';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <Card className="flex flex-col p-4 sm:p-5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-2xl bg-white hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
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

const PremiumUsersTable = ({ status = "pending", title = "Users", subtitle = "Manage users in the system." }) => {
  const [option, setOption] = useState({ limit: 50 });
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied!`);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    setSearch(e.target.search.value);
  };

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["Premium Users Table", status, option.limit, search, dateRange],
    async ({ pageParam = null }) => {
      let url = `/user?limit=${option.limit}&reverse=true&status=${status}`;
      if (search) url += `&search=${search}`;
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
  const filteredCount = data?.pages[0]?.total || 0;

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="Filtered Results" 
          value={filteredCount} 
          icon={UsersIcon} 
          colorClass="text-orange-500" 
          bgClass="bg-orange-50" 
        />
        <StatCard 
          title={status === 'pending' ? "Today Added" : "Today Activated"} 
          value={todayAdded} 
          icon={UserPlusIcon} 
          colorClass="text-green-500" 
          bgClass="bg-green-50" 
        />
        <StatCard 
          title={status === 'pending' ? "Total Pending" : "Total Active"} 
          value={status === 'pending' ? totalPending : totalActive} 
          icon={CalendarDaysIcon} 
          colorClass="text-blue-500" 
          bgClass="bg-blue-50" 
        />
        <StatCard 
          title="Total Users (All)" 
          value={grandTotal + totalPending}
          icon={CalendarDaysIcon} 
          colorClass="text-purple-500" 
          bgClass="bg-purple-50" 
        />
      </div>

      <Card className="w-full shadow-sm border border-gray-200 overflow-hidden rounded-xl">
        {/* Table Filters Header */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 bg-white">
          <form onSubmit={searchHandler} className="w-full md:w-80 relative">
            <Input
              name="search"
              placeholder="Search by name, email or ID..."
              className="!border !border-gray-200 bg-gray-50 text-gray-900 shadow-none ring-0 placeholder:text-gray-400 focus:!border-blue-500 focus:bg-white transition-colors"
              labelProps={{
                className: "hidden",
              }}
              icon={<button type="submit"><MagnifyingGlassIcon className="h-4 w-4 text-gray-400" /></button>}
            />
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-left whitespace-nowrap">
            <thead>
              <tr>
                {["User", "Contact Info", "Balance", "Referer", status === "active" ? "Activated" : "Joined", "Action"].map((head) => (
                  <th key={head} className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && allUsers.length === 0 ? (
                <tr><td colSpan="8" className="text-center p-12 text-gray-400 font-medium">Loading users...</td></tr>
              ) : allUsers.length === 0 ? (
                <tr><td colSpan="8" className="text-center p-12 text-gray-400 font-medium">No users found</td></tr>
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
                            {user.username}
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">৳ {user.balance}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.reffer ? user.reffer.name : "Direct"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">
                          {status === "active" 
                            ? moment(user.activatedAt || user.createdAt).format("MMM DD, YYYY")
                            : moment(user.createdAt).format("MMM DD, YYYY")}
                        </span>
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
      />
    </div>
  );
};

export default PremiumUsersTable;
