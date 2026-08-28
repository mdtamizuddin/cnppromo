import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { Card, Button } from "@material-tailwind/react";
import {
  BanknotesIcon,
  WalletIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  GiftIcon,
  ArrowRightIcon,
  SparklesIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { api } from "../../util/axios";
import Loader from "../../Components/Loader";

const Earnings = () => {
  const { user } = useSelector((state) => state.user);

  // 1. Fetch Referral statistics
  const { data: stats } = useQuery({
    queryKey: ["earnings-stats", user?._id],
    queryFn: async () => {
      const res = await api.get("/refer/statistic");
      return res.data;
    },
    enabled: !!user?._id,
  });

  // 2. Fetch User's Referral Transactions
  const { data: referHistory, isLoading: isReferLoading } = useQuery({
    queryKey: ["earnings-refer-history", user?._id],
    queryFn: async () => {
      const res = await api.get(`/refer/user/${user?._id}`);
      return res.data;
    },
    enabled: !!user?._id,
  });

  const directRefers = stats?.gen1 || 0;
  const referralEarnings = directRefers * (user?.level === 3 ? 40 : user?.level === 2 ? 35 : 30);
  const walletBalance = user?.balance || 0;

  if (isReferLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        
        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#171a4f] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold tracking-wide">
                <BanknotesIcon className="w-3.5 h-3.5" />
                <span>My Income & Earnings Analytics</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                আপনার অর্জিত আয় ও <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  আর্নিং হিস্ট্রি বিবরণী 💰
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                আপনার রেফারেল কমিশন, ভিডিও টাস্ক ও ডেইলি রিওয়ার্ডের রিয়েল-টাইম আর্নিং বিস্তারিত দেখে নিন এবং সহজেই ব্যালেন্স উত্তোলন করুন।
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/account/withdraw">
                  <Button className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4" />
                    <span>উইথড্র করুন</span>
                  </Button>
                </Link>

                <Link to="/social-works">
                  <Button
                    variant="outlined"
                    className="border-white/30 text-white hover:bg-white/10 normal-case text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <SparklesIcon className="w-4 h-4 text-amber-300" />
                    <span>নতুন কাজ করুন</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right 3D Wallet Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-44 sm:w-52 aspect-square">
                <img
                  src="/earnings_hero_illustration.jpg"
                  alt="Earnings Wallet"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 📊 4 Live Income Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Available Wallet Balance */}
          <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">বর্তমান ওয়ালেট ব্যালেন্স</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5a32fa] flex items-center justify-center">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-[#0b0c2a]">৳ {walletBalance}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <span>✓ উইথড্রর জন্য প্রস্তুত</span>
              </p>
            </div>
            <Link to="/account/withdraw" className="block pt-1">
              <span className="text-[11px] font-bold text-[#5a32fa] hover:underline flex items-center gap-1">
                উইথড্র করতে যান &rarr;
              </span>
            </Link>
          </Card>

          {/* Card 2: Referral Commission */}
          <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">রেফারেল কমিশন আয়</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">৳ {referralEarnings}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {directRefers} জন সফল রেফারেল
              </p>
            </div>
            <Link to="/refer" className="block pt-1">
              <span className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                রেফারেল টিম দেখুন &rarr;
              </span>
            </Link>
          </Card>

          {/* Card 3: Tasks Income */}
          <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">টাস্ক ও ভিডিও আয়</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-[#0b0c2a]">৳ {user?.taskEarnings || 0}</p>
              <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                প্রতিদিন নতুন টাস্ক যুক্ত হয়
              </p>
            </div>
            <Link to="/social-works" className="block pt-1">
              <span className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                কাজ করতে যান &rarr;
              </span>
            </Link>
          </Card>

          {/* Card 4: VIP Level Bonus */}
          <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">ভিআইপি লেভেল বোনাস</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <GiftIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-600">Level {user?.level || 1}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {user?.level === 3 ? "৳৪০/রেফার" : user?.level === 2 ? "৳৩৫/রেফার" : "৳৩০/রেফার"}
              </p>
            </div>
            <Link to="/level" className="block pt-1">
              <span className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1">
                লেভেল আপগ্রেড &rarr;
              </span>
            </Link>
          </Card>

        </div>

        {/* 📜 Earnings Transaction History Table */}
        <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0b0c2a] flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-[#5a32fa]" />
                <span>সাম্প্রতিক রেফারেল আর্নিং হিস্ট্রি</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                আপনার রেফারেলদের থেকে অর্জিত বোনাস ও পেমেন্ট রেকর্ড
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/refer">
                <Button size="sm" className="bg-purple-50 text-[#5a32fa] hover:bg-purple-100 normal-case font-bold text-xs rounded-xl shadow-none">
                  রেফারেল সেন্টার
                </Button>
              </Link>
            </div>
          </div>

          {/* Table */}
          {referHistory && referHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">মেম্বার নাম</th>
                    <th className="py-3 px-4">তারিখ ও সময়</th>
                    <th className="py-3 px-4">জেনারেশন লেভেল</th>
                    <th className="py-3 px-4 text-right">আয়ের পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                  {referHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#0b0c2a] flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5a32fa] font-black flex items-center justify-center text-xs">
                          {item?.user?.name?.[0]?.toUpperCase() || "M"}
                        </div>
                        <div>
                          <p>{item?.user?.name || "Member"}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{item?.user?.email}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-500 font-mono">
                        {dayjs(item?.createdAt).format("DD MMM, YYYY hh:mm A")}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-[#5a32fa] border border-purple-100">
                          Gen {item?.gen || 1}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-emerald-600 font-mono text-sm">
                        + ৳{item?.amount || (item?.gen === 1 ? 30 : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-[#5a32fa] flex items-center justify-center text-2xl mx-auto shadow-inner">
                👥
              </div>
              <h4 className="text-sm font-bold text-gray-800">কোন রেফারেল আয় রেকর্ড নেই</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                আপনার রেফারেল লিংক বন্ধুদের সাথে শেয়ার করে আজই প্রতি রেফারে ৩০ টাকা পর্যন্ত আয় শুরু করুন।
              </p>
              <Link to="/refer">
                <Button className="bg-[#5a32fa] text-white font-bold text-xs rounded-xl px-5 py-2.5 mt-2 normal-case shadow-md shadow-indigo-500/20">
                  রেফারেল শুরু করুন &rarr;
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* 💡 Tips & Boost Earning Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
              ⚡
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#0b0c2a]">
                প্রতিদিন আরও বেশি আয় করতে চান?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
                সোশ্যাল টাস্ক পূরণ করুন, ভিডিও দেখুন এবং মেম্বারদের ইনভাইট করে নিজের আর্নিং দ্বিগুণ করুন।
              </p>
            </div>
          </div>

          <Link to="/works" className="w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto bg-[#5a32fa] hover:bg-[#4b26e0] text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
              <span>টাস্ক গ্যালারি দেখুন</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Earnings;
