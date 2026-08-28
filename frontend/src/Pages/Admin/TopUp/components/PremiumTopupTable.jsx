import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Chip } from "@material-tailwind/react";
import { MagnifyingGlassIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import moment from "moment";
import { api } from "../../../../util/axios";
import logoProvider from "../../Users/_Ui/logoProvider";
import TopupActionModal from "./TopupActionModal";
import toast from "react-hot-toast";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <Card className="p-4 sm:p-5 flex flex-row items-center gap-4 shadow-sm border border-gray-100/60 hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white group">
    <div className={`p-3 sm:p-3.5 rounded-xl ${bgClass} transition-transform duration-300 group-hover:scale-110`}>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{value}</h3>
    </div>
  </Card>
);

const PremiumTopupTable = () => {
  const [option] = useState({ limit: 50 });
  const [textSearch, setTextSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [status, setStatus] = useState("pending"); // "pending", "completed", "rejected"
  const { ref, inView } = useInView();
  
  const [selectedTopup, setSelectedTopup] = useState(null);

  const searchHandler = (e) => {
    e.preventDefault();
    setTextSearch(e.target.search.value);
  };

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["Premium Topup Table", status, option.limit, textSearch, dateSearch],
    async ({ pageParam = 1 }) => {
      let url = `/topup?page=${pageParam}&limit=${option.limit}&reverse=true&status=${status}`;
      if (textSearch) url += `&textSearch=${textSearch}`;
      if (dateSearch) url += `&dateSearch=${dateSearch}`;
      const res = await api.get(url);
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
      },
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allTopups = data?.pages.flatMap((page) => page.data) || [];
  const totalAmount = data?.pages[0]?.totalWithdraw || 0; // The backend named it totalWithdraw even for topups!
  const filteredCount = data?.pages[0]?.total || 0;

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Topups</h1>
        <p className="text-sm text-gray-500 mt-1">Manage fund additions (Topup) requests from users.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="Filtered Results" 
          value={filteredCount} 
          icon={CurrencyDollarIcon} 
          colorClass="text-orange-500" 
          bgClass="bg-orange-50" 
        />
        <StatCard 
          title="Total Amount (৳)" 
          value={`৳${totalAmount.toLocaleString()}`} 
          icon={CurrencyDollarIcon} 
          colorClass="text-green-500" 
          bgClass="bg-green-50" 
        />
      </div>

      <Card className="w-full shadow-sm border border-gray-200 overflow-hidden rounded-xl">
        {/* Table Filters Header */}
        <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <form onSubmit={searchHandler} className="w-full sm:w-64 relative">
              <Input
                name="search"
                type="text"
                placeholder="Search by username, email, account, trx..."
                className="!border !border-gray-200 bg-gray-50 text-gray-900 shadow-none ring-0 placeholder:text-gray-400 focus:!border-blue-500 focus:bg-white transition-colors"
                labelProps={{ className: "hidden" }}
                icon={<button type="submit"><MagnifyingGlassIcon className="h-4 w-4 text-gray-400" /></button>}
              />
            </form>
            <Input
              type="date"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="!border !border-gray-200 bg-gray-50 text-gray-900 shadow-none ring-0 focus:!border-blue-500 focus:bg-white transition-colors w-full sm:w-auto"
              labelProps={{ className: "hidden" }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {["pending", "completed", "rejected"].map((tab) => (
              <Button
                key={tab}
                variant={status === tab ? "filled" : "text"}
                color={status === tab ? "blue" : "gray"}
                className={`normal-case rounded-lg ${status === tab ? "shadow-md shadow-blue-500/20" : "hover:bg-gray-50"}`}
                onClick={() => setStatus(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-left whitespace-nowrap">
            <thead>
              <tr>
                {["Date", "User", "Amount", "Method", "Status", "Action"].map((head) => (
                  <th key={head} className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allTopups.map((topup, index) => {
                const isLast = index === allTopups.length - 1;
                return (
                  <tr key={topup._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{moment(topup.createdAt).format("MMM DD, YYYY")}</span>
                        <span className="text-xs text-gray-500">{moment(topup.createdAt).format("hh:mm A")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={topup.user?.avatar || "/default-avater.png"} 
                          alt="avatar" 
                          className="w-9 h-9 rounded-full border border-gray-200 shadow-sm object-cover cursor-pointer hover:ring-2 ring-blue-200 transition-all"
                          onClick={() => setSelectedTopup(topup)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{topup.user?.name}</span>
                          <span className="text-xs text-gray-500 hover:text-blue-500 cursor-pointer transition-colors" onClick={() => {
                            navigator.clipboard.writeText(topup.user?.username);
                            toast.success("Copied username");
                          }}>
                            #{topup.user?.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-gray-900">৳ {topup.amount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={logoProvider(topup.method?.toLowerCase())} 
                          alt={topup.method} 
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex flex-col">
                           <span className="text-xs font-semibold text-gray-900" title="Transaction ID">{topup.trx}</span>
                           <span className="text-xs text-gray-500 hover:text-blue-500 cursor-pointer" onClick={() => {
                             navigator.clipboard.writeText(topup.account);
                             toast.success("Copied account number");
                           }}>{topup.account}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={topup.status}
                          color={topup.status === "completed" ? "green" : topup.status === "pending" ? "amber" : "red"}
                          className="capitalize"
                          icon={
                            topup.status === "completed" ? <CheckCircleIcon className="w-4 h-4" /> :
                            topup.status === "rejected" ? <XCircleIcon className="w-4 h-4" /> :
                            <ClockIcon className="w-4 h-4" />
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outlined"
                        color="blue"
                        className="py-1.5 px-3 normal-case shadow-none hover:shadow-md"
                        onClick={() => setSelectedTopup(topup)}
                      >
                        {topup.status === "pending" ? "Review" : "View"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Intersection Observer target for infinite scroll */}
              <tr ref={ref}>
                <td colSpan="6" className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500 font-medium animate-pulse">Loading more...</span>
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-sm text-gray-400">Scroll down for more</span>
                  ) : allTopups.length > 0 ? (
                    <span className="text-sm text-gray-400">You've reached the end</span>
                  ) : !isLoading && (
                    <div className="flex flex-col items-center justify-center py-10">
                      <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <span className="text-sm text-gray-500">No topups found matching your criteria.</span>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Modal */}
      {selectedTopup && (
        <TopupActionModal 
          topup={selectedTopup} 
          onClose={() => setSelectedTopup(null)} 
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default PremiumTopupTable;
