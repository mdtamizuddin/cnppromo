import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Card, Button, IconButton } from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";
import { Modal } from "antd";
import UpdateDialog from "./UpdateDialog";
import WorkDetails from "./WorkDetails";
import LinkifyText from "../../../util/linkify";
import { api } from "../../../util/axios";

const WorkCard = ({ data, refetch }) => {
  const { user } = useSelector((state) => state.user);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const deleteWork = async () => {
    const confirm = window.confirm("আপনি কি নিশ্চিতভাবে এই কাজটি মুছে ফেলতে চান?");
    if (!confirm) return;
    try {
      await api.delete(`/work/${data?._id}`);
      toast.success("কাজটি সফলভাবে মুছে ফেলা হয়েছে!");
      if (refetch) refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    }
  };

  const hasVideo = data?.link && (data.link.includes("youtube") || data.link.includes("youtu.be") || data.link.includes("vimeo"));

  return (
    <Card className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
      
      {/* Details Modal */}
      <Modal
        open={showDetails}
        onOk={() => setShowDetails(false)}
        onCancel={() => setShowDetails(false)}
        footer={null}
        title={data?.name || "Work Details"}
        loading={!data}
        centered
        width={700}
      >
        <WorkDetails data={data} />
      </Modal>

      {/* Admin Update Dialog */}
      <UpdateDialog open={openUpdate} setOpen={setOpenUpdate} data={data} refetch={refetch} />

      <div>
        {/* Video Player or Thumbnail */}
        {hasVideo ? (
          <div className="rounded-2xl overflow-hidden shadow-inner bg-black aspect-video mb-4 relative">
            <ReactPlayer
              url={data.link}
              width="100%"
              height="100%"
              controls
              light={false}
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center text-4xl mb-4 border border-indigo-50">
            <VideoCameraIcon className="w-12 h-12 text-[#5a32fa]" />
          </div>
        )}

        {/* Category Tag */}
        {data?.category && (
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 text-[#5a32fa] border border-purple-100 mb-2">
            {data.category}
          </span>
        )}

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a] group-hover:text-[#5a32fa] transition-colors leading-snug">
          <LinkifyText text={data?.name} />
        </h2>

        {/* Description */}
        <div className="mt-2 text-xs text-gray-500 line-clamp-3 leading-relaxed">
          <LinkifyText text={data?.desc} />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {data?.link && (
            <a
              href={data.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5a32fa] hover:bg-[#4b26e0] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
            >
              <span>কাজের লিংক</span>
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </a>
          )}

          <Button
            size="sm"
            variant="outlined"
            onClick={() => setShowDetails(true)}
            className="rounded-xl border-gray-200 text-gray-700 normal-case text-xs font-bold px-3 py-2 hover:bg-gray-50"
          >
            বিস্তারিত
          </Button>
        </div>

        {/* Admin Buttons */}
        {user?.role === "admin" && (
          <div className="flex items-center gap-1">
            <IconButton
              size="sm"
              variant="text"
              color="blue"
              onClick={() => setOpenUpdate(true)}
              className="rounded-lg"
            >
              <PencilSquareIcon className="w-4 h-4 text-blue-600" />
            </IconButton>
            <IconButton
              size="sm"
              variant="text"
              color="red"
              onClick={deleteWork}
              className="rounded-lg"
            >
              <TrashIcon className="w-4 h-4 text-red-500" />
            </IconButton>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkCard;