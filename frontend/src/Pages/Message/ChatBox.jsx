import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { useSocketContext } from "../../Components/SocketContext";
import WriteChat from "./WriteChat";
import UserProfile from "./UserProfile";
import MessageThread from "./components/MessageThread";
import { PresenceAvatar, TypingDots, EmptyState } from "./components/Primitives";

const ChatBox = ({ chatId, onBack }) => {
  const { socket, message } = useSocketContext();
  const { user } = useSelector((state) => state.user);

  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [typing, setTyping] = useState(false);

  const virtuosoRef = useRef(null);
  // Captured once per conversation so the "New messages" rule stays put instead of
  // sliding down as the thread is read.
  const unreadAnchorRef = useRef(null);

  const { data: chat, isLoading: chatLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await api.get(`/message/${chatId}`);
      await api.put(`/message/seen/${chatId}`);
      socket?.emit("seenOnly", chatId);
      return res.data;
    },
    enabled: !!chatId,
    refetchOnWindowFocus: true,
  });

  const chatUser = chat?.user;
  const chatUserId = chatUser?._id;

  const { refetch, isLoading: msgsLoading } = useQuery({
    // Keyed on the two ids rather than whole objects, so an unrelated identity
    // change no longer refetches the entire history.
    queryKey: ["messages", user?._id, chatUserId],
    queryFn: async () => {
      const res = await api.get(`/message/msg/all?sender=${user?._id}&receiver=${chatUserId}`);
      return res.data || [];
    },
    enabled: !!user?._id && !!chatUserId,
    refetchOnWindowFocus: false,
    onSuccess: (rows) => {
      setMessages(rows);
      if (unreadAnchorRef.current === null) {
        const first = rows.find(
          (m) => !m.seen && String(m.sender?._id || m.sender) !== String(user?._id)
        );
        unreadAnchorRef.current = first?._id || undefined;
      }
    },
  });

  useEffect(() => {
    unreadAnchorRef.current = null;
    setMessages([]);
    setReply(null);
    setTyping(false);
  }, [chatId]);

  /* ── Typing ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!socket || !chatUserId) return;
    let timer;
    const handler = (payload) => {
      // The server relays the typist's user id. It cannot send a chat id: each
      // participant owns a separate Chat document, so the typist's chat id would
      // never match the one this side is looking at.
      if (payload?.from !== chatUserId) return;
      if (payload?.stop) {
        setTyping(false);
      } else {
        setTyping(true);
        clearTimeout(timer);
        timer = setTimeout(() => setTyping(false), 3000);
      }
    };
    socket.on("typing", handler);
    return () => {
      socket.off("typing", handler);
      clearTimeout(timer);
    };
  }, [socket, chatUserId]);

  /* ── Incoming messages ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!message || !chat) return;
    const belongs =
      String(chat?._id) === String(message?.chat) ||
      (String(chatUserId) === String(message?.sender) &&
        String(chat?.owner?._id || chat?.owner) === String(message?.receiver));
    if (!belongs) return;

    // Guard against the socket event racing a refetch that already included it.
    setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
    setTyping(false);

    if (String(message?.sender) === String(chatUserId)) socket?.emit("seen", message);
  }, [message, chat, chatUserId, socket]);

  /* ── Read receipts ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!socket) return;
    // Flip the ticks in place rather than refetching the whole thread on a timer.
    const handler = (payload) => {
      if (!payload?._id) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === payload._id ? { ...m, seen: true } : m))
      );
    };
    socket.on("seen", handler);
    return () => socket.off("seen", handler);
  }, [socket]);

  const onReply = useCallback((msg) => setReply(msg), []);

  const status = useMemo(() => {
    if (typing) return "typing";
    return chatUser?.active ? "Online" : "Offline";
  }, [typing, chatUser?.active]);

  if (!chatId) {
    return (
      <div className="hidden lg:flex flex-col h-full bg-canvas">
        <EmptyState
          icon={ChatBubbleLeftRightIcon}
          title="Pick a conversation"
          hint="Choose someone from the list to read and reply to their messages."
        />
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full min-h-0 bg-canvas">
      {user?.role === "admin" && (
        <Modal
          title={null}
          closable={false}
          open={showProfile}
          footer={null}
          onCancel={() => setShowProfile(false)}
          destroyOnClose
          centered
          width={540}
        >
          <UserProfile uid={chatUserId} onClose={() => setShowProfile(false)} />
        </Modal>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-gray-100">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:text-brand hover:bg-brand-soft transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => user?.role === "admin" && setShowProfile(true)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl px-1 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <PresenceAvatar name={chatUser?.name} active={chatUser?.active} size={40} />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-gray-900 truncate">
              {chatUser?.name || "Loading…"}
            </span>
            <span
              className={`flex items-center gap-1.5 text-xs ${
                typing ? "text-brand font-semibold" : chatUser?.active ? "text-green-600 font-medium" : "text-gray-400"
              }`}
            >
              {status === "typing" ? (
                <>
                  <TypingDots /> typing
                </>
              ) : (
                status
              )}
            </span>
          </span>
        </button>

        {user?.role === "admin" && (
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            aria-label="Conversation details"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-brand hover:bg-brand-soft transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Thread */}
      <div className="flex-1 min-h-0">
        <MessageThread
          messages={messages}
          loading={chatLoading || msgsLoading}
          currentUser={user}
          chatUser={chatUser}
          firstUnseenId={unreadAnchorRef.current}
          virtuosoRef={virtuosoRef}
          onReply={onReply}
          onChanged={refetch}
        />
      </div>

      <WriteChat socket={socket} chat={chat} reply={reply} setReply={setReply} />
    </section>
  );
};

export default ChatBox;
