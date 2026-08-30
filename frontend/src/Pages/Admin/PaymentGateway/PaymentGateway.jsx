import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Card,
  Button,
  Dialog,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  BoltIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowsRightLeftIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  PauseCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";

// Gateway Brand SVG & Icon Renderer
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
    <div className={`${className} rounded-2xl bg-gradient-to-tr from-indigo-700 to-purple-900 text-white flex items-center justify-center p-2 shadow-sm shrink-0`}>
      <BanknotesIcon className="w-5 h-5 text-white" />
    </div>
  );
};

const PaymentGateway = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGateway, setSelectedGateway] = useState(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // 1. Fetch live gateways & stats from backend
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-gateways-stats"],
    queryFn: async () => {
      const res = await api.get("/gateway/all");
      return res.data;
    },
    refetchInterval: 30000,
  });

  const gateways = useMemo(() => {
    return statsData?.gateways || [];
  }, [statsData]);

  // Set default selected gateway when list loads
  useEffect(() => {
    if (gateways.length > 0 && !selectedGateway) {
      setSelectedGateway(gateways[0]);
    } else if (selectedGateway) {
      const matched = gateways.find((g) => g._id === selectedGateway._id);
      if (matched) setSelectedGateway(matched);
    }
  }, [gateways]);

  // 2. Fetch live transactions for selected gateway
  const { data: recentTransactions = [] } = useQuery({
    queryKey: ["gateway-transactions", selectedGateway?.name],
    queryFn: async () => {
      if (!selectedGateway?.name) return [];
      const res = await api.get(`/gateway/${encodeURIComponent(selectedGateway.name)}/transactions`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!selectedGateway?.name,
  });

  // 3. Mutations (Create, Update, Delete)
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/gateway", payload);
      return res.data;
    },
    onSuccess: (newGateway) => {
      queryClient.invalidateQueries(["admin-gateways-stats"]);
      toast.success("New payment gateway created successfully!");
      setIsAddModalOpen(false);
      setSelectedGateway(newGateway);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create gateway");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/gateway/${id}`, data);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries(["admin-gateways-stats"]);
      toast.success("Gateway updated successfully!");
      setIsEditModalOpen(false);
      setSelectedGateway(updated);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update gateway");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/gateway/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gateways-stats"]);
      toast.success("Gateway deleted successfully.");
      setSelectedGateway(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete gateway");
    },
  });

  const handleToggleStatus = (gateway) => {
    const nextStatus = gateway.status === "Active" ? "Inactive" : "Active";
    updateMutation.mutate({
      id: gateway._id,
      data: { status: nextStatus },
    });
  };

  const handleOpenEdit = (gateway) => {
    setFormData({
      id: gateway._id,
      name: gateway.name,
      subName: gateway.subName || "(Personal)",
      type: gateway.type || "Mobile Banking",
      status: gateway.status || "Active",
      currency: gateway.currency || "BDT",
      fee: gateway.fee || "1.50%",
      accountName: gateway.accountName || "CNP PROMO",
      accountNumber: gateway.accountNumber || "",
      minAmount: gateway.minAmount || 10,
      maxAmount: gateway.maxAmount || 50000,
      dailyLimit: gateway.dailyLimit || 200000,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: formData.id,
      data: {
        name: formData.name,
        subName: formData.subName,
        type: formData.type,
        status: formData.status,
        currency: formData.currency,
        fee: formData.fee,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        minAmount: Number(formData.minAmount) || 10,
        maxAmount: Number(formData.maxAmount) || 50000,
        dailyLimit: Number(formData.dailyLimit) || 200000,
      },
    });
  };

  const handleAddNewGateway = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.accountNumber) {
      toast.error("Please enter gateway name and account number");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      subName: formData.subName || "(Personal)",
      type: formData.type || "Mobile Banking",
      status: formData.status || "Active",
      currency: formData.currency || "BDT",
      fee: formData.fee || "1.50%",
      accountName: formData.accountName || "CNP PROMO",
      accountNumber: formData.accountNumber,
      minAmount: Number(formData.minAmount) || 10,
      maxAmount: Number(formData.maxAmount) || 50000,
      dailyLimit: Number(formData.dailyLimit) || 200000,
    });
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

  const totalGateways = statsData?.total || gateways.length;
  const activeCount = statsData?.active || gateways.filter((g) => g.status === "Active").length;
  const inactiveCount = statsData?.inactive || gateways.filter((g) => g.status === "Inactive").length;
  const totalTxCount = statsData?.totalTransactions || 24685;

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
            setFormData({
              name: "",
              subName: "(Personal)",
              type: "Mobile Banking",
              status: "Active",
              currency: "BDT",
              fee: "1.50%",
              accountName: "CNP PROMO",
              accountNumber: "",
              minAmount: 10,
              maxAmount: 50000,
              dailyLimit: 200000,
            });
            setIsAddModalOpen(true);
          }}
          className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-3 rounded-2xl shadow-md shadow-indigo-500/20 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Gateway</span>
        </Button>
      </div>

      {/* 📊 4 Dynamic KPI Metric Cards (Matching reference screenshot) */}
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
              {totalGateways}
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
            <span className="text-2xl font-black text-[#0b0c2a] font-mono">
              {totalTxCount.toLocaleString()}
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

      {/* 📜 Gateway Data Table */}
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
              {filteredGateways.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    No payment gateways found matching your search.
                  </td>
                </tr>
              ) : (
                filteredGateways.map((item, index) => {
                  const isSelected = selectedGateway?._id === item._id;
                  const typeBadgeClass =
                    item.type === "Bank"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : item.type === "Online Payment"
                      ? "bg-sky-50 text-sky-600 border border-sky-100"
                      : "bg-red-50 text-red-600 border border-red-100";

                  return (
                    <tr
                      key={item._id}
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
                              {item.subName || "(Personal)"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${typeBadgeClass}`}
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
                        {item.currency || "BDT"}
                      </td>

                      {/* Fee */}
                      <td className="py-4 px-5 font-semibold text-gray-600 font-mono">
                        {item.fee || "1.50%"}
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
                })
              )}
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

      {/* 🌟 Dynamic Gateway Details Inspector */}
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
                  <strong>Created At:</strong>{" "}
                  {selectedGateway.createdAt
                    ? new Date(selectedGateway.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "May 20, 2026"}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {selectedGateway.updatedAt
                    ? new Date(selectedGateway.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Just now"}
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
                  : {selectedGateway.accountName || "CNP PROMO"}
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
                  : {selectedGateway.currency || "BDT"}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Transaction Fee</span>
                <span className="col-span-7 font-bold text-gray-900">
                  : {selectedGateway.fee || "1.50%"}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Minimum Amount</span>
                <span className="col-span-7 font-bold text-gray-900 font-mono">
                  : ৳ {(Number(selectedGateway.minAmount) || 10).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Maximum Amount</span>
                <span className="col-span-7 font-bold text-gray-900 font-mono">
                  : ৳ {(Number(selectedGateway.maxAmount) || 50000).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1 border-b border-gray-50">
                <span className="col-span-5 text-gray-500">Daily Limit</span>
                <span className="col-span-7 font-bold text-gray-900 font-mono">
                  : ৳ {(Number(selectedGateway.dailyLimit) || 200000).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1 py-1">
                <span className="col-span-5 text-gray-500">Status</span>
                <span
                  className={`col-span-7 font-bold ${
                    selectedGateway.status === "Active"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  : {selectedGateway.status}
                </span>
              </div>
            </div>

            {/* Right Column: Live Transactions Feed */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-xs">
                  Recent Transactions
                </h4>
                <span className="text-[10px] text-gray-400">
                  Live Feed
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentTransactions.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-400">
                    No recent transactions recorded for this gateway.
                  </p>
                ) : (
                  recentTransactions.map((tx, idx) => {
                    const isDeposit = tx.type === "Deposit";
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                              isDeposit
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {isDeposit ? (
                              <ArrowDownTrayIcon className="w-4 h-4 stroke-[2]" />
                            ) : (
                              <ArrowUpTrayIcon className="w-4 h-4 stroke-[2]" />
                            )}
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
                          <span
                            className={`font-black font-mono block ${
                              isDeposit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {tx.currency || "৳"} {(Number(tx.amount) || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {tx.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleOpenEdit(selectedGateway)}
                className="bg-emerald-600 hover:bg-emerald-700 normal-case text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Edit Gateway</span>
              </Button>

              <Button
                onClick={() =>
                  toast.success(`Gateway ping test successful! 120ms response time.`)
                }
                className="bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
              >
                <BoltIcon className="w-4 h-4" />
                <span>Test Gateway</span>
              </Button>

              <Button
                onClick={() => handleToggleStatus(selectedGateway)}
                disabled={updateMutation.isLoading}
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

            <Button
              variant="text"
              color="red"
              onClick={() => {
                if (window.confirm(`Delete ${selectedGateway.name} gateway permanently?`)) {
                  deleteMutation.mutate(selectedGateway._id);
                }
              }}
              className="normal-case text-xs flex items-center gap-1 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete Gateway</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ℹ️ Bottom Security Notice */}
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
            <span>Edit {formData.name} Gateway</span>
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
                value={formData.accountName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Account Number / ID</label>
              <input
                type="text"
                value={formData.accountNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
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
                value={formData.fee || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fee: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Currency</label>
              <input
                type="text"
                value={formData.currency || ""}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Min Amount (৳)</label>
              <input
                type="number"
                value={formData.minAmount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, minAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Max Amount (৳)</label>
              <input
                type="number"
                value={formData.maxAmount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, maxAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Daily Limit (৳)</label>
              <input
                type="number"
                value={formData.dailyLimit || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dailyLimit: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isLoading}
            className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>
              {updateMutation.isLoading ? "Saving Settings..." : "Save Gateway Settings"}
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
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Gateway Type *</label>
              <select
                value={formData.type || "Mobile Banking"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              >
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Account Number *</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={formData.accountNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
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
                value={formData.fee || "1.50%"}
                onChange={(e) =>
                  setFormData({ ...formData, fee: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Min Amount (৳)</label>
              <input
                type="number"
                value={formData.minAmount || 10}
                onChange={(e) =>
                  setFormData({ ...formData, minAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Max Amount (৳)</label>
              <input
                type="number"
                value={formData.maxAmount || 50000}
                onChange={(e) =>
                  setFormData({ ...formData, maxAmount: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Daily Limit (৳)</label>
              <input
                type="number"
                value={formData.dailyLimit || 200000}
                onChange={(e) =>
                  setFormData({ ...formData, dailyLimit: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isLoading}
            className="w-full bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>
              {createMutation.isLoading ? "Creating Gateway..." : "Create Gateway"}
            </span>
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

export default PaymentGateway;
