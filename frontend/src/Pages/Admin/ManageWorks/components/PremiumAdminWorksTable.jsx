import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Option } from "@material-tailwind/react";
import { MagnifyingGlassIcon, PlusIcon, ChevronUpIcon, PencilSquareIcon, TrashIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import { api } from "../../../../util/axios";
import toast from "react-hot-toast";

// Import existing form and update dialog
import Form from "../../Works/Form";
import UpdateDialog from "../../Works/UpdateDialog";

const categoryList = [
  "All",
  "TikTop",
  "Youtube",
  "Facebook",
  "Likefollow",
  "Payup-video-views",
  "Bux-money",
  "Vk surfing",
  "IP web/Aviso",
];

const PremiumAdminWorksTable = () => {
  const [option] = useState({ limit: 50 });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editWork, setEditWork] = useState(null);
  const { ref, inView } = useInView();

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["Premium Admin Works Table", selectedCategory, option.limit],
    async ({ pageParam = 1 }) => {
      let url = `/work?page=${pageParam}&limit=${option.limit}`;
      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }
      const res = await api.get(url);
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
      },
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allWorks = data?.pages.flatMap((page) => page.works) || [];
  const totalWorks = data?.pages[0]?.total || 0;

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this work?");
    if (!confirm) return;
    try {
      await api.delete(`/work/${id}`);
      toast.success("Work deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete work");
    }
  };

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Works</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or delete task links and tutorials for users.</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAdminForm(!showAdminForm)}
          className="bg-blue-600 normal-case text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-md shadow-blue-500/20 rounded-xl"
        >
          {showAdminForm ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              <span>Add New Work</span>
            </>
          )}
        </Button>
      </div>

      {/* Admin Form Panel */}
      {showAdminForm && (
        <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-lg mb-8 animate-fade-in-up">
          <Form />
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="w-full shadow-sm border border-gray-200 overflow-hidden rounded-xl">
        {/* Table Filters */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 bg-white">
          <div className="w-full sm:w-64">
            <Select 
              label="Filter by Category"
              value={selectedCategory} 
              onChange={(val) => setSelectedCategory(val)}
              className="bg-gray-50"
            >
              {categoryList.map(cat => (
                <Option key={cat} value={cat.toLowerCase()}>{cat}</Option>
              ))}
            </Select>
          </div>
          <div className="text-sm font-semibold text-gray-600">
            Total Works: <span className="text-blue-600">{totalWorks}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-left whitespace-nowrap">
            <thead>
              <tr>
                {["Category", "Title", "Link", "Action"].map((head) => (
                  <th key={head} className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allWorks.map((work) => (
                <tr key={work._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold uppercase tracking-wide">
                      {work.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-normal">
                     <p className="text-sm font-semibold text-gray-900 line-clamp-2">{work.title}</p>
                     {work.desc && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{work.desc}</p>}
                  </td>
                  <td className="px-4 py-3">
                     <a href={work.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <LinkIcon className="w-4 h-4" />
                        View Link
                     </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                       <Button 
                         size="sm" 
                         variant="text" 
                         className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                         onClick={() => setEditWork(work)}
                       >
                         <PencilSquareIcon className="w-5 h-5" />
                       </Button>
                       <Button 
                         size="sm" 
                         variant="text" 
                         className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                         onClick={() => handleDelete(work._id)}
                       >
                         <TrashIcon className="w-5 h-5" />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Intersection Observer target for infinite scroll */}
              <tr ref={ref}>
                <td colSpan="4" className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500 font-medium animate-pulse">Loading more...</span>
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-sm text-gray-400">Scroll down for more</span>
                  ) : allWorks.length > 0 ? (
                    <span className="text-sm text-gray-400">You've reached the end</span>
                  ) : !isLoading && (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No works found in this category.
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      {editWork && (
        <UpdateDialog 
          open={!!editWork} 
          setOpen={(val) => !val && setEditWork(null)} 
          data={editWork} 
          refetch={refetch} 
        />
      )}
    </div>
  );
};

export default PremiumAdminWorksTable;
