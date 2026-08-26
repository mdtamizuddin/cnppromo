import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  PhotoIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  PlayIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// Sample verified proofs matching CNP-PROMO's screenshot data
const initialProofs = [
  {
    id: 1,
    type: "screenshot",
    method: "bKash",
    amount: "5,250.00",
    rawAmount: 5250,
    recipient: "মো: রাকিবুল ইসলাম",
    date: "২৪ মে ২০২৬ • 10:45 AM",
    trxId: "8GJ3K8F6",
    status: "পেমেন্ট সফল",
    color: "#E2136E",
    bgColor: "from-pink-50 to-rose-50",
  },
  {
    id: 2,
    type: "screenshot",
    method: "Nagad",
    amount: "3,850.00",
    rawAmount: 3850,
    recipient: "সায়েম আহমেদ",
    date: "২৪ মে ২০২৬ • 09:15 AM",
    trxId: "28736273823",
    status: "পেমেন্ট সফল",
    color: "#F7941D",
    bgColor: "from-orange-50 to-amber-50",
  },
  {
    id: 3,
    type: "video",
    method: "Rocket",
    amount: "7,200.00",
    rawAmount: 7200,
    recipient: "আকতার জামান",
    date: "২৩ মে ২০২৬ • 08:30 PM",
    trxId: "2KBJ6H3L1",
    status: "পেমেন্ট সফল",
    duration: "0:08",
    color: "#8C3494",
    bgColor: "from-purple-900 to-indigo-950",
  },
  {
    id: 4,
    type: "screenshot",
    method: "bKash",
    amount: "4,100.00",
    rawAmount: 4100,
    recipient: "ইমরান হোসেন",
    date: "২৩ মে ২০২৬ • 07:40 PM",
    trxId: "4F7H9J2K1",
    status: "পেমেন্ট সফল",
    color: "#E2136E",
    bgColor: "from-pink-50 to-rose-50",
  },
  {
    id: 5,
    type: "video",
    method: "Rocket",
    amount: "2,750.00",
    rawAmount: 2750,
    recipient: "তানভির খান",
    date: "২২ মে ২০২৬ • 04:20 PM",
    trxId: "7K3L9M2P1",
    status: "পেমেন্ট সফল",
    duration: "0:06",
    color: "#8C3494",
    bgColor: "from-purple-900 to-indigo-950",
  },
  {
    id: 6,
    type: "screenshot",
    method: "Nagad",
    amount: "6,300.00",
    rawAmount: 6300,
    recipient: "লামিয়া ইসলাম",
    date: "২২ মে ২০২৬ • 02:10 PM",
    trxId: "9H2J7K8L3",
    status: "পেমেন্ট সফল",
    color: "#F7941D",
    bgColor: "from-orange-50 to-amber-50",
  },
  {
    id: 7,
    type: "screenshot",
    method: "bKash",
    amount: "9,450.00",
    rawAmount: 9450,
    recipient: "ফায়েজ চৌধুরী",
    date: "২১ মে ২০২৬ • 09:05 PM",
    trxId: "16GH8J9K0",
    status: "পেমেন্ট সফল",
    color: "#E2136E",
    bgColor: "from-pink-50 to-rose-50",
  },
  {
    id: 8,
    type: "video",
    method: "Nagad",
    amount: "5,600.00",
    rawAmount: 5600,
    recipient: "মেহেদী হাসান",
    date: "২১ মে ২০২৬ • 06:45 PM",
    trxId: "3L6KBJ7H2",
    status: "পেমেন্ট সফল",
    duration: "0:07",
    color: "#F7941D",
    bgColor: "from-slate-900 to-gray-900",
  },
  {
    id: 9,
    type: "screenshot",
    method: "bKash",
    amount: "3,200.00",
    rawAmount: 3200,
    recipient: "শামীম রেজা",
    date: "২০ মে ২০২৬ • 11:30 AM",
    trxId: "5B7N9M1K3",
    status: "পেমেন্ট সফল",
    color: "#E2136E",
    bgColor: "from-pink-50 to-rose-50",
  },
  {
    id: 10,
    type: "screenshot",
    method: "Rocket",
    amount: "8,150.00",
    rawAmount: 8150,
    recipient: "নুসরাত জাহান",
    date: "২০ মে ২০২৬ • 01:15 PM",
    trxId: "8K2L4P9Q5",
    status: "পেমেন্ট সফল",
    color: "#8C3494",
    bgColor: "from-purple-50 to-indigo-50",
  },
  {
    id: 11,
    type: "video",
    method: "bKash",
    amount: "11,500.00",
    rawAmount: 11500,
    recipient: "আরিফুল হক",
    date: "১৯ মে ২০২৬ • 05:50 PM",
    trxId: "1P8K3L9N4",
    status: "পেমেন্ট সফল",
    duration: "0:09",
    color: "#E2136E",
    bgColor: "from-pink-950 to-rose-950",
  },
  {
    id: 12,
    type: "screenshot",
    method: "Nagad",
    amount: "4,750.00",
    rawAmount: 4750,
    recipient: "তাসলিমা আক্তার",
    date: "১৯ মে ২০২৬ • 10:00 AM",
    trxId: "6J3M9N2L5",
    status: "পেমেন্ট সফল",
    color: "#F7941D",
    bgColor: "from-orange-50 to-amber-50",
  },
];

const PaymentProof = () => {
  const [filterType, setFilterType] = useState("all"); // 'all' | 'screenshot' | 'video'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'highest' | 'lowest'
  const [selectedProof, setSelectedProof] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Sort computation
  const filteredProofs = useMemo(() => {
    let result = [...initialProofs];

    if (filterType !== "all") {
      result = result.filter((item) => item.type === filterType);
    }

    if (sortBy === "highest") {
      result.sort((a, b) => b.rawAmount - a.rawAmount);
    } else if (sortBy === "lowest") {
      result.sort((a, b) => a.rawAmount - b.rawAmount);
    } else if (sortBy === "oldest") {
      result.sort((a, b) => a.id - b.id);
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [filterType, sortBy]);

  const totalPages = Math.ceil(filteredProofs.length / itemsPerPage) || 1;
  const paginatedProofs = filteredProofs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20">
      {/* 🌟 Top Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-indigo-50/60 bg-gradient-to-b from-white via-indigo-50/30 to-[#f8faff]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 text-purple-700 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                পেমেন্ট প্রুফ
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b0c2a] leading-tight tracking-tight">
                আমাদের{" "}
                <span className="bg-gradient-to-r from-[#5a32fa] to-[#050C9C] bg-clip-text text-transparent">
                  পেমেন্ট প্রুফসমূহ
                </span>
              </h1>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                আমরা আমাদের সকল সদস্যদের সাথে সম্পূর্ণ স্বচ্ছতার সাথে কাজ করি। নিচে দেখুন
                আমাদের কিছু সাম্প্রতিক পেমেন্ট প্রুফ। আপনি স্ক্রিনশট এবং ভিডিও প্রুফ দেখতে
                পারবেন।
              </p>
            </div>

            {/* Right Hero Graphic */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-64 sm:w-80 lg:w-96 aspect-square">
                {/* Ambient glow background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/30 to-blue-400/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <img
                  src="/payment_proof_hero.jpg"
                  alt="CNP-PROMO Payment Proofs"
                  className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-3xl"
                />
              </div>
            </div>

          </div>

          {/* 📊 Stats Bar (4 Metric Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            
            {/* Metric 1 */}
            <Card className="p-5 flex flex-row items-center gap-4 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <div>
                <Typography className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
                  7,734,598+
                </Typography>
                <Typography className="text-xs text-gray-500 font-medium">
                  মোট পেমেন্ট
                </Typography>
              </div>
            </Card>

            {/* Metric 2 */}
            <Card className="p-5 flex flex-row items-center gap-4 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ArrowTrendingUpIcon className="w-6 h-6" />
              </div>
              <div>
                <Typography className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
                  12,845+
                </Typography>
                <Typography className="text-xs text-gray-500 font-medium">
                  সফল উইথড্রল
                </Typography>
              </div>
            </Card>

            {/* Metric 3 */}
            <Card className="p-5 flex flex-row items-center gap-4 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <Typography className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
                  100%
                </Typography>
                <Typography className="text-xs text-gray-500 font-medium">
                  পেমেন্ট নিশ্চিত
                </Typography>
              </div>
            </Card>

            {/* Metric 4 */}
            <Card className="p-5 flex flex-row items-center gap-4 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <LockClosedIcon className="w-6 h-6" />
              </div>
              <div>
                <Typography className="text-lg sm:text-xl font-black text-[#0b0c2a] tracking-tight">
                  স্বচ্ছ ও নিরাপদ
                </Typography>
                <Typography className="text-xs text-gray-500 font-medium">
                  আমাদের প্রতিশ্রুতি
                </Typography>
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* 🎯 Filter and Proof Grid Section */}
      <section className="container mx-auto px-4 max-w-7xl mt-10">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm mb-8">
          
          {/* Left Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant={filterType === "all" ? "filled" : "text"}
              size="sm"
              onClick={() => {
                setFilterType("all");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 rounded-xl normal-case text-xs font-semibold px-4 py-2.5 ${
                filterType === "all"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-purple-500/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              সব প্রুফ দেখুন
            </Button>

            <Button
              variant={filterType === "screenshot" ? "filled" : "text"}
              size="sm"
              onClick={() => {
                setFilterType("screenshot");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 rounded-xl normal-case text-xs font-semibold px-4 py-2.5 ${
                filterType === "screenshot"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-purple-500/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <PhotoIcon className="w-4 h-4" />
              স্ক্রিনশট প্রুফ
            </Button>

            <Button
              variant={filterType === "video" ? "filled" : "text"}
              size="sm"
              onClick={() => {
                setFilterType("video");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 rounded-xl normal-case text-xs font-semibold px-4 py-2.5 ${
                filterType === "video"
                  ? "bg-[#5a32fa] text-white shadow-md shadow-purple-500/20"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <VideoCameraIcon className="w-4 h-4" />
              ভিডিও প্রুফ
            </Button>
          </div>

          {/* Right Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl focus:ring-purple-500 focus:border-purple-500 block px-3 py-2.5 outline-none cursor-pointer"
            >
              <option value="newest">নতুন থেকে পুরাতন</option>
              <option value="oldest">পুরাতন থেকে নতুন</option>
              <option value="highest">সর্বোচ্চ পেমেন্ট</option>
              <option value="lowest">সর্বনিম্ন পেমেন্ট</option>
            </select>
          </div>

        </div>

        {/* 🎴 Proof Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProofs.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedProof(item)}
              className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white group rounded-2xl flex flex-col justify-between"
            >
              <div>
                {/* Card Top Preview Area */}
                <div
                  className={`relative p-5 h-48 flex flex-col justify-between overflow-hidden ${
                    item.type === "video"
                      ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0b0c2a] text-white"
                      : `bg-gradient-to-b ${item.bgColor}`
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between z-10">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${
                        item.type === "video"
                          ? "bg-blue-600 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {item.type === "video" ? (
                        <>
                          <VideoCameraIcon className="w-3 h-3" /> ভিডিও
                        </>
                      ) : (
                        <>
                          <PhotoIcon className="w-3 h-3" /> স্ক্রিনশট
                        </>
                      )}
                    </span>

                    {/* Method Branding Logo */}
                    <span
                      className="text-xs font-black tracking-wider uppercase"
                      style={{ color: item.type === "video" ? "#fff" : item.color }}
                    >
                      {item.method}
                    </span>
                  </div>

                  {/* Center Slip Content */}
                  {item.type === "video" ? (
                    <div className="my-auto text-center relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform mb-2 shadow-lg">
                        <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                      </div>
                      <p className="text-xl font-extrabold text-white">৳{item.amount}</p>
                      <p className="text-[11px] text-gray-300">Payment Successful</p>
                      <p className="text-[10px] text-gray-400 mt-1">Ref ID: {item.trxId}</p>
                    </div>
                  ) : (
                    <div className="my-auto text-center z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">পেমেন্ট সফল</p>
                      <p className="text-2xl font-black text-[#0b0c2a] mt-0.5">৳{item.amount}</p>
                      <p className="text-[10px] text-gray-500 mt-1">তারিখ: {item.date}</p>
                      <p className="text-[10px] text-gray-400">ট্রানজেকশন আইডি: {item.trxId}</p>
                    </div>
                  )}

                  {/* Video fake timeline bar */}
                  {item.type === "video" && (
                    <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden flex items-center justify-between text-[9px] text-gray-400 px-1">
                      <span>0:00 / {item.duration}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Details */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-purple-600" />
                      {item.status}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: item.color }}
                    >
                      {item.method}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <Typography className="text-base font-black text-[#0b0c2a]">
                      ৳{item.amount}
                    </Typography>
                    <Typography className="text-xs text-gray-600 font-medium truncate max-w-[120px]">
                      {item.recipient}
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 🔢 Interactive Pagination */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outlined"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="w-10 h-10 p-0 rounded-xl flex items-center justify-center text-gray-700 border-gray-200"
          >
            ←
          </Button>

          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "filled" : "text"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 p-0 rounded-xl font-bold text-xs ${
                  currentPage === pageNum
                    ? "bg-[#5a32fa] text-white shadow-md shadow-purple-500/20"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outlined"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="w-10 h-10 p-0 rounded-xl flex items-center justify-center text-gray-700 border-gray-200"
          >
            →
          </Button>
        </div>

      </section>

      {/* 🔍 Lightbox / Proof Inspector Modal */}
      <Dialog
        open={!!selectedProof}
        handler={() => setSelectedProof(null)}
        size="sm"
        className="rounded-3xl p-2 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl"
      >
        <DialogHeader className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-extrabold uppercase px-3 py-1 rounded-lg"
              style={{
                backgroundColor: `${selectedProof?.color}15`,
                color: selectedProof?.color,
              }}
            >
              {selectedProof?.method} পেমেন্ট স্লিপ
            </span>
            <Chip
              size="sm"
              variant="ghost"
              value={selectedProof?.type === "video" ? "ভিডিও প্রুফ" : "স্ক্রিনশট প্রুফ"}
              color={selectedProof?.type === "video" ? "purple" : "green"}
            />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setSelectedProof(null)}
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {selectedProof && (
            <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-100 text-center shadow-inner">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckCircleIcon className="w-8 h-8" />
              </div>

              <Typography variant="h5" color="blue-gray" className="font-bold">
                পেমেন্ট সফলভাবে প্রদান করা হয়েছে
              </Typography>

              <Typography variant="h2" className="text-[#050C9C] font-black my-2">
                ৳{selectedProof.amount}
              </Typography>

              <div className="bg-white p-4 rounded-xl border border-gray-100 mt-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">গ্রাহকের নাম:</span>
                  <span className="font-bold text-gray-800">{selectedProof.recipient}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">পেমেন্ট মাধ্যম:</span>
                  <span className="font-bold" style={{ color: selectedProof.color }}>
                    {selectedProof.method} Personal
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">তারিখ ও সময়:</span>
                  <span className="font-bold text-gray-800">{selectedProof.date}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 font-medium">ট্রানজেকশন আইডি (TrxID):</span>
                  <span className="font-mono font-bold text-purple-700">
                    {selectedProof.trxId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="flex justify-between items-center gap-2 pt-2">
          <Button
            variant="text"
            color="red"
            onClick={() => setSelectedProof(null)}
            className="normal-case text-xs"
          >
            বন্ধ করুন
          </Button>
          <Button
            onClick={() => setSelectedProof(null)}
            className="bg-[#5a32fa] normal-case text-xs px-5 flex items-center gap-1.5"
          >
            <CheckCircleIcon className="w-4 h-4" />
            যাচাই সম্পন্ন
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default PaymentProof;
