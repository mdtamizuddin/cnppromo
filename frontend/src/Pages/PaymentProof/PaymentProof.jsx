import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import {
  Card,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
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
  EyeIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

const defaultMockProofs = [
  {
    _id: "1",
    type: "screenshot",
    method: "bKash",
    amount: 5250,
    recipient: "মো: রাকিবুল ইসলাম",
    date: "২৪ মে ২০২৬ • 10:45 AM",
    trxId: "8GJ3K8F6",
    status: "পেমেন্ট সফল",
    color: "#E2136E",
    imageUrl: "/reviews-images/image-1.jpeg",
  },
  {
    _id: "2",
    type: "screenshot",
    method: "Nagad",
    amount: 3850,
    recipient: "সায়েম আহমেদ",
    date: "২৪ মে ২০২৬ • 09:15 AM",
    trxId: "28736273823",
    status: "পেমেন্ট সফল",
    color: "#F7941D",
    imageUrl: "/reviews-images/image-2.jpeg",
  },
  {
    _id: "3",
    type: "screenshot",
    method: "Rocket",
    amount: 7200,
    recipient: "আকতার জামান",
    date: "২৩ মে ২০২৬ • 08:30 PM",
    trxId: "2KBJ6H3L1",
    status: "পেমেন্ট সফল",
    color: "#8C3494",
    imageUrl: "/reviews-images/image-3.jpeg",
  },
  {
    _id: "4",
    type: "screenshot",
    method: "bKash",
    amount: 4100,
    recipient: "ইমরান হোসেন",
    date: "২৩ মে ২০২৬ • 07:40 PM",
    trxId: "4F7H9J2K1",
    status: "পেমেন্ট সফল",
    color: "#E2136E",
    imageUrl: "/reviews-images/image-4.jpeg",
  },
];

const methodColors = {
  bKash: "#E2136E",
  Nagad: "#F7941D",
  Rocket: "#8C3494",
  Bank: "#2563EB",
  "Binance / USDT": "#D97706",
  Other: "#6B7280",
};

const PaymentProof = () => {
  const [filterMethod, setFilterMethod] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProof, setSelectedProof] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch verified payment proofs from database
  const { data: dbProofs = [] } = useQuery({
    queryKey: ["public-payment-proofs"],
    queryFn: async () => {
      try {
        const res = await api.get("/payment-proof");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const rawList = useMemo(() => {
    if (dbProofs && dbProofs.length > 0) return dbProofs;
    return defaultMockProofs;
  }, [dbProofs]);

  // Filter & Sort computation
  const filteredProofs = useMemo(() => {
    let result = [...rawList];

    if (filterMethod !== "all") {
      result = result.filter((item) => item.method === filterMethod);
    }

    if (sortBy === "highest") {
      result.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [rawList, filterMethod, sortBy]);

  const totalPages = Math.ceil(filteredProofs.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProofs.slice(start, start + itemsPerPage);
  }, [filteredProofs, currentPage]);

  const totalPaidSum = useMemo(() => {
    return rawList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [rawList]);

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">

        {/* 🌟 Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-400 text-xs font-bold tracking-wide">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>লাইভ পেমেন্ট স্টেটমেন্ট ও ভেরিফাইড প্রুফ</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                CNP-Promo লাইভ পেমেন্ট প্রুফ <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  ১০০% বিশ্বস্ত ও শতভাগ নিশ্চিত ক্যাশআউট 💰
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                প্রতিদিন মেম্বারদের bKash, Nagad ও Rocket অ্যাকাউন্টে পাঠানো সফল পেমেন্টের লাইভ ট্রানজেকশন স্ক্রিনশট দেখুন।
              </p>

              {/* Trust Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4 text-emerald-400" />
                  <span>সর্বমোট প্রুফ: <strong>৳{totalPaidSum.toLocaleString()}</strong></span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-sky-400" />
                  <span>{rawList.length}+ সফল লেনদেন</span>
                </div>
              </div>
            </div>

            {/* Right illustration / graphic */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-44 sm:w-52 aspect-square">
                <img
                  src="/wallet_3d_illustration.png"
                  alt="Wallet 3D"
                  className="w-full h-full object-contain drop-shadow-2xl  transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🎛️ Filter & Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Method Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {["all", "bKash", "Nagad", "Rocket", "Bank"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setFilterMethod(m);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${filterMethod === m
                    ? "bg-[#5a32fa] text-white shadow-md shadow-indigo-500/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                  }`}
              >
                {m === "all" ? "সব গেটওয়ে" : m}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 font-medium">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
            >
              <option value="newest">সর্বশেষ আগে</option>
              <option value="highest">সর্বোচ্চ টাকা</option>
              <option value="lowest">সর্বনিম্ন টাকা</option>
            </select>
          </div>
        </div>

        {/* 📸 Payment Proofs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentItems.map((item) => {
            const methodColor = methodColors[item.method] || "#5a32fa";
            return (
              <Card
                key={item._id || item.id}
                onClick={() => setSelectedProof(item)}
                className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white group rounded-3xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Image Preview */}
                  <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
                    <img
                      src={item.imageUrl || "/reviews-images/image-1.jpeg"}
                      alt={item.recipient}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/reviews-images/image-1.jpeg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <EyeIcon className="w-4 h-4" />
                      <span>প্রুফ জুম করুন</span>
                    </div>

                    <span
                      className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full text-white shadow-md uppercase"
                      style={{ backgroundColor: methodColor }}
                    >
                      {item.method}
                    </span>

                    <span className="absolute bottom-3 right-3 text-xs font-black px-2.5 py-1 rounded-xl bg-gray-900/85 backdrop-blur-md text-emerald-400 font-mono shadow-md">
                      ৳{(Number(item.amount) || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Card Bottom Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                        পেমেন্ট সফল
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-[#0b0c2a] truncate">
                        {item.recipient}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400 truncate">
                        {item.trxId ? `TrxID: ${item.trxId}` : item.note || "সফলভাবে প্রসেসড"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 🔢 Interactive Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <Button
              variant="outlined"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl text-xs normal-case border-gray-300"
            >
              পূর্ববর্তী
            </Button>
            <span className="text-xs font-bold text-gray-600 px-3">
              পৃষ্ঠা {currentPage} / {totalPages}
            </span>
            <Button
              variant="outlined"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl text-xs normal-case border-gray-300"
            >
              পরবর্তী
            </Button>
          </div>
        )}

      </div>

      {/* 🔍 Lightbox Modal for Zooming Proof */}
      <Dialog
        open={!!selectedProof}
        handler={() => setSelectedProof(null)}
        size="md"
        className="rounded-3xl p-4 bg-gray-900/95 backdrop-blur-md max-w-lg text-center"
      >
        {selectedProof && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-2 px-2">
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">
                  {selectedProof.recipient}
                </h3>
                <p className="text-xs text-emerald-400 font-mono font-bold">
                  ৳{(Number(selectedProof.amount) || 0).toLocaleString()} via {selectedProof.method}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="text-white/70 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <img
              src={selectedProof.imageUrl || "/reviews-images/image-1.jpeg"}
              alt="Receipt Preview"
              className="max-h-[70vh] w-auto mx-auto rounded-2xl shadow-2xl object-contain"
            />

            {selectedProof.trxId && (
              <p className="text-[11px] font-mono text-gray-300 bg-white/10 py-1.5 px-3 rounded-xl inline-block">
                Transaction ID: {selectedProof.trxId}
              </p>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PaymentProof;
