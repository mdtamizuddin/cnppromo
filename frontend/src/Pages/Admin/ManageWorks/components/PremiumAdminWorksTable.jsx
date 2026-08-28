import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@material-tailwind/react";
import {
  MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  ArrowTopRightOnSquareIcon, BriefcaseIcon, Squares2X2Icon,
  FunnelIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../../../../util/axios";
import { category } from "../../Works/AllWorks";
import WorkFormModal from "./WorkFormModal";
import {
  PageHeader, StatCard, StatGrid, TableCard, TableHead, EmptyState,
  SkeletonRows, IconAction, SegmentedTabs, InfiniteFooter, ACCENTS,
} from "../../../../Components/AdminLayout/_Ui/AdminUI";

const ACCENT = ACCENTS.amber;
const COLUMNS = ["Category", "Work", "Link", "Added", ""];

// `category` is the single source of truth for what values are actually stored
// on a Work — filtering by a prettified label instead of `path` silently
// matches nothing, since the Mongo query is case-sensitive.
const filterTabs = category
  .filter((c) => c.path)
  .map((c) => ({ key: c.path, label: `${c.icon} ${c.name}` }));

const categoryMeta = (path) =>
  category.find((c) => c.path === path) || { name: path, icon: "📌" };

/** "2y" / "3mo" / "5d" — short enough to sit in a stat tile. */
const compactAge = (date) => {
  if (!date) return "—";
  const d = moment(date);
  const units = [["y", "years"], ["mo", "months"], ["d", "days"], ["h", "hours"]];
  for (const [suffix, unit] of units) {
    const n = moment().diff(d, unit);
    if (n >= 1) return `${n}${suffix}`;
  }
  return "just now";
};

const PremiumAdminWorksTable = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [formWork, setFormWork] = useState(null); // { } for create, work for edit
  const [deletingId, setDeletingId] = useState(null);
  const { ref: desktopRef, inView: desktopInView } = useInView();
  const { ref: mobileRef, inView: mobileInView } = useInView();

  const limit = 50;

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["Premium Admin Works Table", selectedCategory, search],
      async ({ pageParam = 1 }) => {
        let url = `/work?page=${pageParam}&limit=${limit}`;
        if (selectedCategory !== "all") url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const res = await api.get(url);
        return res.data;
      },
      { getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined) }
    );

  useEffect(() => {
    if ((desktopInView || mobileInView) && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [desktopInView, mobileInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allWorks = useMemo(() => data?.pages.flatMap((p) => p.works) || [], [data]);
  const total = data?.pages[0]?.total || 0;
  const isFiltered = selectedCategory !== "all" || Boolean(search);
  const categoriesInUse = useMemo(
    () => new Set(allWorks.map((w) => w.category)).size,
    [allWorks]
  );
  const latest = allWorks[0];
  const activeFilterLabel = [
    selectedCategory !== "all" ? categoryMeta(selectedCategory).name : null,
    search ? `“${search}”` : null,
  ].filter(Boolean).join(" · ");

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleDelete = async (work) => {
    if (!window.confirm(`Delete "${work.name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(work._id);
      await api.delete(`/work/${work._id}`);
      toast.success("Work deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete work");
    } finally {
      setDeletingId(null);
    }
  };

  const showEmpty = !isLoading && allWorks.length === 0;

  return (
    <div className="w-full pb-10">
      <PageHeader
        icon={BriefcaseIcon}
        accent="amber"
        title="Manage Works"
        subtitle="Add, edit, or remove the task links and tutorials shown to users."
        action={
          <Button
            size="sm"
            onClick={() => setFormWork({})}
            className={`normal-case text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
          >
            <PlusIcon className="w-4 h-4" strokeWidth={2.2} />
            Add New Work
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          title="Total Works"
          value={total}
          hint={isFiltered ? "matching filters" : "all categories"}
          icon={BriefcaseIcon}
          colorClass="text-amber-500"
          bgClass="bg-amber-50"
        />
        <StatCard
          title="Categories"
          value={categoriesInUse}
          hint={`of ${filterTabs.length - 1} available`}
          icon={Squares2X2Icon}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-50"
        />
        <StatCard
          title="Showing"
          value={allWorks.length}
          hint={isFiltered ? activeFilterLabel : "no filters"}
          icon={FunnelIcon}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Last Added"
          value={compactAge(latest?.createdAt)}
          hint={latest ? moment(latest.createdAt).format("MMM DD, YYYY") : "no works yet"}
          icon={PlusIcon}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
        />
      </StatGrid>

      <TableCard
        toolbar={
          <>
            <form onSubmit={submitSearch} className="relative w-full lg:w-72 lg:shrink-0">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title, description or link…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:bg-white transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="w-full lg:flex-1 lg:min-w-0">
              <SegmentedTabs
                fullWidth
                accent="amber"
                tabs={filterTabs}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
          </>
        }
      >
        {/* ── Desktop table ───────────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[820px] table-auto text-left">
            <TableHead columns={COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <SkeletonRows rows={6} cols={COLUMNS.length} />
              ) : (
                allWorks.map((work) => {
                  const meta = categoryMeta(work.category);
                  return (
                    <tr key={work._id} className={`${ACCENT.row} transition-colors group`}>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 ring-1 ring-amber-100 rounded-lg text-[11px] font-bold">
                          <span aria-hidden>{meta.icon}</span>
                          {meta.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top max-w-md">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{work.name}</p>
                        {work.desc && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{work.desc}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <a
                          href={work.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          Open
                        </a>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="text-xs text-gray-500" title={moment(work.createdAt).format("lll")}>
                          {moment(work.createdAt).format("MMM DD, YYYY")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex justify-end gap-0.5">
                          <IconAction icon={PencilSquareIcon} label="Edit work" tone="blue" onClick={() => setFormWork(work)} />
                          <IconAction
                            icon={TrashIcon}
                            label="Delete work"
                            tone="red"
                            disabled={deletingId === work._id}
                            onClick={() => handleDelete(work)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {!showEmpty && (
                <InfiniteFooter
                  ref={desktopRef}
                  colSpan={COLUMNS.length}
                  isFetching={isFetchingNextPage}
                  hasNext={hasNextPage}
                  isEmpty={allWorks.length === 0}
                />
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ────────────────────────────────────────────── */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 rounded-full bg-gray-200/80 animate-pulse" />
                  <div className="h-3 w-3/4 rounded-full bg-gray-200/80 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            allWorks.map((work) => {
              const meta = categoryMeta(work.category);
              return (
                <div key={work._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 ring-1 ring-amber-100 rounded-lg text-[10px] font-bold">
                      <span aria-hidden>{meta.icon}</span>
                      {meta.name}
                    </span>
                    <div className="flex gap-0.5 -mr-2 -mt-1.5">
                      <IconAction icon={PencilSquareIcon} label="Edit work" tone="blue" onClick={() => setFormWork(work)} />
                      <IconAction
                        icon={TrashIcon}
                        label="Delete work"
                        tone="red"
                        disabled={deletingId === work._id}
                        onClick={() => handleDelete(work)}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-2">{work.name}</p>
                  {work.desc && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{work.desc}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Open link
                    </a>
                    <span className="text-[11px] text-gray-400">{moment(work.createdAt).format("MMM DD, YYYY")}</span>
                  </div>
                </div>
              );
            })
          )}
          {!showEmpty && !isLoading && (
            <div ref={mobileRef} className="py-4 text-center">
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

        {showEmpty && (
          <EmptyState
            icon={BriefcaseIcon}
            title={isFiltered ? "No works match these filters" : "No works yet"}
            message={
              isFiltered
                ? "Try a different category, or clear the search to see everything."
                : "Add your first task link and it will show up here."
            }
            action={
              isFiltered ? (
                <Button
                  size="sm"
                  variant="outlined"
                  color="gray"
                  className="normal-case rounded-xl"
                  onClick={() => { setSelectedCategory("all"); clearSearch(); }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setFormWork({})}
                  className={`normal-case rounded-xl ${ACCENT.solid} shadow-md ${ACCENT.shadow}`}
                >
                  Add New Work
                </Button>
              )
            }
          />
        )}
      </TableCard>

      {formWork && (
        <WorkFormModal
          editData={formWork._id ? formWork : null}
          onClose={() => setFormWork(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default PremiumAdminWorksTable;
