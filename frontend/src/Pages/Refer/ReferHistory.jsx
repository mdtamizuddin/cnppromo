import React, { useState, useMemo } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import Loader from "../../Components/Loader";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export function TableWithStripedRows() {
  const { user } = useSelector((state) => state.user);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const res = await api.get(`/refer/user/${user?._id}`);
      return res.data;
    },
    queryKey: ["all-refer-all", user?._id],
    enabled: !!user?._id,
  });

  const referList = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    if (!search.trim()) return referList;
    const q = search.toLowerCase();
    return referList.filter(
      (item) =>
        item.reffer?.name?.toLowerCase().includes(q) ||
        item.user?.email?.toLowerCase().includes(q) ||
        item.user?.phone?.toLowerCase().includes(q)
    );
  }, [referList, search]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
      {/* Search and Table Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রেফারেল মেম্বার খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
          />
        </div>

        <div className="text-xs font-semibold text-gray-500">
          মোট জয়েনিং: <span className="text-primary font-black">{referList.length}</span> জন
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 rounded-l-xl">তারিখ ও সময়</th>
              <th className="py-3.5 px-4">মেম্বারের নাম</th>
              <th className="py-3.5 px-4">ইমেইল</th>
              <th className="py-3.5 px-4">ফোন / WhatsApp</th>
              <th className="py-3.5 px-4">কমিশন (৳)</th>
              <th className="py-3.5 px-4 rounded-r-xl">জেনারেশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UserGroupIcon className="w-10 h-10 text-gray-300" />
                    <p className="font-semibold text-gray-500">এখনো কোনো রেফারেল রেকর্ড পাওয়া যায়নি</p>
                    <p className="text-[11px] text-gray-400">
                      আপনার রেফারেল লিংক শেয়ার করে বন্ধুদের ইনভাইট করুন।
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map(({ user: referredUser, reffer, commition, gen, createdAt }, index) => (
                <tr key={index} className="hover:bg-purple-50/30 transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-4 font-medium text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                      {moment(createdAt).format("DD MMM, YYYY")}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 font-bold text-[#0b0c2a]">
                    <span className="flex items-center gap-1.5">
                      <span>{referredUser?.name || referredUser?.username || "Member"}</span>
                      <CheckBadgeIcon className="w-3.5 h-3.5 text-primary" />
                    </span>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                    {referredUser?.email || "N/A"}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-gray-600">
                    {referredUser?.phone ? (
                      <a
                        href={`https://wa.me/${referredUser?.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#25D366] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>{referredUser?.phone}</span>
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  {/* Commission */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-black text-xs">
                      +৳{commition}
                    </span>
                  </td>

                  {/* Generation */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-light text-primary font-bold text-[11px] border border-teal-100">
                      Gen {gen || 1}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const ReferHistory = () => {
  return <TableWithStripedRows />;
};

export default ReferHistory;