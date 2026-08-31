import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import {
  PlusIcon, PencilSquareIcon, TrashIcon, ClockIcon, BanknotesIcon,
  ClipboardDocumentCheckIcon, PlayCircleIcon, InboxIcon, MagnifyingGlassIcon,
  XMarkIcon, CheckBadgeIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useQuery, useInfiniteQuery, useQueryClient } from "react-query";
import { useInView } from "react-intersection-observer";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import SocialWorkFormModal from "./SocialWorkFormModal";
import SubmissionReviewModal from "./SubmissionReviewModal";
import DeleteConfirmModal from "../../../../Components/DeleteConfirmModal";
import { youtubeThumb } from "./youtube";
import {
  PageHeader, StatCard, StatGrid, TableCard, TableHead, EmptyState,
  SkeletonRows, IconAction, SegmentedTabs, StatusPill, InfiniteFooter, ACCENTS,
} from "../../../../Components/AdminLayout/_Ui/AdminUI";

const ACCENT = ACCENTS.teal;
const WORK_COLUMNS = ["Task", "Duration", "Reward", "Status", "Pending", ""];
const SUBMIT_COLUMNS = ["User", "Task", "Watched", "Submitted", ""];

const formatDuration = (sec) => {
  if (!sec && sec !== 0) return "—";
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return `${sec}s`;
};

/** Small video thumbnail with a play glyph, falling back to a plain tile. */
const Thumb = ({ url }) => {
  const src = youtubeThumb(url);
  return (
    <div className="relative shrink-0 w-16 h-10 rounded-lg overflow-hidden bg-gray-100 grid place-items-center">
      {src ? (
        <>
          <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
          <PlayCircleIcon className="absolute w-5 h-5 text-white/90 drop-shadow" />
        </>
      ) : (
        <PlayCircleIcon className="w-5 h-5 text-gray-300" />
      )}
    </div>
  );
};

const PremiumAdminSocialWorksTable = () => {
  const [activeTab, setActiveTab] = useState("works");
  const [submitStatus, setSubmitStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [formWork, setFormWork] = useState(null);
  const [reviewSubmit, setReviewSubmit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();
  const { ref: subsDesktopRef, inView: subsDesktopInView } = useInView();
  const { ref: subsMobileRef, inView: subsMobileInView } = useInView();

  const {
    data: works,
    isLoading: worksLoading,
    refetch: refetchWorks,
    isFetching: worksFetching,
  } = useQuery(
    ["admin-social-works"],
    async () => (await api.get("social-works/all")).data,
    { staleTime: 30000 }
  );

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

  // The pending badge and payout total must not move when the reviewer switches
  // the list filter to "completed", so they come from their own tiny query.
  const { data: pendingMeta } = useQuery(
    ["admin-social-work-pending-meta"],
    async () => (await api.get("social-works/all-submits?status=pending&page=1&limit=1")).data,
    { staleTime: 30000 }
  );

  const activeWorks = useMemo(
    () => (works || []).filter((w) => w.status === "active").length,
    [works]
  );
  const submissions = useMemo(
    () => subsPages?.pages.flatMap((p) => p.data) || [],
    [subsPages]
  );
  const submissionTotal = subsPages?.pages[0]?.total || 0;
  const pendingCount = pendingMeta?.total || 0;
  const pendingPayout = pendingMeta?.totalAmount || 0;

  const term = search.trim().toLowerCase();
  const visibleWorks = useMemo(() => {
    if (!term) return works || [];
    return (works || []).filter(
      (w) =>
        w.title?.toLowerCase().includes(term) ||
        w.description?.toLowerCase().includes(term)
    );
  }, [works, term]);

  const refreshAll = () => {
    refetchWorks();
    queryClient.invalidateQueries(["admin-social-work-submits"]);
    queryClient.invalidateQueries(["admin-social-work-pending-meta"]);
  };

  const handleDeleteWork = async (work) => {
    try {
      setDeletingId(work._id);
      await api.delete(`social-works/${work._id}`);
      toast.success("Work deleted");
      refetchWorks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const worksEmpty = !worksLoading && visibleWorks.length === 0;
  const subsEmpty = !subsLoading && submissions.length === 0;

  useEffect(() => {
    if ((subsDesktopInView || subsMobileInView) && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [subsDesktopInView, subsMobileInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full pb-10">
      <PageHeader
        icon={ClipboardDocumentCheckIcon}
        accent="teal"
        title="Manage Social Works"
        subtitle="Create watch-to-earn video tasks and review what users submit."
        action={
          <div className="flex items-center gap-2">
            <IconAction
              icon={ArrowPathIcon}
              label="Refresh"
              tone="teal"
              onClick={refreshAll}
              disabled={worksFetching || subsFetching}
            />
            <Button
              size="sm"
              onClick={() => setFormWork({})}
              className={`normal-case text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
            >
              <PlusIcon className="w-4 h-4" strokeWidth={2.2} />
              Add Social Work
            </Button>
          </div>
        }
      />

      <StatGrid>
        <StatCard
          title="Active Tasks"
          value={activeWorks}
          hint={`${(works?.length || 0) - activeWorks} inactive`}
          icon={CheckBadgeIcon}
          colorClass="text-teal-500"
          bgClass="bg-teal-50"
        />
        <StatCard
          title="Total Tasks"
          value={works?.length || 0}
          hint="watch-to-earn"
          icon={PlayCircleIcon}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-50"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          hint={pendingCount ? "awaiting review" : "all caught up"}
          icon={InboxIcon}
          colorClass="text-amber-500"
          bgClass="bg-amber-50"
        />
        <StatCard
          title="Pending Payout"
          value={`৳${pendingPayout}`}
          hint="if all approved"
          icon={BanknotesIcon}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
        />
      </StatGrid>

      <div className="mb-5">
        <SegmentedTabs
          accent="teal"
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { key: "works", label: "Tasks", count: works?.length || 0 },
            { key: "submissions", label: "Submissions", count: pendingCount },
          ]}
        />
      </div>

      {/* ══ Tasks ══════════════════════════════════════════════════════ */}
      {activeTab === "works" && (
        <TableCard
          toolbar={
            <>
              <div className="relative w-full lg:w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:bg-white transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className={ACCENT.text}>{visibleWorks.length}</span> of {works?.length || 0}
              </p>
            </>
          }
        >
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[860px] table-auto text-left">
              <TableHead columns={WORK_COLUMNS} />
              <tbody className="divide-y divide-gray-100">
                {worksLoading ? (
                  <SkeletonRows rows={5} cols={WORK_COLUMNS.length} />
                ) : (
                  visibleWorks.map((work) => (
                    <tr key={work._id} className={`${ACCENT.row} transition-colors group`}>
                      <td className="px-4 py-3.5 align-top max-w-sm">
                        <div className="flex items-start gap-3">
                          <Thumb url={work.url} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{work.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{work.description}</p>
                            {work.questions?.length > 0 && (
                              <p className="text-[11px] text-gray-400 mt-1">
                                {work.questions.length} question{work.questions.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          {formatDuration(work.duration)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="text-sm font-bold text-emerald-600">৳{work.price}</span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <StatusPill tone={work.status === "active" ? "green" : "gray"}>{work.status}</StatusPill>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        {work.count > 0 ? (
                          <button
                            type="button"
                            onClick={() => { setSubmitStatus("pending"); setActiveTab("submissions"); }}
                            className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:underline"
                          >
                            {work.count} pending
                          </button>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex justify-end gap-0.5">
                          <IconAction icon={PencilSquareIcon} label="Edit task" tone="blue" onClick={() => setFormWork(work)} />
                          <IconAction
                            icon={TrashIcon}
                            label="Delete task"
                            tone="red"
                            disabled={deletingId === work._id}
                            onClick={() => setDeleteTarget(work)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {worksLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-10 rounded-lg bg-gray-200/80 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded-full bg-gray-200/80 animate-pulse" />
                      <div className="h-3 w-1/2 rounded-full bg-gray-200/80 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              visibleWorks.map((work) => (
                <div key={work._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Thumb url={work.url} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{work.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{work.description}</p>
                    </div>
                    <div className="flex gap-0.5 -mr-2 -mt-1.5 shrink-0">
                      <IconAction icon={PencilSquareIcon} label="Edit task" tone="blue" onClick={() => setFormWork(work)} />
                      <IconAction
                        icon={TrashIcon}
                        label="Delete task"
                        tone="red"
                        disabled={deletingId === work._id}
                        onClick={() => setDeleteTarget(work)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mt-3">
                    <StatusPill tone={work.status === "active" ? "green" : "gray"}>{work.status}</StatusPill>
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      {formatDuration(work.duration)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">৳{work.price}</span>
                    {work.count > 0 && (
                      <span className="text-[11px] font-bold text-amber-600">{work.count} pending</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {worksEmpty && (
            <EmptyState
              icon={PlayCircleIcon}
              title={term ? "No tasks match your search" : "No social works yet"}
              message={
                term
                  ? "Try a different keyword, or clear the search."
                  : "Create your first watch-to-earn video task to get started."
              }
              action={
                term ? (
                  <Button size="sm" variant="outlined" color="gray" className="normal-case rounded-xl" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setFormWork({})}
                    className={`normal-case rounded-xl ${ACCENT.solid} shadow-md ${ACCENT.shadow}`}
                  >
                    Add Social Work
                  </Button>
                )
              }
            />
          )}
        </TableCard>
      )}

      {/* ══ Submissions ════════════════════════════════════════════════ */}
      {activeTab === "submissions" && (
        <TableCard
          toolbar={
            <>
              <SegmentedTabs
                accent="teal"
                value={submitStatus}
                onChange={setSubmitStatus}
                tabs={[
                  { key: "pending", label: "Pending" },
                  { key: "completed", label: "Approved" },
                  { key: "rejected", label: "Rejected" },
                ]}
              />
              <p className="text-xs font-semibold text-gray-500 shrink-0">
                <span className={ACCENT.text}>{submissionTotal}</span> submission
                {submissionTotal === 1 ? "" : "s"}
              </p>
            </>
          }
        >
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[760px] table-auto text-left">
              <TableHead columns={SUBMIT_COLUMNS} />
              <tbody className="divide-y divide-gray-100">
                {subsLoading ? (
                  <SkeletonRows rows={5} cols={SUBMIT_COLUMNS.length} />
                ) : (
                  submissions.map((sub) => {
                    const short = sub.workId?.duration && sub.duration < sub.workId.duration;
                    return (
                      <tr key={sub._id} className={`${ACCENT.row} transition-colors group`}>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-gray-900">{sub.userId?.name || "—"}</p>
                          {sub.userId?.username && (
                            <p className="text-xs text-gray-500">@{sub.userId.username}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{sub.workId?.title}</p>
                          <p className="text-xs font-bold text-emerald-600 mt-0.5">৳{sub.workId?.price ?? 0}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-sm ${short ? "text-amber-600 font-semibold" : "text-gray-700"}`}>
                            <ClockIcon className={`w-4 h-4 ${short ? "text-amber-500" : "text-gray-400"}`} />
                            {formatDuration(sub.duration)}
                          </span>
                          {sub.workId?.duration ? (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              of {formatDuration(sub.workId.duration)}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-500" title={moment(sub.createdAt).format("lll")}>
                            {moment(sub.createdAt).fromNow()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant={submitStatus === "pending" ? "filled" : "outlined"}
                              color="teal"
                              className="normal-case rounded-lg py-1.5 px-3.5 text-xs font-bold"
                              onClick={() => setReviewSubmit(sub)}
                            >
                              {submitStatus === "pending" ? "Review" : "View"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}

                {!subsEmpty && (
                  <InfiniteFooter
                    ref={subsDesktopRef}
                    colSpan={SUBMIT_COLUMNS.length}
                    isFetching={isFetchingNextPage}
                    hasNext={hasNextPage}
                    isEmpty={submissions.length === 0}
                  />
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {subsLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-1/3 rounded-full bg-gray-200/80 animate-pulse" />
                    <div className="h-3 w-2/3 rounded-full bg-gray-200/80 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              submissions.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() => setReviewSubmit(sub)}
                  className="w-full text-left p-4 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{sub.userId?.name || "—"}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{sub.workId?.title}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-emerald-600">৳{sub.workId?.price ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      {formatDuration(sub.duration)}
                    </span>
                    <span className="text-[11px] text-gray-400">{moment(sub.createdAt).fromNow()}</span>
                  </div>
                </button>
              ))
            )}
            {!subsEmpty && !subsLoading && (
              <div ref={subsMobileRef} className="py-4 text-center">
                {isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    Loading more…
                  </span>
                ) : (
                  <span className="text-xs text-gray-300">{hasNextPage ? "Scroll for more" : "End of list"}</span>
                )}
              </div>
            )}
          </div>

          {subsEmpty && (
            <EmptyState
              icon={InboxIcon}
              title={
                submitStatus === "pending"
                  ? "Nothing to review"
                  : `No ${submitStatus === "completed" ? "approved" : "rejected"} submissions`
              }
              message={
                submitStatus === "pending"
                  ? "Every submission has been handled. New ones will appear here."
                  : "Submissions you handle will be listed here."
              }
            />
          )}
        </TableCard>
      )}

      {formWork && (
        <SocialWorkFormModal
          editData={formWork._id ? formWork : null}
          onClose={() => setFormWork(null)}
          onSuccess={refetchWorks}
        />
      )}

      {reviewSubmit && (
        <SubmissionReviewModal
          submit={reviewSubmit}
          onClose={() => setReviewSubmit(null)}
          onSuccess={refreshAll}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteWork(deleteTarget)}
        title={`Delete "${deleteTarget?.title}"?`}
        message="আপনি কি নিশ্চিত যে এই টাস্কটি স্থায়ীভাবে মুছে ফেলতে চান? এই অ্যাকশনটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।"
        itemName={deleteTarget?.title}
        confirmText="Delete Task"
        loading={deletingId === deleteTarget?._id}
      />
    </div>
  );
};

export default PremiumAdminSocialWorksTable;
