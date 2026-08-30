import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Card,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PhotoIcon,
  TrashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  EyeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";

const methodColors = {
  bKash: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
  Nagad: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  Rocket: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  Bank: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  "Binance / USDT": { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  Other: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
};

const AdminPaymentProofs = () => {
  const queryClient = useQueryClient();
  const [filterMethod, setFilterMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Form states
  const [method, setMethod] = useState("bKash");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [trxId, setTrxId] = useState("");
  const [note, setNote] = useState("পেমেন্ট সফলভাবে সম্পন্ন হয়েছে");
  const [featured, setFeatured] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch proofs from API
  const { data: proofs = [], isLoading } = useQuery({
    queryKey: ["admin-payment-proofs", filterMethod],
    queryFn: async () => {
      const res = await api.get(`/payment-proof?method=${filterMethod}`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 2. Upload image to S3
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading screenshot to S3...");

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setImageUrl(res.data.url);
        toast.success("Image uploaded to S3 successfully!", { id: loadingToast });
      } else {
        toast.error("Failed to retrieve uploaded image URL", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error uploading image to S3", {
        id: loadingToast,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Create Proof Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/payment-proof", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-payment-proofs"]);
      queryClient.invalidateQueries(["public-payment-proofs"]);
      toast.success("Payment proof added successfully!");
      setIsAddModalOpen(false);
      setImageUrl("");
      setAmount("");
      setRecipient("");
      setTrxId("");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to add payment proof");
    },
  });

  // 4. Toggle Feature Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, featured }) => {
      const res = await api.put(`/payment-proof/${id}`, { featured });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-payment-proofs"]);
      queryClient.invalidateQueries(["public-payment-proofs"]);
      toast.success("Feature status updated!");
    },
  });

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/payment-proof/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-payment-proofs"]);
      queryClient.invalidateQueries(["public-payment-proofs"]);
      toast.success("Payment proof deleted.");
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload a payment screenshot first");
      return;
    }
    if (!amount || !recipient) {
      toast.error("Please enter both amount and recipient name");
      return;
    }

    createMutation.mutate({
      imageUrl,
      method,
      amount: Number(amount),
      recipient,
      trxId,
      note,
      featured,
    });
  };

  const filteredProofs = proofs.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.recipient?.toLowerCase().includes(q) ||
      p.trxId?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      p.note?.toLowerCase().includes(q)
    );
  });

  const totalProofAmount = proofs.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-12">
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <PhotoIcon className="w-4 h-4 text-emerald-600" />
            <span>S3 Payment Receipts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
            Payment Proofs Manager
          </h1>
          <p className="text-xs text-gray-500">
            Upload verified payout screenshots to S3 and publish them on the public Payment Proof page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 p-2.5 px-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl">
            <div className="text-xl font-black text-[#5a32fa] font-mono">
              ৳{totalProofAmount.toLocaleString()}
            </div>
            <div className="text-xs">
              <p className="text-gray-500 text-[10px]">{proofs.length} Total Proofs</p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-4 py-3 rounded-2xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Payment Proof</span>
          </Button>
        </div>
      </div>

      {/* 🔍 Search & Method Filter */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, TrxID, method..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "bKash", "Nagad", "Rocket", "Bank"].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMethod(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterMethod === m
                  ? "bg-[#5a32fa] text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {m === "all" ? "All Methods" : m}
            </button>
          ))}
        </div>
      </div>

      {/* 📜 Proofs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProofs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
            No payment proofs found. Click "Upload Payment Proof" above to add one.
          </div>
        ) : (
          filteredProofs.map((p) => {
            const badge = methodColors[p.method] || methodColors.Other;
            return (
              <Card
                key={p._id}
                className="overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Screenshot image container */}
                <div
                  onClick={() => setSelectedImage(p.imageUrl)}
                  className="relative cursor-pointer group bg-gray-900 aspect-[4/3] overflow-hidden"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.recipient}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/reviews-images/image-1.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <EyeIcon className="w-4 h-4" />
                    <span>View Image</span>
                  </div>

                  <span
                    className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {p.method}
                  </span>

                  <span className="absolute bottom-3 right-3 text-xs font-black px-2.5 py-1 rounded-xl bg-gray-900/80 backdrop-blur-md text-emerald-400 font-mono">
                    ৳{p.amount?.toLocaleString()}
                  </span>
                </div>

                {/* Proof Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 truncate">
                        {p.recipient}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {p.trxId ? `TrxID: ${p.trxId}` : "No TrxID"}
                      </p>
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">
                      {p.date}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-xl">
                    {p.note || "পেমেন্ট সফলভাবে সম্পন্ন হয়েছে"}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-3 pt-0 border-t border-gray-50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMutation.mutate({
                        id: p._id,
                        featured: !p.featured,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      p.featured
                        ? "bg-purple-50 text-[#5a32fa] border border-purple-200"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <SparklesIcon className="w-3 h-3" />
                    <span>{p.featured ? "Featured ✓" : "Feature"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this payment proof?")) {
                        deleteMutation.mutate(p._id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ✍️ Upload Proof Modal */}
      <Dialog
        open={isAddModalOpen}
        handler={() => setIsAddModalOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-white space-y-4 max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-black text-base">
            <ArrowUpTrayIcon className="w-5 h-5 text-[#5a32fa]" />
            <span>Upload Payment Proof to S3</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {/* File Upload Box */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700">
              Payment Screenshot Image *
            </label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-[#5a32fa] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={isUploading}
              />
              {imageUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-28 object-contain rounded-xl border border-gray-200 shadow-sm"
                  />
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    S3 Upload Complete (Click to replace)
                  </span>
                </div>
              ) : (
                <div className="space-y-1 py-3 text-gray-500">
                  <ArrowUpTrayIcon className="w-7 h-7 mx-auto text-[#5a32fa]" />
                  <p className="font-bold text-xs text-gray-700">
                    {isUploading ? "Uploading to S3..." : "Click or Drag image here"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Supports JPG, PNG, WebP (Uploaded directly to AWS S3)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Payment Gateway *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Binance / USDT">Binance / USDT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Amount (৳) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                required
              />
            </div>
          </div>

          {/* Recipient & TrxID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Recipient Name / Phone *</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. মো: রাকিবুল ইসলাম"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Transaction ID (TrxID)</label>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="e.g. 8GJ3K8F6"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Note / Caption</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. উইথড্র পেমেন্ট সফলভাবে ট্রান্সফার করা হয়েছে"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
            />
          </div>

          {/* Feature toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="proofFeatured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-[#5a32fa] rounded focus:ring-purple-500 border-gray-300"
            />
            <label htmlFor="proofFeatured" className="font-bold text-gray-700 cursor-pointer">
              Feature on Public Payment Proof Page
            </label>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isLoading || isUploading}
            className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>
              {createMutation.isLoading ? "Publishing Proof..." : "Publish Payment Proof"}
            </span>
          </Button>
        </form>
      </Dialog>

      {/* 🔍 Lightbox Image Zoom Dialog */}
      <Dialog
        open={!!selectedImage}
        handler={() => setSelectedImage(null)}
        size="lg"
        className="rounded-3xl p-4 bg-gray-900/90 backdrop-blur-md max-w-2xl text-center"
      >
        {selectedImage && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Payment Screenshot"
              className="max-h-[75vh] w-auto mx-auto rounded-2xl shadow-2xl object-contain"
            />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AdminPaymentProofs;
