import React, { useCallback, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import MessageBubble from "./MessageBubble";
import { EmptyState, ThreadSkeleton } from "./Primitives";

const RUN_GAP_MS = 5 * 60 * 1000; // messages closer than this from one sender group together

const dayKey = (d) => (d ? new Date(d).toDateString() : "");

const dayLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Precomputes each message's place in the thread.
 *
 * This has to happen outside the renderer: Virtuoso calls `itemContent` for
 * arbitrary, non-sequential indices, so the previous approach — a mutable
 * `lastDate` variable read during render — put day separators on the wrong rows
 * and dropped them entirely once a row was recycled.
 */
const useThreadRows = (messages, currentUserId, firstUnseenId) =>
  useMemo(() => {
    const list = messages || [];
    return list.map((msg, i) => {
      const prev = list[i - 1];
      const next = list[i + 1];
      const own = String(msg?.sender?._id || msg?.sender) === String(currentUserId);
      const senderOf = (m) => String(m?.sender?._id || m?.sender || "");

      const newDay = dayKey(msg?.createdAt) !== dayKey(prev?.createdAt);
      const gapBefore =
        !prev || new Date(msg?.createdAt) - new Date(prev?.createdAt) > RUN_GAP_MS;
      const gapAfter =
        !next || new Date(next?.createdAt) - new Date(msg?.createdAt) > RUN_GAP_MS;

      return {
        msg,
        own,
        showDay: newDay,
        showUnreadMark: !!firstUnseenId && msg?._id === firstUnseenId,
        runStart: newDay || gapBefore || senderOf(prev) !== senderOf(msg),
        runEnd:
          !next ||
          dayKey(next?.createdAt) !== dayKey(msg?.createdAt) ||
          gapAfter ||
          senderOf(next) !== senderOf(msg),
      };
    });
  }, [messages, currentUserId, firstUnseenId]);

const DayDivider = ({ label }) => (
  <div className="flex justify-center py-3">
    <span
      className="chat-date-pill px-3 py-1 text-[11px] font-semibold text-gray-500 bg-white/85
        border border-gray-100 rounded-full shadow-sm"
    >
      {label}
    </span>
  </div>
);

const UnreadDivider = () => (
  <div className="flex items-center gap-3 px-4 py-2">
    <span className="flex-1 h-px bg-rose-200" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
      New messages
    </span>
    <span className="flex-1 h-px bg-rose-200" />
  </div>
);

/**
 * The scrolling conversation.
 *
 * `firstItemIndex` and `startReached` are wired up here so backward cursor
 * pagination can be dropped in without touching the presentation: Virtuoso needs
 * a shifting `firstItemIndex` to prepend older pages without jumping the scroll
 * position.
 */
const MessageThread = ({
  messages,
  loading,
  currentUser,
  chatUser,
  firstUnseenId,
  virtuosoRef,
  onReply,
  onChanged,
  onRetry,
  onLoadOlder,
  hasOlder,
  loadingOlder,
  firstItemIndex = 0,
}) => {
  const [atBottom, setAtBottom] = useState(true);
  const [highlighted, setHighlighted] = useState(null);
  const rows = useThreadRows(messages, currentUser?._id, firstUnseenId);

  const jumpToReply = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    setHighlighted(id);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlighted(null), 1600);
  }, []);

  if (loading) return <ThreadSkeleton />;

  if (!rows.length) {
    return (
      <EmptyState
        icon={ChatBubbleLeftRightIcon}
        title="No messages yet"
        hint={`Say hello to ${chatUser?.name || "start the conversation"}.`}
      />
    );
  }

  return (
    <div className="relative h-full">
      <Virtuoso
        ref={virtuosoRef}
        data={rows}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={rows.length - 1}
        followOutput="smooth"
        overscan={600}
        atBottomStateChange={setAtBottom}
        atBottomThreshold={80}
        startReached={() => {
          if (hasOlder && !loadingOlder) onLoadOlder?.();
        }}
        components={{
          Header: () =>
            loadingOlder ? (
              <div className="flex justify-center py-3">
                <span className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-brand animate-spin" />
              </div>
            ) : null,
        }}
        itemContent={(_, row) => (
          <>
            {row.showDay && <DayDivider label={dayLabel(row.msg?.createdAt)} />}
            {row.showUnreadMark && <UnreadDivider />}
            <MessageBubble
              msg={row.msg}
              own={row.own}
              runStart={row.runStart}
              runEnd={row.runEnd}
              currentUser={currentUser}
              chatUser={chatUser}
              highlighted={highlighted === row.msg?._id}
              onReply={onReply}
              onJumpToReply={jumpToReply}
              onChanged={onChanged}
              onRetry={onRetry}
            />
          </>
        )}
      />

      {!atBottom && (
        <button
          type="button"
          onClick={() => virtuosoRef.current?.scrollToIndex({ index: "LAST", behavior: "smooth" })}
          aria-label="Jump to latest messages"
          className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-10 h-10
            bg-white border border-gray-200 rounded-full shadow-lg text-gray-600
            hover:text-brand hover:border-brand/30 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <ArrowDownIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageThread;
