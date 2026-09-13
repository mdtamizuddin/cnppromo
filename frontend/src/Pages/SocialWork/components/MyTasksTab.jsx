import React, { useState } from "react";
import { useQuery } from "react-query";
import { Card, Button, Typography, Progress } from "@material-tailwind/react";
import {
  PlusIcon,
  SparklesIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  InboxIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import { api } from "../../../util/axios";
import ProviderSubmissionsModal from "./ProviderSubmissionsModal";

const MyTasksTab = ({ onOpenCreateModal }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: myTasks, isLoading, refetch } = useQuery({
    queryKey: ["my-social-tasks"],
    queryFn: async () => {
      const res = await api.get("social-works/my-tasks");
      return res.data;
    },
  });

  const getStatusBadge = (task) => {
    switch (task.status) {
      case "ACTIVE":
      case "active":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Under Review</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Rejected</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{task.status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-gray-400 font-medium">
        Loading your tasks…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-white to-sky-500/10 border border-teal-100">
        <div>
          <h3 className="text-base font-bold text-gray-900">Task Provider Dashboard</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your created campaigns, monitor real-time progress, and review worker proofs
          </p>
        </div>
        <Button
          onClick={onOpenCreateModal}
          className="bg-gradient-to-r from-teal-600 to-sky-600 text-white normal-case font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Post New Task</span>
        </Button>
      </div>

      {/* Task List */}
      {!myTasks || myTasks.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border border-gray-100 shadow-sm bg-white">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
            📋
          </div>
          <h4 className="text-sm font-bold text-gray-800">You haven't created any tasks yet</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Get followers, likes, comments, or watch time for your channels by posting a task.
          </p>
          <div className="mt-5">
            <Button
              onClick={onOpenCreateModal}
              className="bg-teal-600 hover:bg-teal-700 normal-case text-xs px-5 py-2 rounded-xl text-white font-bold"
            >
              Post a Task Now
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myTasks.map((task) => {
            const progress = task.targetQuantity
              ? Math.min(100, Math.round(((task.completedQuantity || 0) / task.targetQuantity) * 100))
              : 0;

            const targetUrl = task.taskUrl || task.url;

            return (
              <Card
                key={task._id}
                className="p-5 rounded-2xl border border-gray-200/80 bg-white hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">
                      {task.platform?.slice(0, 2) || "SO"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{task.title}</h4>
                        {getStatusBadge(task)}
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Created {moment(task.createdAt).fromNow()} · Platform: <span className="font-semibold capitalize text-gray-700">{task.platform}</span> ({task.actionType})
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-gray-900">
                      Budget: ৳{(task.totalBudget || (task.costPerUnit * task.targetQuantity) || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Escrow Remaining: ৳{(task.escrowRemaining || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Quantity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                    <span>
                      Progress: <strong className="text-teal-700">{task.completedQuantity || 0}</strong> / {task.targetQuantity} Completed
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} size="sm" color="teal" />
                </div>

                {/* Rejection Message if Rejected */}
                {task.status === "REJECTED" && task.rejectionReason && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-100">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Admin Rejection Reason:</strong>
                      <span>{task.rejectionReason} (Escrow was automatically refunded to your balance)</span>
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {targetUrl ? (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-semibold"
                    >
                      <span>Visit Target Link</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : <span />}

                  <Button
                    onClick={() => setSelectedTask(task)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 normal-case text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all"
                  >
                    <span>Review Submissions</span>
                    {task.pendingSubmissions > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                        {task.pendingSubmissions}
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Provider Submissions Review Modal */}
      {selectedTask && (
        <ProviderSubmissionsModal
          open={Boolean(selectedTask)}
          onClose={() => {
            setSelectedTask(null);
            refetch();
          }}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default MyTasksTab;
