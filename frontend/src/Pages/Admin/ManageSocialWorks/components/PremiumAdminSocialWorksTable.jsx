import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  PlayCircleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useQuery, useInfiniteQuery, useQueryClient } from "react-query";
import { useInView } from "react-intersection-observer";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import SubmissionReviewModal from "./SubmissionReviewModal";
import DeleteConfirmModal from "../../../../Components/DeleteConfirmModal";
import {
  PageHeader,
  StatCard,
  StatGrid,
  TableCard,
  TableHead,
  EmptyState,
  SkeletonRows,
  IconAction,
  SegmentedTabs,
  StatusPill,
  InfiniteFooter,
  ACCENTS,
} from "../../../../Components/AdminLayout/_Ui/AdminUI";

const ACCENT = ACCENTS.teal;
const WORK_COLUMNS = ["Platform / Task", "Provider", "Target Qty", "Unit Cost", "Escrow Budget", "Status", "Actions"];
const SUBMIT_COLUMNS = ["Worker", "Task", "Gross / Net", "Submitted", "Status", ""];

const PremiumAdminSocialWorksTable = () => {
  const [activeTab, setActiveTab] = useState("works");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitStatus, setSubmitStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [reviewSubmit, setReviewSubmit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Moderation state
  const [moderatingTaskId, setModeratingTaskId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Commission Settings state
  const [commissionRate, setCommissionRate] = useState(10);
  const [savingCommission, setSavingCommission] = useState(false);

  const queryClient = useQueryClient();
  const { ref: subsDesktopRef, inView: subsDesktopInView } = useInView();

  // 1. Fetch All Tasks
  const {
    data: works,
    isLoading: worksLoading,
    refetch: refetchWorks,
    isFetching: worksFetching,
  } = useQuery(
    ["admin-social-works"],
    async () => (await api.get("social-works/all")).data,
    { staleTime: 15000 }
  );

  // 2. Fetch Marketplace Analytics
  const { data: analytics } = useQuery(
    ["admin-social-analytics"],
    async () => (await api.get("social-works/admin/analytics")).data,
    { staleTime: 15000 }
  );

  // 3. Fetch Site Settings for Commission %
  const { data: settingData } = useQuery(
    ["admin-setting-commission"],
    async () => (await api.get("setting")).data,
    {
      staleTime: 60000,
      onSuccess: (data) => {
        if (typeof data?.taskCommissionPercentage === "number") {
          setCommissionRate(data.taskCommissionPercentage);
        }
      },
    }
  );

  // 4. Fetch Submissions Stream
  const {
    data: subsPages,
    isLoading: subsLoading,
    isFetching: subsFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["admin-social-work-submits", submitStatus],
    async ({ pageParam = 1 }) =>
      (await api.get(`social-works/all-submits?status=${submitStatus}&page=${pageParam}&limit=50`)).data,
    {
      getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
      staleTime: 30000,
    }
  );

  const submissions = useMemo(
    () => subsPages?.pages.flatMap((p) => p.data) || [],
    [subsPages]
  );

  const pendingModerationCount = useMemo(
    () => (works || []).filter((w) => w.status === "PENDING_APPROVAL").length,
    [works]
  );

  const term = search.trim().toLowerCase();
  const visibleWorks = useMemo(() => {
    let list = works || [];
    if (statusFilter !== "all") {
      list = list.filter((w) => {
        if (statusFilter === "PENDING_APPROVAL") return w.status === "PENDING_APPROVAL";
        if (statusFilter === "ACTIVE") return w.status === "ACTIVE" || w.status === "active";
        if (statusFilter === "REJECTED") return w.status === "REJECTED";
        if (statusFilter === "COMPLETED") return w.status === "COMPLETED";
        return true;
      });
    }
    if (term) {
      list = list.filter(
        (w) =>
          w.title?.toLowerCase().includes(term) ||
          w.platform?.toLowerCase().includes(term) ||
          w.providerId?.name?.toLowerCase().includes(term) ||
          w.providerId?.username?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [works, statusFilter, term]);

  const refreshAll = () => {
    refetchWorks();
    queryClient.invalidateQueries(["admin-social-analytics"]);
    queryClient.invalidateQueries(["admin-social-work-submits"]);
  };

  // Moderation Handler
  const handleModerate = async (taskId, action, reason = "") => {
    try {
      setModeratingTaskId(taskId);
      await api.put(`social-works/admin/moderate/${taskId}`, {
        action,
        rejectionReason: reason,
      });

      if (action === "APPROVE") {
        toast.success("Task approved and active in marketplace!");
      } else {
        toast.success("Task rejected and remaining escrow refunded to provider!");
        setRejectModalOpen(false);
        setRejectingTask(null);
        setRejectionReason("");
      }

      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to moderate task");
    } finally {
      setModeratingTaskId(null);
    }
  };

  // Delete Task Handler
  const handleDeleteWork = async (work) => {
    try {
      setDeletingId(work._id);
      await api.delete(`social-works/${work._id}`);
      toast.success("Task deleted");
      refreshAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // Save Commission Rate
  const handleSaveCommission = async (e) => {
    e.preventDefault();
    try {
      setSavingCommission(true);
      await api.put("setting", {
        taskCommissionPercentage: parseFloat(commissionRate) || 10,
      });
      toast.success("Platform commission percentage updated!");
      queryClient.invalidateQueries(["admin-setting-commission"]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update commission");
    } finally {
      setSavingCommission(false);
    }
  };

  useEffect(() => {
    if (subsDesktopInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [subsDesktopInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full pb-10">
      <PageHeader
        icon={ClipboardDocumentCheckIcon}
        accent="teal"
        title="Social Tasks Marketplace"
        subtitle="Moderate user-created tasks, configure platform commission, and inspect submissions."
        action={
          <div className="flex items-center gap-2">
            <IconAction
              icon={ArrowPathIcon}
              label="Refresh"
              tone="teal"
              onClick={refreshAll}
              disabled={worksFetching || subsFetching}
            />
          </div>
        }
      />

      {/* Analytics KPI Stat Grid */}
      <StatGrid>
        <StatCard
          title="Platform Profit"
          value={`৳${(analytics?.totalPlatformProfit || 0).toFixed(2)}`}
          hint="From completed tasks"
          icon={BanknotesIcon}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
        />
        <StatCard
          title="Marketplace Volume"
          value={`৳${(analytics?.totalMarketplaceVolume || 0).toFixed(2)}`}
          hint="Total task spend"
          icon={SparklesIcon}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-50"
        />
        <StatCard
          title="Active Escrow in Hold"
          value={`৳${(analytics?.activeEscrowHeld || 0).toFixed(2)}`}
          hint="Guaranteed in circulation"
          icon={CheckBadgeIcon}
          colorClass="text-teal-500"
          bgClass="bg-teal-50"
        />
        <StatCard
          title="Awaiting Moderation"
          value={pendingModerationCount}
          hint={pendingModerationCount ? "Action required" : "All tasks reviewed"}
          icon={InboxIcon}
          colorClass="text-amber-500"
          bgClass="bg-amber-50"
        />
      </StatGrid>

      {/* Tabs Switcher */}
      <div className="mb-5">
        <SegmentedTabs
          accent="teal"
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { key: "works", label: "Tasks & Moderation", count: works?.length || 0 },
            { key: "submissions", label: "Worker Submissions", count: submissions.length },
            { key: "commission", label: "Platform Commission & Revenue" },
          ]}
        />
      </div>

      {/* ══ TAB 1: Tasks & Moderation ═════════════════════════════════════ */}
      {activeTab === "works" && (
        <TableCard
          toolbar={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <div className="relative w-full sm:w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, platform, provider…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                {["all", "PENDING_APPROVAL", "ACTIVE", "REJECTED", "COMPLETED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      statusFilter === st
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {st === "PENDING_APPROVAL" ? "Pending Approval" : st === "all" ? "All Tasks" : st}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <TableHead columns={WORK_COLUMNS} />
              <tbody className="divide-y divide-gray-100">
                {worksLoading ? (
                  <SkeletonRows cols={7} rows={5} />
                ) : visibleWorks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <EmptyState
                        icon={ClipboardDocumentCheckIcon}
                        title="No tasks found"
                        subtitle="No tasks match the active filter criteria."
                      />
                    </td>
                  </tr>
                ) : (
                  visibleWorks.map((task) => {
                    const isPending = task.status === "PENDING_APPROVAL";
                    const isModding = moderatingTaskId === task._id;

                    return (
                      <tr key={task._id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Platform / Task */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                              {task.platform}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1 max-w-xs">{task.title}</p>
                              <p className="text-[10px] text-gray-400 capitalize">{task.actionType?.replace("_", " ")}</p>
                            </div>
                          </div>
                        </td>

                        {/* Provider */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-800">{task.providerId?.name || "System"}</p>
                          <p className="text-[10px] text-gray-400">@{task.providerId?.username || "admin"}</p>
                        </td>

                        {/* Target Qty */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-800">{task.completedQuantity || 0}</span>
                          <span className="text-gray-400"> / {task.targetQuantity}</span>
                        </td>

                        {/* Unit Cost */}
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ৳{(task.costPerUnit || task.price || 0).toFixed(2)}
                        </td>

                        {/* Escrow Budget */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-teal-700">
                            ৳{(task.totalBudget || (task.costPerUnit * task.targetQuantity) || 0).toFixed(2)}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            Hold: ৳{(task.escrowRemaining || 0).toFixed(2)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <StatusPill
                            tone={
                              task.status === "ACTIVE" || task.status === "active"
                                ? "green"
                                : task.status === "PENDING_APPROVAL"
                                ? "amber"
                                : task.status === "REJECTED"
                                ? "red"
                                : "blue"
                            }
                          >
                            {task.status === "PENDING_APPROVAL" ? "Pending" : task.status}
                          </StatusPill>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleModerate(task._id, "APPROVE")}
                                  disabled={isModding}
                                  className="normal-case text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 font-bold shadow-xs"
                                >
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  color="red"
                                  onClick={() => {
                                    setRejectingTask(task);
                                    setRejectModalOpen(true);
                                  }}
                                  disabled={isModding}
                                  className="normal-case text-xs px-2 py-1.5 rounded-lg flex items-center gap-1"
                                >
                                  <XCircleIcon className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </Button>
                              </>
                            ) : (
                              <IconAction
                                icon={TrashIcon}
                                label="Delete"
                                tone="red"
                                onClick={() => setDeleteTarget(task)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TableCard>
      )}

      {/* ══ TAB 2: Worker Submissions ═════════════════════════════════════ */}
      {activeTab === "submissions" && (
        <TableCard
          toolbar={
            <div className="flex items-center justify-between gap-3 w-full">
              <span className="text-xs font-bold text-gray-700">Filter Submissions by Status:</span>
              <div className="flex gap-1.5">
                {["pending", "completed", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSubmitStatus(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                      submitStatus === st
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <TableHead columns={SUBMIT_COLUMNS} />
              <tbody className="divide-y divide-gray-100">
                {subsLoading ? (
                  <SkeletonRows cols={6} rows={5} />
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <EmptyState
                        icon={InboxIcon}
                        title="No submissions found"
                        subtitle={`There are currently no ${submitStatus} submissions.`}
                      />
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr
                      key={sub._id}
                      onClick={() => setReviewSubmit(sub)}
                      className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {sub.userId?.name || "Worker"}
                        <span className="block text-[10px] font-normal text-gray-400">
                          @{sub.userId?.username || "user"}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate font-medium text-gray-800">
                        {sub.workId?.title || "Social Task"}
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-900">
                        ৳{(sub.netAmount || sub.workId?.price || 0).toFixed(2)}
                        {sub.platformFee > 0 && (
                          <span className="block text-[10px] font-normal text-teal-600">
                            Fee: ৳{sub.platformFee.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {moment(sub.createdAt).fromNow()}
                      </td>

                      <td className="py-3 px-4">
                        <StatusPill
                          tone={
                            ["APPROVED", "completed"].includes(sub.status)
                              ? "green"
                              : ["REJECTED", "rejected"].includes(sub.status)
                              ? "red"
                              : "amber"
                          }
                        >
                          {sub.status}
                        </StatusPill>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="text"
                          className="normal-case text-xs text-teal-700 font-bold hover:bg-teal-50 rounded-lg"
                        >
                          Inspect Proof ↗
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div ref={subsDesktopRef}>
            <InfiniteFooter
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              count={submissions.length}
            />
          </div>
        </TableCard>
      )}

      {/* ══ TAB 3: Platform Commission & Revenue ═════════════════════════ */}
      {activeTab === "commission" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <form
            onSubmit={handleSaveCommission}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-5"
          >
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Global Platform Commission</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Set the percentage deducted automatically from each completed task as platform profit.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Platform Commission Rate (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-36 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <span className="text-sm font-bold text-gray-600">% per completed task</span>
              </div>
            </div>

            {/* Hidden Calculation Demonstration Box */}
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2 text-xs">
              <p className="font-bold text-teal-900">How Hidden Commission Works (Invisible to Users):</p>
              <ul className="space-y-1 text-gray-600 list-disc list-inside text-[11px]">
                <li>Provider creates task for <strong>৳2.00 BDT</strong> per subscriber.</li>
                <li>
                  Worker browses feed and sees Net Earnings:{" "}
                  <strong className="text-emerald-700">
                    ৳{(2 * (1 - (commissionRate || 10) / 100)).toFixed(2)} BDT
                  </strong>
                  .
                </li>
                <li>
                  Platform automatically retains profit:{" "}
                  <strong className="text-teal-700">
                    ৳{(2 * ((commissionRate || 10) / 100)).toFixed(2)} BDT
                  </strong>
                  .
                </li>
                <li>Neither user sees the fee percentage or raw calculation formula.</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button
                type="submit"
                disabled={savingCommission}
                className="bg-teal-600 hover:bg-teal-700 text-white normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
              >
                {savingCommission ? "Saving…" : "Save Commission Rate"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Moderation Rejection Modal */}
      {rejectModalOpen && rejectingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Reject Task & Refund Escrow</h3>
            <p className="text-xs text-gray-500">
              Rejecting "{rejectingTask.title}" will immediately refund ৳
              {(rejectingTask.escrowRemaining || 0).toFixed(2)} back to provider @
              {rejectingTask.providerId?.username}'s account balance.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Rejection Reason for Provider *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Inappropriate task content or broken target URL..."
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectingTask(null);
                  setRejectionReason("");
                }}
                className="normal-case text-xs text-gray-500 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color="red"
                onClick={() => handleModerate(rejectingTask._id, "REJECT", rejectionReason)}
                disabled={!rejectionReason.trim() || moderatingTaskId === rejectingTask._id}
                className="normal-case text-xs rounded-xl font-bold"
              >
                Confirm Reject & Refund
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewSubmit && (
        <SubmissionReviewModal
          submit={reviewSubmit}
          onClose={() => setReviewSubmit(null)}
          onSuccess={refreshAll}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteWork(deleteTarget)}
          loading={deletingId === deleteTarget?._id}
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTarget.title}"? Any remaining escrow will be returned to the provider.`}
        />
      )}
    </div>
  );
};

export default PremiumAdminSocialWorksTable;
