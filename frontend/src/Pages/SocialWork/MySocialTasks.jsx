import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { Card, Button, Progress } from "@material-tailwind/react";
import {
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationCircleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  BanknotesIcon,
  XCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../util/axios";
import SocialNav from "./components/SocialNav";

const STATUS_FILTERS = [
  { id: "all", label: "All Campaigns" },
  { id: "ACTIVE", label: "Active" },
  { id: "PENDING_APPROVAL", label: "Under Review" },
  { id: "COMPLETED", label: "Completed" },
  { id: "REJECTED", label: "Rejected" },
  { id: "CANCELLED", label: "Cancelled" },
];

const MySocialTasks = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  const { data: myTasks, isLoading } = useQuery({
    queryKey: ["my-social-tasks"],
    queryFn: async () => {
      const res = await api.get("social-works/my-tasks");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(myTasks)) return [];
    if (selectedStatus === "all") return myTasks;
    return myTasks.filter((t) => {
      if (selectedStatus === "ACTIVE") return t.status === "ACTIVE" || t.status === "active";
      return t.status === selectedStatus;
    });
  }, [myTasks, selectedStatus]);

  // Provider summary stats
  const stats = useMemo(() => {
    const list = Array.isArray(myTasks) ? myTasks : [];
    const activeCount = list.filter((t) => t.status === "ACTIVE" || t.status === "active").length;
    const totalEscrow = list.reduce((acc, t) => acc + (t.escrowRemaining || 0), 0);
    const pendingReviews = list.reduce((acc, t) => acc + (t.pendingSubmissions || 0), 0);
    return {
      total: list.length,
      activeCount,
      totalEscrow,
      pendingReviews,
    };
  }, [myTasks]);

  const handleCancelTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to cancel this task? Remaining unspent escrow will be immediately refunded to your balance.")) {
      return;
    }

    try {
      setCancellingId(taskId);
      const res = await api.put(`social-works/cancel/${taskId}`);
      toast.success(res.data?.message || "Task cancelled and escrow refunded!");
      queryClient.invalidateQueries(["my-social-tasks"]);
      queryClient.invalidateQueries(["user"]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel task");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
      case "active":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Under Review</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Rejected (Refunded)</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Completed</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        {/* Shared Sub-Navigation Bar */}
        <SocialNav />

        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-white to-sky-500/10 border border-teal-100 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              My Created Campaigns
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your tasks, track real-time worker submissions, and control your escrow budget.
            </p>
          </div>
          <Link to="/user/social-works/create">
            <Button
              className="bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs px-5 py-3 rounded-2xl shadow-md hover:shadow-lg flex items-center gap-1.5 shrink-0"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Post New Task</span>
            </Button>
          </Link>
        </div>

        {/* Provider KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-xs text-gray-400 font-medium">Total Campaigns</p>
            <p className="text-xl font-black text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-xs text-gray-400 font-medium">Active Now</p>
            <p className="text-xl font-black text-teal-600 mt-1">{stats.activeCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-xs text-gray-400 font-medium">Escrow in Hold</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              ৳{stats.totalEscrow.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
            <p className="text-xs text-gray-400 font-medium">Pending Reviews</p>
            <p className="text-xl font-black text-amber-600 mt-1">{stats.pendingReviews}</p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-medium">
            Loading your campaigns…
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border border-gray-100 shadow-sm bg-white">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              📋
            </div>
            <h4 className="text-sm font-bold text-gray-800">No campaigns found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              You haven't posted any tasks matching this filter.
            </p>
            <div className="mt-5">
              <Link to="/user/social-works/create">
                <Button className="bg-teal-600 hover:bg-teal-700 normal-case text-xs px-5 py-2.5 rounded-xl text-white font-bold">
                  Create a Campaign
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => {
              const progress = task.targetQuantity
                ? Math.min(100, Math.round(((task.completedQuantity || 0) / task.targetQuantity) * 100))
                : 0;

              const targetUrl = task.taskUrl || task.url;
              const isCancellable = ["ACTIVE", "active", "PENDING_APPROVAL"].includes(task.status);

              return (
                <Card
                  key={task._id}
                  className="p-5 sm:p-6 rounded-3xl border border-gray-200/80 bg-white hover:shadow-md transition-all space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-extrabold text-xs uppercase shrink-0">
                        {task.platform?.slice(0, 2) || "SO"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                            {task.title}
                          </h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Created {moment(task.createdAt).fromNow()} · Platform:{" "}
                          <span className="font-semibold capitalize text-gray-700">{task.platform}</span> (
                          {task.actionType?.replace("_", " ")})
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-xs font-bold text-gray-900">
                        Budget: ৳{(task.totalBudget || (task.costPerUnit * task.targetQuantity) || 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Escrow Remaining: ৳{(task.escrowRemaining || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Capacity */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                      <span>
                        Capacity: <strong className="text-teal-700">{task.completedQuantity || 0}</strong> /{" "}
                        {task.targetQuantity} Completed
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} size="sm" color="teal" />
                  </div>

                  {/* Rejection Alert if Rejected */}
                  {task.status === "REJECTED" && task.rejectionReason && (
                    <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-100">
                      <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Admin Rejection Reason:</strong>
                        <span>{task.rejectionReason} (Escrow was automatically refunded to your account)</span>
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      {targetUrl && (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-semibold"
                        >
                          <span>Visit Target Link</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {task.status === "PENDING_APPROVAL" && (
                        <Link
                          to={`/user/social-works/create?edit=${task._id}`}
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-semibold"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                          <span>Edit Campaign</span>
                        </Link>
                      )}

                      {isCancellable && (
                        <button
                          type="button"
                          onClick={() => handleCancelTask(task._id)}
                          disabled={cancellingId === task._id}
                          className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" />
                          <span>Cancel & Refund Escrow</span>
                        </button>
                      )}
                    </div>

                    {/* Review Submissions Link Button */}
                    <Link to={`/user/social-works/task/${task._id}/submissions`}>
                      <Button
                        className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 normal-case text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all"
                      >
                        <span>Review Submissions</span>
                        {task.pendingSubmissions > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                            {task.pendingSubmissions}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySocialTasks;
