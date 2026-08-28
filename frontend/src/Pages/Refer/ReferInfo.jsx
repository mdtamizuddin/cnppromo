import React from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { useQuery } from "react-query";
import Loader from "../../Components/Loader";
import { api } from "../../util/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  SparklesIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export function TableWithStripedRows() {
  const { settings, user } = useSelector((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ["statistics", user?._id],
    queryFn: async () => {
      const res = await api.get("/refer/statistic");
      return res.data;
    },
    enabled: !!user?._id,
  });

  if (isLoading) {
    return <Loader />;
  }

  const generations = [
    {
      name: "১ম জেনারেশন (Direct)",
      rate: settings?.ref_comm?.gen1 || 0,
      count: data?.gen1 || 0,
      totalEarned: (data?.gen1 || 0) * (settings?.ref_comm?.gen1 || 0),
      color: "from-purple-500 to-indigo-600",
      badge: "bg-purple-50 text-[#5a32fa] border-purple-100",
    },
    {
      name: "২য় জেনারেশন",
      rate: settings?.ref_comm?.gen2 || 0,
      count: data?.gen2 || 0,
      totalEarned: (data?.gen2 || 0) * (settings?.ref_comm?.gen2 || 0),
      color: "from-blue-500 to-cyan-600",
      badge: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      name: "৩য় জেনারেশন",
      rate: settings?.ref_comm?.gen3 || 0,
      count: data?.gen3 || 0,
      totalEarned: (data?.gen3 || 0) * (settings?.ref_comm?.gen3 || 0),
      color: "from-emerald-500 to-teal-600",
      badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      name: "৪র্থ জেনারেশন",
      rate: settings?.ref_comm?.gen4 || 0,
      count: data?.gen4 || 0,
      totalEarned: (data?.gen4 || 0) * (settings?.ref_comm?.gen4 || 0),
      color: "from-amber-500 to-orange-600",
      badge: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      name: "৫ম জেনারেশন",
      rate: settings?.ref_comm?.gen5 || 0,
      count: data?.gen5 || 0,
      totalEarned: (data?.gen5 || 0) * (settings?.ref_comm?.gen5 || 0),
      color: "from-rose-500 to-pink-600",
      badge: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      name: "৬ষ্ঠ জেনারেশন",
      rate: settings?.ref_comm?.gen6 || 0,
      count: data?.gen6 || 0,
      totalEarned: (data?.gen6 || 0) * (settings?.ref_comm?.gen6 || 0),
      color: "from-indigo-500 to-purple-700",
      badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  const totalMembers = generations.reduce((acc, curr) => acc + curr.count, 0);
  const grandTotalEarned = generations.reduce((acc, curr) => acc + curr.totalEarned, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 font-medium">মোট টিম মেম্বার</p>
            <p className="text-2xl font-black text-[#0b0c2a]">{totalMembers} জন</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5a32fa] flex items-center justify-center text-xl">
            👥
          </div>
        </Card>

        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 font-medium">মোট রেফারেল আয়</p>
            <p className="text-2xl font-black text-emerald-600">৳{grandTotalEarned}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            💰
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">জেনারেশন লেভেল</th>
                <th className="py-3.5 px-4">প্রতি রেফারেলে কমিশন</th>
                <th className="py-3.5 px-4">মোট মেম্বার</th>
                <th className="py-3.5 px-4 rounded-r-xl">মোট অর্জিত আয় (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {generations.map((row, index) => (
                <tr key={index} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#0b0c2a]">
                    <span className={`px-3 py-1 rounded-full border text-[11px] ${row.badge}`}>
                      {row.name}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-[#0b0c2a]">
                    ৳{row.rate}
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-700">
                    {row.count} জন
                  </td>
                  <td className="py-4 px-4 font-black text-emerald-600 text-sm">
                    ৳{row.totalEarned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const ReferInfo = () => {
  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/user/refer">
            <Button
              variant="outlined"
              size="sm"
              className="rounded-xl border-gray-200 bg-white text-gray-800 normal-case text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-4 h-4 text-[#5a32fa]" />
              <span>ব্যাক টু রেফারেল হাব</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] text-white shadow-xl border border-indigo-900/30">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
              <ChartBarIcon className="w-3.5 h-3.5" />
              <span>রেফারেল পরিসংখ্যান</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              ৬-জেনারেশন রেফারেল ব্যালেন্স ও টিম বিশ্লেষণ
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-lg">
              আপনার প্রতিটি জেনারেশনের মেম্বার সংখ্যা ও তাদের থেকে অর্জিত কমিশন দেখুন।
            </p>
          </div>
        </div>

        <TableWithStripedRows />
      </div>
    </div>
  );
};

export default ReferInfo;
