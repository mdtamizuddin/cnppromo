import React, { useState } from 'react';
import { Card, Input, Button, Chip } from '@material-tailwind/react';
import { useQuery } from 'react-query';
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
  <Card className="flex flex-row items-center p-5 shadow-sm border border-gray-100 h-28 gap-4">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bgClass}`}>
      <Icon className={`w-7 h-7 ${colorClass}`} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase">{title}</p>
      <h3 className="text-2xl font-black text-[#0b0c2a] mt-1">{value}</h3>
    </div>
  </Card>
);

const UserDetailsCard = ({ user, onClose, refetch }) => {
  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200 z-50 p-6 flex flex-col md:flex-row gap-8 animate-fade-in-up">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Left Profile Section */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3 border-r border-gray-100 pr-0 md:pr-8">
        <img
          src={user.avatar || "/default-avater.png"}
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover shadow-sm mb-4"
        />
        <h2 className="text-xl font-bold text-[#0b0c2a]">{user.name}</h2>
        <p className="text-sm text-gray-500 mt-1">ID: #{user.username}</p>
        <div className="mt-3">
          <Chip size="sm" value="PENDING" className="bg-amber-100 text-amber-800 font-bold px-4 rounded-full" />
        </div>
      </div>

      {/* Right Details Section */}
      <div className="flex-1 flex flex-col justify-between">
        <h3 className="text-lg font-bold text-[#0b0c2a] mb-4">User Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">Referer ID</span>
            <span className="text-gray-900 font-semibold flex items-center gap-2">
              : {user.reffer?.username || "N/A"}
              {user.reffer?.username && (
                <DocumentDuplicateIcon 
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[#5a32fa]" 
                  onClick={() => {
                    navigator.clipboard.writeText(user.reffer.username);
                    toast.success("Copied Referer ID");
                  }}
                />
              )}
            </span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">Change Role</span>
            <span className="text-gray-900 font-semibold">: {user.role}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">Name</span>
            <span className="text-gray-900 font-semibold">: {user.name}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">Email</span>
            <span className="text-gray-900 font-semibold">: {user.email}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">User Name</span>
            <span className="text-gray-900 font-semibold">: {user.username}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">WhatsApp</span>
            <span className="text-gray-900 font-semibold">: {user.phone}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">Balance</span>
            <span className="text-gray-900 font-semibold">: {user.balance}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium inline-block w-28">Joined Date</span>
            <span className="text-gray-900 font-semibold">: {moment(user.createdAt).format("MMM DD, YYYY hh:mm A")}</span>
          </div>
          <div className="flex justify-between sm:block col-span-2">
            <span className="text-gray-500 font-medium inline-block w-28">Status</span>
            <span className="text-gray-900 font-semibold">: Non-Active (Pending)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 justify-end">
          <Button variant="outlined" className="flex items-center gap-2 border-gray-300 text-gray-700 normal-case px-4 py-2 bg-gray-50 hover:bg-gray-100">
            <LockClosedIcon className="w-4 h-4" />
            Lock Account
          </Button>
          <Button className="flex items-center gap-2 bg-rose-500 text-white normal-case px-4 py-2 hover:bg-rose-600 shadow-none">
            <TrashIcon className="w-4 h-4" />
            Delete Account
          </Button>
          <Button 
            className="flex items-center gap-2 bg-emerald-500 text-white normal-case px-6 py-2 hover:bg-emerald-600 shadow-none"
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
            <CheckIcon className="w-4 h-4 stroke-[3]" />
            Make Active
          </Button>
        </div>
      </div>
    </div>
  );
};

const NonActiveUsers = () => {
  const [option, setOption] = useState({ page: 1, limit: 10 });
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const searchHandler = (e) => {
    e.preventDefault();
    setSearch(e.target.search.value);
  };

  const { data, isLoading, refetch } = useQuery(
    {
      queryKey: ["Non-Active Users", option, search],
      queryFn: async () => {
        const res = await api.get(`/user?page=${option.page}&limit=${option.limit}&reverse=true&${search && `search=${search}`}&status=pending`);
        return res.data;
      }
    }
  );

  return (
    <div className="w-full pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0b0c2a]">Non-Active Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage non-active users</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Non-Active Users" 
          value={data?.grandTotal || 0} 
          icon={UsersIcon} 
          colorClass="text-orange-500" 
          bgClass="bg-orange-50" 
        />
        <StatCard 
          title="Today Added" 
          value={data?.total || 42} 
          icon={UserPlusIcon} 
          colorClass="text-green-500" 
          bgClass="bg-green-50" 
        />
        <StatCard 
          title="This Week" 
          value="312" 
          icon={CalendarDaysIcon} 
          colorClass="text-blue-500" 
          bgClass="bg-blue-50" 
        />
        <StatCard 
          title="This Month" 
          value={data?.grandTotal || 0} 
          icon={CalendarDaysIcon} 
          colorClass="text-purple-500" 
          bgClass="bg-purple-50" 
        />
      </div>

      <Card className="w-full shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <form onSubmit={searchHandler} className="w-full md:w-96 relative">
            <Input
              name="search"
              placeholder="Search by name, email or ID..."
              className="!border !border-gray-300 bg-white text-gray-900 shadow-sm shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-[#5a32fa] focus:!border-t-[#5a32fa] focus:ring-indigo-500/20"
              labelProps={{
                className: "hidden",
              }}
              icon={<button type="submit"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></button>}
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
          <table className="w-full min-w-[900px] table-auto text-left whitespace-nowrap">
            <thead>
              <tr>
                {["#", "User Info", "Email", "WhatsApp", "Balance", "Referer", "Joined Date", "Action"].map((head) => (
                  <th key={head} className="border-b border-gray-100 bg-gray-50/50 p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="text-center p-8 text-gray-500">Loading users...</td></tr>
              ) : data?.users?.length === 0 ? (
                <tr><td colSpan="8" className="text-center p-8 text-gray-500">No non-active users found</td></tr>
              ) : (
                data?.users?.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="p-4 text-sm text-gray-900 font-bold">
                      {((option.page - 1) * option.limit) + index + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || "/default-avater.png"} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono">ID: #{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{user.email}</td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{user.phone}</td>
                    <td className="p-4 text-sm font-black text-gray-900">{user.balance}</td>
                    <td className="p-4 text-sm text-gray-700">{user.reffer ? user.reffer.name : "N/A"}</td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                      <p>{moment(user.createdAt).format("MMM DD, YYYY")}</p>
                      <p className="text-xs text-gray-500">{moment(user.createdAt).format("hh:mm A")}</p>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outlined"
                        className="flex items-center gap-2 border-[#5a32fa] text-[#5a32fa] px-3 py-1.5 normal-case text-xs focus:ring-0 rounded-lg hover:bg-[#5a32fa]/10 transition-colors"
                        onClick={() => setSelectedUser(user)}
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {data?.users?.length ? ((option.page - 1) * option.limit) + 1 : 0} to {Math.min(option.page * option.limit, data?.total || 0)} of {data?.total || 0} users
          </p>
          <div className="flex items-center gap-2">
            <Pagination setState={(e) => setOption({ ...option, page: e })} pages={data?.pages} active={option.page} />
          </div>
        </div>
      </Card>

      {/* Selected User Details Bottom Card */}
      <UserDetailsCard user={selectedUser} onClose={() => setSelectedUser(null)} refetch={refetch} />

    </div>
  );
};

export default NonActiveUsers;
