import React, { memo, useCallback, useState } from "react";
import { Popover, Input, Button } from "antd";
import toast from "react-hot-toast";
import {
  ArrowUturnLeftIcon,
  ClipboardIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";
import { PresenceAvatar } from "./Primitives";
import VoiceNote from "./VoiceNote";
import { ImageBubble, VideoBubble } from "./MediaBubble";

/* ── Link detection ───────────────────────────────────────────────────── */

// Module scope, and rebuilt per call: a /g regex carries lastIndex between
// .test() calls, which made the previous shared instance skip every other link.
const URL_RE = /(https?:\/\/[^\s]+)/g;

export const LinkifyText = ({ text, own }) => {
  if (!text) return null;
  const parts = text.split(URL_RE);
  return (
    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 ${
              own ? "text-white/90 hover:text-white" : "text-brand hover:opacity-80"
            }`}
          >
            {part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </p>
  );
};

/* ── Delivery status ──────────────────────────────────────────────────── */

// Ticks were literal "✓✓" text, so their weight and baseline drifted against
// everything around them. These are real icons on a fixed box.
export const MessageStatus = ({ status }) => {
  if (status === "sending") {
    return <ClockIcon className="w-3 h-3 text-gray-400" aria-label="Sending" />;
  }
  if (status === "failed") {
    return <ExclamationCircleIcon className="w-3 h-3 text-rose-500" aria-label="Failed to send" />;
  }
  const seen = status === "seen";
  return (
    <span
      className={`relative inline-flex w-[15px] h-3 items-center ${
        seen ? "text-brand" : "text-gray-400"
      }`}
      aria-label={seen ? "Seen" : "Sent"}
    >
      <CheckIcon className="absolute left-0 w-3 h-3" strokeWidth={2.5} />
      {seen && <CheckIcon className="absolute left-[4px] w-3 h-3" strokeWidth={2.5} />}
    </span>
  );
};

const fmtClock = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : "";

/* ── Bubble ───────────────────────────────────────────────────────────── */

/**
 * One message.
 *
 * `runStart` / `runEnd` describe the message's place in a run of consecutive
 * messages from the same sender: the avatar renders once at the end of a run and
 * the timestamp once beneath it, instead of on every row.
 */
const MessageBubble = memo(
  ({
    msg,
    own,
    chatUser,
    currentUser,
    runStart,
    runEnd,
    highlighted,
    onReply,
    onJumpToReply,
    onChanged,
    onRetry,
  }) => {
    const [editing, setEditing] = useState(false);
    const status = msg.__status || (msg.seen ? "seen" : "sent");
    const failed = status === "failed";
    const pending = status === "sending";

    const remove = useCallback(async () => {
      try {
        await api.delete(`/message/${msg?._id}`);
        onChanged?.();
        toast.success("Message deleted");
      } catch {
        toast.error("Could not delete the message");
      }
    }, [msg?._id, onChanged]);

    const saveEdit = useCallback(
      async (e) => {
        e.preventDefault();
        const next = e.target.message.value.trim();
        if (!next) return;
        try {
          await api.put(`/message/update/${msg?._id}`, { message: next });
          setEditing(false);
          onChanged?.();
          toast.success("Message updated");
        } catch {
          toast.error("Could not update the message");
        }
      },
      [msg?._id, onChanged]
    );

    const copy = useCallback(() => {
      if (!msg?.message) return;
      navigator.clipboard.writeText(msg.message);
      toast.success("Copied");
    }, [msg?.message]);

    const hasText = !!msg?.message;
    const mediaOnly = !hasText && (msg?.image || msg?.video || msg?.audio);

    const menu = (
      <div className="flex flex-col min-w-[180px] text-sm text-gray-700">
        <button onClick={copy} disabled={!hasText} className="chat-menu-item disabled:opacity-40">
          <ClipboardIcon className="w-4 h-4" /> Copy text
        </button>
        {own && (
          <>
            <Popover
              trigger="click"
              placement="left"
              open={editing}
              onOpenChange={setEditing}
              content={
                <form onSubmit={saveEdit} className="w-[280px] flex flex-col gap-2">
                  <Input.TextArea
                    name="message"
                    defaultValue={msg?.message}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                  />
                  <Button type="primary" size="small" htmlType="submit" className="self-end">
                    Save
                  </Button>
                </form>
              }
            >
              <button className="chat-menu-item" disabled={!hasText}>
                <PencilSquareIcon className="w-4 h-4" /> Edit
              </button>
            </Popover>
            <button onClick={remove} className="chat-menu-item text-rose-600">
              <TrashIcon className="w-4 h-4" /> Delete
            </button>
          </>
        )}
      </div>
    );

    return (
      <div
        className={`group flex items-end gap-2 px-3 sm:px-4 ${runEnd ? "pb-1.5" : "pb-0.5"} ${
          runStart ? "pt-2" : ""
        } ${own ? "flex-row-reverse" : ""}`}
      >
        {/* The avatar slot is always reserved so bubbles in a run stay aligned. */}
        <div className="w-8 shrink-0">
          {runEnd && (
            <PresenceAvatar
              name={own ? currentUser?.name : chatUser?.name}
              active={own ? true : chatUser?.active}
              size={32}
              showPresence={false}
            />
          )}
        </div>

        <div className={`flex flex-col max-w-[76%] sm:max-w-[68%] ${own ? "items-end" : "items-start"}`}>
          <div className={`flex items-center gap-1 ${own ? "flex-row-reverse" : ""}`}>
            <div
              id={msg?._id}
              className={`relative px-3 py-2 shadow-sm transition-opacity ${
                pending ? "opacity-60" : ""
              } ${
                own
                  ? `bg-brand text-white ${runEnd ? "rounded-2xl rounded-br-md" : "rounded-2xl"}`
                  : `bg-white text-gray-800 border border-gray-100 ${
                      runEnd ? "rounded-2xl rounded-bl-md" : "rounded-2xl"
                    }`
              } ${highlighted ? "ring-2 ring-amber-400" : ""} ${
                failed ? "ring-1 ring-rose-300" : ""
              } ${mediaOnly ? "p-1.5" : ""}`}
            >
              {/* The quoted message appears once, inside the bubble. It used to be
                  rendered twice — as a button above and again in the body. */}
              {msg?.reply && (
                <button
                  type="button"
                  onClick={() => onJumpToReply?.(msg.reply._id)}
                  className={`block w-full text-left mb-1.5 pl-2 pr-1 py-1 rounded-md border-l-2 text-[11px] truncate transition-colors ${
                    own
                      ? "border-white/50 bg-white/10 text-white/80 hover:bg-white/20"
                      : "border-brand/40 bg-brand-soft/60 text-gray-600 hover:bg-brand-soft"
                  }`}
                >
                  {msg.reply.message?.slice(0, 70) ||
                    (msg.reply.audio ? "Voice message" : msg.reply.video ? "Video" : "Photo")}
                </button>
              )}

              <LinkifyText text={msg?.message} own={own} />
              {msg?.image && <ImageBubble src={msg.image} />}
              {msg?.video && <VideoBubble src={msg.video} />}
              {msg?.audio && (
                <div className={hasText ? "mt-2" : ""}>
                  <VoiceNote src={msg.audio} own={own} />
                </div>
              )}
            </div>

            {/* Actions stay hidden until hover or keyboard focus. A permanently
                visible pencil beside every bubble was the loudest thing on screen. */}
            <div
              className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100
                transition-opacity duration-150"
            >
              <button
                type="button"
                onClick={() => onReply?.(msg)}
                aria-label="Reply"
                title="Reply"
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand-soft
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
              </button>
              <Popover trigger="click" placement={own ? "left" : "right"} content={menu}>
                <button
                  type="button"
                  aria-label="More actions"
                  title="More"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand-soft
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </button>
              </Popover>
            </div>
          </div>

          {/* One timestamp per run, not one per message. */}
          {(runEnd || failed) && (
            <div
              className={`flex items-center gap-1 mt-1 px-0.5 ${own ? "flex-row-reverse" : ""}`}
            >
              <span className="text-[10px] text-gray-400 tabular-nums">
                {fmtClock(msg?.createdAt)}
              </span>
              {own && <MessageStatus status={status} />}
              {failed && (
                <button
                  type="button"
                  onClick={() => onRetry?.(msg)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:underline"
                >
                  <ArrowPathIcon className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
export default MessageBubble;
