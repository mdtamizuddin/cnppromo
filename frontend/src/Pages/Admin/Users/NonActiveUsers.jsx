import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Chip, Spinner } from '@material-tailwind/react';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { api } from '../../../util/axios';
import moment from 'moment';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  UsersIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Pagination from '../../Account/Pagination';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <Card className="flex flex-col p-4 sm:p-5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-2xl bg-white hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-gray-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110"></div>
    <div className="flex items-center justify-between relative z-10">
      <div className={`p-2.5 rounded-xl ${bgClass}`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />
      </div>
    </div>
    <div className="mt-3 sm:mt-4 relative z-10">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      <p className="text-[11px] sm:text-sm font-medium text-gray-500 mt-1 leading-tight">{title}</p>
    </div>
  </Card>
);

const UserDetailsCard = ({ user, onClose, refetch }) => {
  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-t-[2rem] md:rounded-3xl shadow-2xl border border-gray-200 z-50 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-10">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Left Profile Section */}
        <div className="flex flex-col items-center md:justify-center w-full md:w-1/3 md:border-r border-gray-100 pr-0 md:pr-6 relative">
          <div className="relative">
             <img
               src={user.avatar || "/default-avater.png"}
               alt={user.name}
               className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-md object-cover mb-3"
             />
             <span className="absolute bottom-4 right-1 md:bottom-5 md:right-2 w-4 h-4 rounded-full border-2 border-white bg-amber-500"></span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">#{user.username}</p>
          <div className="mt-4 md:mt-6 w-full px-4 md:px-0">
             <div className="w-full bg-amber-50 rounded-xl p-2.5 flex items-center justify-center gap-2 border border-amber-100/50">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-amber-700 tracking-wider">PENDING REVIEW</span>
             </div>
          </div>
        </div>

        {/* Right Details Section */}
        <div className="flex-1 flex flex-col justify-between mt-2 md:mt-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4 hidden md:block">User Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Referer ID</span>
                <span className="text-gray-900 font-medium flex items-center gap-2">
                  {user.reffer?.username || "Direct Signup"}
                  {user.reffer?.username && (
                    <DocumentDuplicateIcon 
                      className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
                      onClick={() => {
                        navigator.clipboard.writeText(user.reffer.username);
                        toast.success("Copied Referer ID");
                      }}
                    />
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Role</span>
                <span className="text-gray-900 font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Email</span>
                <span className="text-gray-900 font-medium truncate">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">WhatsApp</span>
                <span className="text-gray-900 font-medium">{user.phone}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Balance</span>
                <span className="text-gray-900 font-bold text-base">৳ {user.balance}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Joined Date</span>
                <span className="text-gray-900 font-medium">{moment(user.createdAt).format("MMM DD, YYYY")}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3 mt-6 pt-6 border-t border-gray-100 w-full">
            <Button variant="outlined" color="red" className="flex-1 flex justify-center items-center border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 normal-case px-4 py-2.5 rounded-xl transition-colors focus:ring-0">
              Reject
            </Button>
            <Button 
              className="flex-1 flex justify-center items-center bg-blue-600 text-white normal-case px-4 py-2.5 hover:bg-blue-700 shadow-none hover:shadow-lg hover:shadow-blue-500/20 rounded-xl transition-all focus:ring-0"
              onClick={async () => {
                 try {
                    await api.put(`/user/${user._id}`, { status: "active" });
                    toast.success("User is now active");
                    refetch();
                    onClose();
                 } catch (error) {
                    toast.error("Failed to activate user");
                 }
              }}
            >
              Approve User
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const NonActiveUsers = () => {
  const [option, setOption] = useState({ limit: 50 });
  const [search, setSearch] = useState("");
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
    ["Non-Active Users", option.limit, search],
    async ({ pageParam = null }) => {
      let url = `/user?limit=${option.limit}&reverse=true&status=pending`;
      if (search) url += `&search=${search}`;
      if (pageParam) url += `&cursor=${pageParam}`;
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

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage users waiting for account activation.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="Total Non-Active Users" 
          value={totalPending} 
          icon={UsersIcon} 
          colorClass="text-orange-500" 
          bgClass="bg-orange-50" 
        />
        <StatCard 
          title="Today Added" 
          value={todayAdded} 
          icon={UserPlusIcon} 
          colorClass="text-green-500" 
          bgClass="bg-green-50" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={totalPending} 
          icon={CalendarDaysIcon} 
          colorClass="text-blue-500" 
          bgClass="bg-blue-50" 
        />
        <StatCard 
          title="Total Users" 
          value={grandTotal} 
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

          <div className="w-full md:w-64">
            <Input
              type="date"
              className="!border !border-gray-300 bg-white text-gray-900 shadow-sm focus:!border-[#5a32fa]"
              labelProps={{ className: "hidden" }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-left whitespace-nowrap">
            <thead>
              <tr>
                {["User", "Contact Info", "Balance", "Referer", "Joined", "Action"].map((head) => (
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
                <tr><td colSpan="8" className="text-center p-12 text-gray-400 font-medium">No non-active users found</td></tr>
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
                        <span className="text-sm text-gray-700">{moment(user.createdAt).format("MMM DD, YYYY")}</span>
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
      <UserDetailsCard user={selectedUser} onClose={() => setSelectedUser(null)} refetch={refetch} />

    </div>
  );
};

export default NonActiveUsers;
