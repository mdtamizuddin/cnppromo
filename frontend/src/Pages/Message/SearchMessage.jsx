import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { PresenceAvatar, Skeleton, EmptyState } from "./components/Primitives";

// Wraps each match of the query so the reason a row came back is visible.
const Highlight = ({ text, term }) => {
  if (!text) return null;
  if (!term) return <>{text}</>;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="bg-amber-100 text-gray-900 rounded px-0.5">
            {p}
          </mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
};

const SearchMessage = ({ open, setOpen }) => {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!search.trim()) {
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get(`/message/msg/search?text=${encodeURIComponent(search.trim())}&user=${user?._id}`)
        .then((res) => setResult(res.data))
        .catch(() => setResult(null))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, user?._id]);

  // A hit can be a message you sent or one you received; the conversation to open
  // is always the other participant. Targeting `sender` blindly opened a chat with
  // yourself for every message you had sent.
  const counterpartOf = (item) =>
    String(item?.sender?._id) === String(user?._id) ? item?.receiver : item?.sender;

  const openChat = async (id) => {
    if (!id) return;
    try {
      const res = await api.post("/message/chat", { owner: user?._id, user: id });
      const params = new URLSearchParams(window.location.search);
      params.set("chat", res.data._id);
      navigate(`${window.location.pathname}?${params.toString()}`);
      setOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not open that conversation");
    }
  };

  const rows = result?.messages || [];

  return (
    <Modal
      title="Search messages"
      open={open}
      footer={null}
      onCancel={() => setOpen(false)}
      destroyOnClose
    >
      <div className="relative mt-2">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          autoFocus
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search across all your conversations"
          aria-label="Search messages"
          className="w-full h-10 pl-9 pr-3 text-sm text-gray-800 bg-gray-100 rounded-xl outline-none
            placeholder:text-gray-400 focus:bg-gray-50 focus:ring-2 focus:ring-brand/30 transition-colors"
        />
      </div>

      <div className="mt-4 max-h-[55vh] overflow-y-auto -mx-1 px-1">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gray-200/70 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length ? (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1 pb-1">
              {rows.length} {rows.length === 1 ? "match" : "matches"}
            </p>
            {rows.map((item) => {
              const other = counterpartOf(item);
              const outgoing = String(item?.sender?._id) === String(user?._id);
              const MediaIcon = item.image
                ? PhotoIcon
                : item.video
                ? VideoCameraIcon
                : item.audio
                ? MicrophoneIcon
                : null;
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => openChat(other?._id)}
                  className="flex items-start gap-3 p-2.5 rounded-2xl text-left hover:bg-gray-50
                    transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <PresenceAvatar
                    src={other?.avatar}
                    name={other?.name}
                    active={other?.active}
                    size={40}
                    showPresence={false}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {other?.name}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">
                        {moment(item?.createdAt).format("D MMM")}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                      {outgoing && <span className="text-gray-400 shrink-0">You:</span>}
                      {MediaIcon && <MediaIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />}
                      <span className="truncate">
                        <Highlight text={item?.message} term={search.trim()} />
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-10">
            <EmptyState
              icon={MagnifyingGlassIcon}
              title={search.trim() ? "No messages found" : "Search your messages"}
              hint={
                search.trim()
                  ? "Try a different word or phrase."
                  : "Type a word to find it across every conversation."
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchMessage;
