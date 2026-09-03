import React, { memo, useCallback, useState } from "react";
import { Popover, Modal } from "antd";
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
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon
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

const fmtDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editText, setEditText] = useState(msg?.message || "");
    const [updating, setUpdating] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const status = msg.__status || (msg.seen ? "seen" : "sent");
    const failed = status === "failed";
    const pending = status === "sending";

    const remove = useCallback(async () => {
      setPopoverOpen(false);
      try {
        await api.delete(`/message/${msg?._id}`);
        onChanged?.();
        toast.success("Message deleted");
      } catch {
        toast.error("Could not delete the message");
      }
    }, [msg?._id, onChanged]);

    const handleOpenEdit = () => {
      setEditText(msg?.message || "");
      setPopoverOpen(false);
      setEditModalOpen(true);
    };

    const handleSaveEdit = useCallback(async () => {
      const next = editText.trim();
      if (!next) {
        toast.error("Message cannot be empty");
        return;
      }
      if (next === msg?.message?.trim()) {
        setEditModalOpen(false);
        return;
      }

      try {
        setUpdating(true);
        await api.put(`/message/update/${msg?._id}`, { message: next });
        setEditModalOpen(false);
        onChanged?.();
        toast.success("Message updated successfully!");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Could not update the message");
      } finally {
        setUpdating(false);
      }
    }, [editText, msg?._id, msg?.message, onChanged]);

    const copy = useCallback(() => {
      setPopoverOpen(false);
      if (!msg?.message) return;
      navigator.clipboard.writeText(msg.message);
      toast.success("Copied to clipboard!");
    }, [msg?.message]);

    const hasText = !!msg?.message;
    const mediaOnly = !hasText && (msg?.image || msg?.video || msg?.audio);
    const visualMediaOnly = !hasText && !msg?.reply && (msg?.image || msg?.video);

    const menu = (
      <div className="flex flex-col min-w-[190px] py-1 text-xs">
        <button
          onClick={() => {
            setPopoverOpen(false);
            onReply?.(msg);
          }}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors rounded-lg font-medium text-left"
        >
          <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400" />
          <span>Reply</span>
        </button>

        <button
          onClick={copy}
          disabled={!hasText}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors rounded-lg font-medium text-left disabled:opacity-40 disabled:pointer-events-none"
        >
          <ClipboardIcon className="w-4 h-4 text-gray-400" />
          <span>Copy text</span>
        </button>

        {own && (
          <>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={handleOpenEdit}
              disabled={!hasText}
              className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors rounded-lg font-medium text-left disabled:opacity-40 disabled:pointer-events-none"
            >
              <PencilSquareIcon className="w-4 h-4 text-gray-400" />
              <span>Edit message</span>
            </button>
            <button
              onClick={remove}
              className="flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors rounded-lg font-medium text-left"
            >
              <TrashIcon className="w-4 h-4 text-rose-500" />
              <span>Delete message</span>
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
              className={`relative transition-all select-text ${
                pending ? "opacity-65" : ""
              } ${
                visualMediaOnly
                  ? "p-0 bg-transparent shadow-none border-0"
                  : own
                  ? `px-4 py-2.5 bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-md shadow-teal-500/15 ${
                      runEnd ? "rounded-[20px] rounded-br-[4px]" : "rounded-[20px]"
                    } ${mediaOnly ? "p-1.5" : ""}`
                  : `px-4 py-2.5 bg-white text-gray-800 border border-gray-150/80 shadow-xs ${
                      runEnd ? "rounded-[20px] rounded-bl-[4px]" : "rounded-[20px]"
                    } ${mediaOnly ? "p-1.5" : ""}`
              } ${highlighted ? "ring-2 ring-amber-400 ring-offset-1" : ""} ${
                failed ? "ring-2 ring-rose-400" : ""
              }`}
            >
              {/* Quoted message */}
              {msg?.reply && (
                <button
                  type="button"
                  onClick={() => onJumpToReply?.(msg.reply._id)}
                  className={`block w-full text-left mb-2 pl-2.5 pr-2 py-1.5 rounded-xl border-l-[3px] text-[11px] truncate transition-all ${
                    own
                      ? "border-white/80 bg-black/15 text-white/90 hover:bg-black/25"
                      : "border-primary bg-primary-light text-gray-700 hover:bg-teal-50"
                  }`}
                >
                  <span className="block font-bold text-[10px] opacity-75 mb-0.5">
                    {String(msg.reply.sender?._id || msg.reply.sender) === String(currentUser?._id)
                      ? "You"
                      : chatUser?.name || "Member"}
                  </span>
                  <span className="truncate block font-medium">
                    {msg.reply.message?.slice(0, 70) ||
                      (msg.reply.audio ? "🎤 Voice message" : msg.reply.video ? "📹 Video" : "📷 Photo")}
                  </span>
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

            {/* Actions Trigger */}
            <div
              className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100
                transition-opacity duration-150"
            >
              <button
                type="button"
                onClick={() => onReply?.(msg)}
                aria-label="Reply"
                title="Reply"
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-light
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
              </button>
              <Popover
                trigger="click"
                placement={own ? "left" : "right"}
                content={menu}
                open={popoverOpen}
                onOpenChange={setPopoverOpen}
                arrow={false}
              >
                <button
                  type="button"
                  aria-label="More actions"
                  title="More"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-light
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </button>
              </Popover>
            </div>
          </div>

          {/* Full Timestamp & Status */}
          {(runEnd || failed) && (
            <div
              className={`flex items-center gap-1.5 mt-1 px-1 ${own ? "flex-row-reverse" : ""}`}
            >
              <span className="text-[10px] text-gray-400 font-medium tabular-nums">
                {fmtDateTime(msg?.createdAt)}
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

        {/* ── Modern Message Update Modal ─────────────────────────────────────── */}
        {own && (
          <Modal
            open={editModalOpen}
            onCancel={() => !updating && setEditModalOpen(false)}
            footer={null}
            closable={false}
            centered
            width={480}
            destroyOnClose
          >
            <div className="p-5 space-y-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                    <PencilSquareIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Edit Message</h3>
                    <p className="text-[11px] text-gray-400">Make changes to your sent message</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  disabled={updating}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Textarea Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Message Content</label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Type your message..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveEdit();
                      }
                    }}
                    className="w-full p-3.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                  <div className="flex justify-between items-center px-1 text-[10px] text-gray-400">
                    <span>Press Enter to save, Shift+Enter for new line</span>
                    <span>{editText.length} characters</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating || !editText.trim()}
                  onClick={handleSaveEdit}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5"
                >
                  {updating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
export default MessageBubble;
