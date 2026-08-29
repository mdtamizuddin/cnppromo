import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, Input, DatePicker, Popover } from "antd";
import { Virtuoso } from "react-virtuoso";
import moment from "moment";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { api } from "../../util/axios";
import UserCard from "./UserCard";
import SearchMessage from "./SearchMessage";
import { PresenceAvatar, ChatRowSkeleton, EmptyState, IconButton } from "./components/Primitives";

const PAGE = 40;

/* ── Last-message preview ─────────────────────────────────────────────── */

const Preview = ({ chat, currentUserId }) => {
  const m = chat?.message;
  if (!m) return <span className="text-xs text-gray-400 italic">No messages yet</span>;

  const outgoing = String(m.sender?._id || m.sender) === String(currentUserId);
  const icon = m.image ? PhotoIcon : m.video ? VideoCameraIcon : m.audio ? MicrophoneIcon : null;
  const label = m.message || (m.image ? "Photo" : m.video ? "Video" : m.audio ? "Voice message" : "");

  return (
    <span className="flex items-center gap-1 min-w-0 text-xs text-gray-500">
      {outgoing && <span className="text-gray-400 shrink-0">You:</span>}
      {icon && React.createElement(icon, { className: "w-3.5 h-3.5 shrink-0 text-gray-400" })}
      <span className="truncate">{label}</span>
    </span>
  );
};

/* ── One conversation ─────────────────────────────────────────────────── */

const ChatRow = React.memo(({ chat, currentUserId, activeId, onOpen, onToggleStar }) => {
  const active = String(chat?._id) === String(activeId);
  const unread = chat?.unseen || 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(chat?._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(chat?._id);
        }
      }}
      className={`group relative flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-2xl cursor-pointer
        transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
          active ? "bg-brand-soft" : "hover:bg-gray-50"
        }`}
    >
      {/* The active conversation gets a rail, not just a fill change, so it stays
          distinguishable from an unread row. */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-brand" />
      )}

      <PresenceAvatar name={chat?.user?.name} active={chat?.user?.active} size={44} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${
              unread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
            }`}
          >
            {chat?.user?.name || "Unknown"}
          </span>
          <span className="shrink-0 text-[10px] text-gray-400 tabular-nums">
            {chat?.message?.createdAt ? moment(chat.message.createdAt).fromNow(true) : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <Preview chat={chat} currentUserId={currentUserId} />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(chat);
              }}
              aria-label={chat?.marked ? "Remove from favourites" : "Add to favourites"}
              className={`p-0.5 rounded transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                chat?.marked
                  ? "opacity-100 text-amber-400"
                  : "opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-300 hover:text-amber-400"
              }`}
            >
              {chat?.marked ? <StarSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
            </button>
            {!!unread && (
              <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold tabular-nums">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
ChatRow.displayName = "ChatRow";

/* ── Panel ────────────────────────────────────────────────────────────── */

const ChatList = ({ users, refetch, loading, activeId, onOpen }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryQuery, setDirectoryQuery] = useState("");

  const searchparams = new URLSearchParams(location.search);
  const sortby = searchparams.get("sortby") || "All";

  const setSortby = (value) => {
    const next = new URLSearchParams(location.search);
    next.set("sortby", value);
    navigate(`${location.pathname}?${next.toString()}`);
    setName("");
  };

  const directoryParams = useMemo(() => {
    if (directoryQuery) return { search: directoryQuery, limit: 100 };
    if (user?.role !== "admin") return { admin: true, limit: 100 };
    return { limit: 100 };
  }, [directoryQuery, user?.role]);

  const { data: directory, isLoading: directoryLoading } = useQuery({
    // Keyed on the search params only. Keying on the live socket message refetched
    // the whole user directory every time any chat message arrived.
    queryKey: ["users-chat-list", directoryParams],
    queryFn: async () => {
      const res = await api.get(`/user`, { params: directoryParams });
      return res.data || [];
    },
    enabled: newChatOpen && !!user,
    refetchOnWindowFocus: false,
  });

  const toggleStar = async (chat) => {
    try {
      await api.put(`/message/chat/${chat._id}`);
      refetch?.();
      toast.success(chat?.marked ? "Removed from favourites" : "Added to favourites");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const filtered = useMemo(() => {
    const q = name.trim().toLowerCase();
    return (users || [])
      .filter((c) => {
        if (sortby === "Unread") return c?.unseen > 0;
        if (sortby === "Favourite") return c?.marked;
        return true;
      })
      .filter((c) => {
        if (!date) return true;
        const d = c?.message?.createdAt ? moment(c.message.createdAt).format("YYYY-MM-DD") : "";
        return d === date;
      })
      .filter((c) => {
        if (!q) return true;
        return (
          c?.user?.name?.toLowerCase()?.includes(q) ||
          c?.user?.username?.toLowerCase()?.includes(q)
        );
      })
      .sort((a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0));
  }, [users, sortby, date, name]);

  const counts = useMemo(
    () => ({
      Unread: (users || []).filter((c) => c?.unseen > 0).length,
      Favourite: (users || []).filter((c) => c?.marked).length,
    }),
    [users]
  );

  useEffect(() => setPage(1), [sortby, name, date]);

  const visible = filtered.slice(0, page * PAGE);
  const tabs = ["All", "Unread", "Favourite"];

  return (
    <aside className="flex flex-col h-full min-h-0 bg-white lg:border-r border-gray-100">
      <SearchMessage open={searchOpen} setOpen={setSearchOpen} />

      <Modal
        open={newChatOpen}
        onCancel={() => setNewChatOpen(false)}
        title={user?.role === "admin" ? "Start a new chat" : "Message an admin"}
        footer={null}
        destroyOnClose
      >
        {user?.role === "admin" && (
          <Input
            placeholder="Search people"
            allowClear
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
            className="mt-2"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            onPressEnter={() => setDirectoryQuery(directorySearch)}
          />
        )}
        <div className="max-h-[65vh] overflow-y-auto mt-4 -mx-2 px-2">
          {directoryLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ChatRowSkeleton key={i} />)
          ) : directory?.users?.length ? (
            directory.users.map((u) => <UserCard key={u?._id} user={u} setOpen={setNewChatOpen} />)
          ) : (
            <p className="py-8 text-sm text-center text-gray-400">Nobody found</p>
          )}
        </div>
      </Modal>

      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black tracking-tight text-gray-900">Messages</h1>
          <div className="flex items-center gap-2">
            <Popover
              trigger="click"
              placement="bottomRight"
              open={filterOpen}
              onOpenChange={setFilterOpen}
              content={
                <div className="flex flex-col gap-3 w-[220px]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      Filter by day
                    </p>
                    <DatePicker
                      className="w-full"
                      allowClear
                      onChange={(d) => setDate(d ? moment(d.$d).format("YYYY-MM-DD") : "")}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setFilterOpen(false);
                      setSearchOpen(true);
                    }}
                    className="chat-menu-item text-sm text-gray-700"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-brand" /> Search all messages
                  </button>
                </div>
              }
            >
              <span>
                <IconButton
                  icon={AdjustmentsHorizontalIcon}
                  label="Filters"
                  active={!!date || filterOpen}
                />
              </span>
            </Popover>
            <IconButton icon={PencilSquareIcon} label="New chat" onClick={() => setNewChatOpen(true)} />
          </div>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="w-full h-10 pl-9 pr-3 text-sm text-gray-800 bg-gray-100 rounded-xl outline-none placeholder:text-gray-400 focus:bg-gray-50 focus:ring-2 focus:ring-brand/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          {tabs.map((tab) => {
            const on = sortby === tab;
            const count = counts[tab];
            return (
              <button
                key={tab}
                onClick={() => setSortby(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  on ? "bg-brand text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {tab}
                {!!count && (
                  <span
                    className={`px-1.5 rounded-full text-[10px] font-bold tabular-nums ${
                      on ? "bg-white/25 text-white" : "bg-white text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <ChatRowSkeleton key={i} />
            ))}
          </div>
        ) : visible.length ? (
          <Virtuoso
            data={visible}
            overscan={400}
            endReached={() => {
              if (visible.length < filtered.length) setPage((p) => p + 1);
            }}
            itemContent={(_, chat) => (
              <ChatRow
                chat={chat}
                currentUserId={user?._id}
                activeId={activeId}
                onOpen={onOpen}
                onToggleStar={toggleStar}
              />
            )}
          />
        ) : (
          <EmptyState
            icon={ChatBubbleLeftRightIcon}
            title={name || date ? "Nothing matches" : "No conversations yet"}
            hint={
              name || date
                ? "Try a different name, or clear the day filter."
                : "Start a conversation and it will show up here."
            }
          />
        )}
      </div>
    </aside>
  );
};

export default ChatList;
