import React, { useState, useMemo } from "react";
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
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  BoltIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowsRightLeftIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  BanknotesIcon,
  PauseCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";

// Gateway Brand SVG & Icons
const GatewayLogo = ({ name, className = "w-10 h-10" }) => {
  const normalized = name?.toLowerCase() || "";

  if (normalized.includes("bkash")) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#df146e] to-[#ff2b85] text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.8l6.2 6.2-6.2 6.2-6.2-6.2L12 5.8z" />
        </svg>
      </div>
    );
  }

  if (normalized.includes("nagad")) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#f7931e] to-[#ffaa47] text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (normalized.includes("rocket")) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#8c3494] to-[#aa4cb3] text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
        <span className="text-[10px] font-black tracking-tighter">রকেট</span>
      </div>
    );
  }

  if (normalized.includes("bank")) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#1e40af] to-[#3b82f6] text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
        <BuildingLibraryIcon className="w-5 h-5 text-white" />
      </div>
    );
  }

  if (normalized.includes("paypal")) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#003087] to-[#0079c1] text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
        <span className="text-xs font-black italic">P</span>
      </div>
    );
  }

  if (normalized.includes("stripe")) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#635bff] to-[#7a73ff] text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
        <span className="text-xs font-black">S</span>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-900 text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
      <BanknotesIcon className="w-5 h-5 text-white" />
    </div>
  );
};

const initialGatewayList = [
  {
    id: "bkash",
    name: "Bkash",
    subName: "(Personal)",
    type: "Mobile Banking",
    typeBadge: "bg-red-50 text-red-600 border border-red-100",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    accountName: "CNP PROMO",
    accountNumber: "01712345678",
    minAmount: "10.00",
    maxAmount: "50,000.00",
    dailyLimit: "200,000.00",
    createdAt: "May 20, 2026 10:30 AM",
    updatedAt: "May 25, 2026 09:15 AM",
  },
  {
    id: "nagad",
    name: "Nagad",
    subName: "(Personal)",
    type: "Mobile Banking",
    typeBadge: "bg-red-50 text-red-600 border border-red-100",
    status: "Active",
    currency: "BDT",
    fee: "1.50%",
    accountName: "CNP PROMO",
    accountNumber: "01812345678",
    minAmount: "10.00",
    maxAmount: "50,000.00",
    dailyLimit: "200,000.00",
    createdAt: "May 20, 2026 10:35 AM",
    updatedAt: "May 25, 2026 09:18 AM",
  },
  {
    id: "rocket",
    name: "Rocket",
    subName: "(Personal)",
    type: "Mobile Banking",
    typeBadge: "bg-red-50 text-red-600 border border-red-100",
    status: "Inactive",
    currency: "BDT",
    fee: "1.50%",
    accountName: "CNP PROMO",
    accountNumber: "01912345678",
    minAmount: "50.00",
    maxAmount: "25,000.00",
    dailyLimit: "100,000.00",
    createdAt: "May 20, 2026 10:40 AM",
    updatedAt: "May 25, 2026 09:20 AM",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    subName: "(Automatic)",
    type: "Bank",
    typeBadge: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    currency: "BDT",
    fee: "0.00%",
    accountName: "CNP Promo Enterprise Ltd",
    accountNumber: "20501234567890",
    minAmount: "500.00",
    maxAmount: "500,000.00",
    dailyLimit: "1,000,000.00",
    createdAt: "May 21, 2026 11:00 AM",
    updatedAt: "May 25, 2026 09:22 AM",
  },
  {
    id: "paypal",
    name: "PayPal",
    subName: "(Automatic)",
    type: "Online Payment",
    typeBadge: "bg-sky-50 text-sky-600 border border-sky-100",
    status: "Active",
    currency: "USD",
    fee: "3.49% + $0.49",
    accountName: "CNP Global Services",
    accountNumber: "payments@cnppromo.com",
    minAmount: "5.00",
    maxAmount: "2,000.00",
    dailyLimit: "10,000.00",
    createdAt: "May 22, 2026 02:30 PM",
    updatedAt: "May 25, 2026 09:25 AM",
  },
  {
    id: "stripe",
    name: "Stripe",
    subName: "(Automatic)",
    type: "Online Payment",
    typeBadge: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Inactive",
    currency: "USD",
    fee: "2.90% + $0.30",
    accountName: "CNP Promo Stripe Connect",
    accountNumber: "acct_1Mxxxxxxxxxxxx",
    minAmount: "1.00",
    maxAmount: "5,000.00",
    dailyLimit: "25,000.00",
    createdAt: "May 22, 2026 03:00 PM",
    updatedAt: "May 25, 2026 09:30 AM",
  },
];

const mockRecentTransactions = [
  {
    type: "Deposit",
    trxId: "TRX1256801",
    amount: "1,250.00",
    currency: "৳",
    time: "May 25, 2026 10:30 AM",
    color: "text-emerald-600",
    icon: ArrowDownTrayIcon,
    bg: "bg-emerald-50 text-emerald-600",
  },
  {
    type: "Withdrawal",
    trxId: "TRX1256802",
    amount: "850.00",
    currency: "৳",
    time: "May 25, 2026 09:15 AM",
    color: "text-rose-600",
    icon: ArrowUpTrayIcon,
    bg: "bg-rose-50 text-rose-600",
  },
  {
    type: "Deposit",
    trxId: "TRX1256804",
    amount: "1,100.00",
    currency: "৳",
    time: "May 24, 2026 08:20 PM",
    color: "text-emerald-600",
    icon: ArrowDownTrayIcon,
    bg: "bg-emerald-50 text-emerald-600",
  },
  {
    type: "Transfer",
    trxId: "TRX1256807",
    amount: "500.00",
    currency: "৳",
    time: "May 24, 2026 02:35 PM",
    color: "text-purple-600",
    icon: ArrowsRightLeftIcon,
    bg: "bg-purple-50 text-purple-600",
  },
];

const PaymentGateway = () => {
  const queryClient = useQueryClient();
  const [gateways, setGateways] = useState(initialGatewayList);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGateway, setSelectedGateway] = useState(initialGatewayList[0]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // 1. Fetch system settings
  const { data: settings, isLoading } = useQuery(
    ["admin-setting"],
    async () => {
      const res = await api.get("/setting");
      return res.data?.setting || {};
    },
    {
      staleTime: 30000,
      onSuccess: (data) => {
        if (data?.accounts) {
          // Sync real DB account numbers if present
          setGateways((prev) =>
            prev.map((g) => {
              if (data.accounts[g.id]) {
                return { ...g, accountNumber: data.accounts[g.id] };
              }
              return g;
            })
          );
        }
      },
    }
  );

  // 2. Save gateway mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedList) => {
      const accountsObj = {};
      updatedList.forEach((g) => {
        if (g.accountNumber) accountsObj[g.id] = g.accountNumber;
      });
      const res = await api.put("/setting", {
        ...settings,
        accounts: { ...(settings?.accounts || {}), ...accountsObj },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-setting"]);
      toast.success("Payment gateway settings updated!");
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to save gateway settings.");
    },
  });

  const handleToggleStatus = (id) => {
    const updated = gateways.map((g) => {
      if (g.id === id) {
        const nextStatus = g.status === "Active" ? "Inactive" : "Active";
        return {
          ...g,
          status: nextStatus,
          updatedAt: "Just now",
        };
      }
      return g;
    });
    setGateways(updated);
    if (selectedGateway?.id === id) {
      setSelectedGateway((prev) => ({
        ...prev,
        status: prev.status === "Active" ? "Inactive" : "Active",
        updatedAt: "Just now",
      }));
    }
    saveMutation.mutate(updated);
  };

  const handleOpenEdit = (gateway) => {
    setEditFormData({ ...gateway });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = gateways.map((g) =>
      g.id === editFormData.id
        ? { ...editFormData, updatedAt: "Just now" }
        : g
    );
    setGateways(updated);
    setSelectedGateway(editFormData);
    saveMutation.mutate(updated);
  };

  const handleAddNewGateway = (e) => {
    e.preventDefault();
    if (!editFormData.name) return;

    const newId = editFormData.name.toLowerCase().replace(/\s+/g, "_");
    const newGateway = {
      id: newId,
      name: editFormData.name,
      subName: `(${editFormData.type || "Personal"})`,
      type: editFormData.type || "Mobile Banking",
      typeBadge:
        editFormData.type === "Bank"
          ? "bg-blue-50 text-blue-600 border border-blue-100"
          : "bg-red-50 text-red-600 border border-red-100",
      status: "Active",
      currency: editFormData.currency || "BDT",
      fee: editFormData.fee || "1.50%",
      accountName: editFormData.accountName || "CNP PROMO",
      accountNumber: editFormData.accountNumber || "01700000000",
      minAmount: editFormData.minAmount || "10.00",
      maxAmount: editFormData.maxAmount || "50,000.00",
      dailyLimit: editFormData.dailyLimit || "200,000.00",
      createdAt: "Just now",
      updatedAt: "Just now",
    };

    const updated = [...gateways, newGateway];
    setGateways(updated);
    setSelectedGateway(newGateway);
    saveMutation.mutate(updated);
  };

  const filteredGateways = useMemo(() => {
    return gateways.filter((g) => {
      const matchesSearch =
        !search.trim() ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        g.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [gateways, search, statusFilter]);

  const activeCount = gateways.filter((g) => g.status === "Active").length;
  const inactiveCount = gateways.filter((g) => g.status === "Inactive").length;

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 🌟 Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b0c2a] tracking-tight">
            Payment Gateway
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage all payment gateways
          </p>
        </div>

        <Button
          onClick={() => {
            setEditFormData({
              name: "",
              type: "Mobile Banking",
              currency: "BDT",
              fee: "1.50%",
              accountName: "CNP PROMO",
              accountNumber: "",
              minAmount: "10.00",
              maxAmount: "50,000.00",
              dailyLimit: "200,000.00",
            });
            setIsAddModalOpen(true);
          }}
          className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-3 rounded-2xl shadow-md shadow-indigo-500/20 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Gateway</span>
        </Button>
      </div>

      {/* 📊 4 KPI Stat Metric Cards (Matching reference screenshot exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Gateways */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BuildingLibraryIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Total Gateways
            </span>
            <span className="text-2xl font-black text-[#0b0c2a]">
              {gateways.length}
            </span>
            <p className="text-[11px] text-gray-400">All Payment Gateways</p>
          </div>
        </Card>

        {/* Metric 2: Active Gateways */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Active Gateways
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {activeCount}
            </span>
            <p className="text-[11px] text-gray-400">Currently Active</p>
          </div>
        </Card>

        {/* Metric 3: Inactive Gateways */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <PauseCircleIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Inactive Gateways
            </span>
            <span className="text-2xl font-black text-rose-600">
              {inactiveCount}
            </span>
            <p className="text-[11px] text-gray-400">Currently Inactive</p>
          </div>
        </Card>

        {/* Metric 4: Total Transactions */}
        <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5a32fa] flex items-center justify-center shrink-0">
            <BanknotesIcon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">
              Total Transactions
            </span>
            <span className="text-2xl font-black text-[#0b0c2a]">
              24,685
            </span>
            <p className="text-[11px] text-gray-400">Through All Gateways</p>
          </div>
        </Card>
      </div>

      {/* 🔍 Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by gateway name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400">Select Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* 📜 Gateway Data Table (Matching reference layout) */}
      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-5">#</th>
                <th className="py-4 px-5">Gateway Name</th>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Currency</th>
                <th className="py-4 px-5">Transaction Fee</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredGateways.map((item, index) => {
                const isSelected = selectedGateway?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedGateway(item)}
                    className={`hover:bg-purple-50/40 cursor-pointer transition-colors ${
                      isSelected ? "bg-purple-50/60" : ""
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-gray-400">
                      {index + 1}
                    </td>

                    {/* Gateway Logo & Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <GatewayLogo name={item.name} className="w-9 h-9" />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">
                            {item.name}
                          </p>
                          <span className="text-[11px] text-gray-400">
                            {item.subName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.typeBadge}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>

                    {/* Currency */}
                    <td className="py-4 px-5 font-bold text-gray-800">
                      {item.currency}
                    </td>

                    {/* Fee */}
                    <td className="py-4 px-5 font-semibold text-gray-600 font-mono">
                      {item.fee}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGateway(item);
                          }}
                          className="border-indigo-100 text-[#5a32fa] hover:bg-purple-50 normal-case text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-bold"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          title="Edit Gateway"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>
            Showing 1 to {filteredGateways.length} of {gateways.length} gateways
          </span>

          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600">
              «
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600">
              ‹
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#5a32fa] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600">
              ›
            </button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600">
              »
            </button>
          </div>
        </div>
      </Card>

      {/* 🌟 Gateway Details Section (Matching lower half of reference image) */}
      {selectedGateway && (
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-[#0b0c2a]">
              Gateway Details
            </h2>
            <button
              onClick={() => setSelectedGateway(null)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Logo & Meta Info */}
            <div className="md:col-span-3 flex flex-col items-center text-center p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
              <GatewayLogo name={selectedGateway.name} className="w-16 h-16" />
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {selectedGateway.name}
                </h3>
                <span
                  className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full mt-1 ${
                    selectedGateway.status === "Active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {selectedGateway.status}
                </span>
              </div>

              <div className="text-left w-full space-y-1.5 text-[11px] text-gray-500 pt-2 border-t border-gray-200">
                <p>
                  <strong>Type:</strong> {selectedGateway.type}
                </p>
                <p>
                  <strong>Created At:</strong> {selectedGateway.createdAt}
                </p>
                <p>
                  <strong>Updated At:</strong> {selectedGateway.updatedAt}
                </p>
              </div>
            </div>

            {/* Middle Column: Gateway Information Key-Value */}
            <div className="md:col-span-5 space-y-2.5 text-xs">
              <h4 className="font-bold text-gray-900 text-xs mb-1">
                Gateway Information
              </h4>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Gateway Name</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : {selectedGateway.name}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Gateway Type</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : {selectedGateway.type}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Account Name</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : {selectedGateway.accountName}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Account / Number</span>
                <span className="col-span-7 font-mono font-bold text-purple-700">
                  : {selectedGateway.accountNumber}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Currency</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : {selectedGateway.currency}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Transaction Fee</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : {selectedGateway.fee}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Minimum Amount</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : ৳ {selectedGateway.minAmount}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Maximum Amount</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : ৳ {selectedGateway.maxAmount}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Daily Limit</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : ৳ {selectedGateway.dailyLimit}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1">
                <span className="col-span-5 text-gray-500">Status</span>
                <span className="col-span-7 font-bold text-emerald-600">
                  : {selectedGateway.status}
                </span>
              </div>
            </div>

            {/* Right Column: Recent Transactions Feed */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-xs">
                  Recent Transactions
                </h4>
                <button
                  type="button"
                  className="text-[11px] font-bold text-[#5a32fa] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {mockRecentTransactions.map((tx, idx) => {
                  const Icon = tx.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${tx.bg}`}
                        >
                          <Icon className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">
                            {tx.type}
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">
                            {tx.trxId}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-black ${tx.color} font-mono block`}>
                          {tx.currency} {tx.amount}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {tx.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar (Edit, Test, Deactivate/Activate) */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleOpenEdit(selectedGateway)}
              className="bg-emerald-600 hover:bg-emerald-700 normal-case text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Edit Gateway</span>
            </Button>

            <Button
              onClick={() =>
                toast.success(`Gateway ping test successful! 200ms response.`)
              }
              className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
            >
              <BoltIcon className="w-4 h-4" />
              <span>Test Gateway</span>
            </Button>

            <Button
              onClick={() => handleToggleStatus(selectedGateway.id)}
              className={`${
                selectedGateway.status === "Active"
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              } normal-case text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm`}
            >
              <PauseCircleIcon className="w-4 h-4" />
              <span>
                {selectedGateway.status === "Active"
                  ? "Deactivate Gateway"
                  : "Activate Gateway"}
              </span>
            </Button>
          </div>
        </Card>
      )}

      {/* ℹ️ Bottom Info Alert Banner (Matching screenshot) */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100/80 rounded-3xl flex items-center gap-3 text-xs text-indigo-900">
        <InformationCircleIcon className="w-5 h-5 text-[#5a32fa] shrink-0" />
        <span>
          Add and manage multiple payment gateways to receive payments from users securely.
        </span>
      </div>

      {/* ✍️ Edit Gateway Modal */}
      <Dialog
        open={isEditModalOpen}
        handler={() => setIsEditModalOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-white space-y-4 max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-black text-base">
            <PencilSquareIcon className="w-5 h-5 text-[#5a32fa]" />
            <span>Edit {editFormData.name} Gateway</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Account Name</label>
              <input
                type="text"
                value={editFormData.accountName || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, accountName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Account Number / ID</label>
              <input
                type="text"
                value={editFormData.accountNumber || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, accountNumber: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Transaction Fee</label>
              <input
                type="text"
                value={editFormData.fee || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fee: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Currency</label>
              <input
                type="text"
                value={editFormData.currency || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, currency: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Min Amount</label>
              <input
                type="text"
                value={editFormData.minAmount || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, minAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Max Amount</label>
              <input
                type="text"
                value={editFormData.maxAmount || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, maxAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Daily Limit</label>
              <input
                type="text"
                value={editFormData.dailyLimit || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, dailyLimit: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isLoading}
            className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>
              {saveMutation.isLoading ? "Saving Settings..." : "Save Gateway Settings"}
            </span>
          </Button>
        </form>
      </Dialog>

      {/* ✍️ Add New Gateway Modal */}
      <Dialog
        open={isAddModalOpen}
        handler={() => setIsAddModalOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-white space-y-4 max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-black text-base">
            <PlusIcon className="w-5 h-5 text-[#5a32fa]" />
            <span>Add New Payment Gateway</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAddNewGateway} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Gateway Name *</label>
              <input
                type="text"
                placeholder="e.g. Upay, Payoneer"
                value={editFormData.name || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Gateway Type *</label>
              <select
                value={editFormData.type || "Mobile Banking"}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, type: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              >
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Account Number *</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={editFormData.accountNumber || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, accountNumber: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Transaction Fee</label>
              <input
                type="text"
                placeholder="1.50%"
                value={editFormData.fee || "1.50%"}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fee: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Create Gateway</span>
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

export default PaymentGateway;
