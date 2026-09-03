import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

const STATUS_TONE = {
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
  PAUSED: "bg-gray-100 text-gray-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const ProviderTasks = () => {
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["provider-tasks", status],
    queryFn: async () => (await api.get(`tasks/mine${status !== "all" ? `?status=${status}` : ""}`)).data,
    staleTime: 15000,
  });
  const { data: summary } = useQuery({
    queryKey: ["provider-tasks-summary"],
    queryFn: async () => (await api.get("tasks/mine/summary")).data,
    staleTime: 15000,
  });

  const cancel = async (id) => {
    setBusyId(id);
    try {
      await api.put(`tasks/mine/${id}/cancel`);
      toast.success("Task cancelled and escrow refunded");
      queryClient.invalidateQueries(["provider-tasks"]);
      queryClient.invalidateQueries(["provider-tasks-summary"]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not cancel");
    } finally {
      setBusyId(null);
    }
  };

  const tabs = ["all", "PENDING_APPROVAL", "ACTIVE", "REJECTED", "COMPLETED", "CANCELLED"];

  return (
    <div className="min-h-screen bg-[#f8faff] py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0b0c2a]">My Tasks (Provider)</h1>
          <Link to="/user/provider/tasks/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d9488] text-white text-xs font-bold">
            <PlusIcon className="w-4 h-4" /> New Task
          </Link>
        </div>

        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Escrow Held</p>
              <p className="text-lg font-black text-teal-600">৳{summary.totalEscrowHeld.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Total Spent</p>
              <p className="text-lg font-black text-gray-700">৳{summary.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatus(t)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 ${
                status === t ? "bg-[#0d9488] text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-gray-400 py-10">Loading...</p>
        ) : (data?.data || []).length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No tasks yet.</p>
        ) : (
          <div className="space-y-3">
            {data.data.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <Link to={`/user/provider/tasks/${t._id}`} className="font-bold text-sm text-gray-900 hover:text-teal-600">
                    {t.title}
                  </Link>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STATUS_TONE[t.status] || "bg-gray-100"}`}>{t.status}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Progress: {t.approvedCount}/{t.targetQuantity}</span>
                  <span>Escrow held: ৳{(t.escrowHeld || 0).toFixed(2)}</span>
                  <span>Pending: {t.pendingCount}</span>
                </div>
                {["ACTIVE", "PENDING_APPROVAL", "PAUSED"].includes(t.status) && (
                  <button
                    onClick={() => cancel(t._id)}
                    disabled={busyId === t._id}
                    className="mt-3 text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
                  >
                    {busyId === t._id ? "Cancelling..." : "Cancel & Refund"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderTasks;
