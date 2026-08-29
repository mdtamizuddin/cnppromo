import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { useSocketContext } from "../../Components/SocketContext";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";
import { EmptyState } from "./components/Primitives";

/**
 * Messaging shell.
 *
 * Two panes side by side from `lg` up, and a single pane that navigates below
 * it. The previous version rendered the list *or* the conversation at every
 * width — the `lg:col-span-*` classes on its children never had a grid parent to
 * act on, so desktop got one full-width panel that toggled.
 */
const Message = () => {
  const { message } = useSocketContext();
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  // Admin renders this page inside its own layout and passes the sidebar toggle
  // down, since removing the top bar also removed the only way in to the menu.
  const outlet = useOutletContext();
  const onOpenMenu = outlet?.toggleSidebar;

  const params = new URLSearchParams(location.search);
  const chatId = params.get("chat");

  const [chats, setChats] = useState([]);

  const { refetch, isLoading } = useQuery({
    queryKey: ["chat-list", user?._id],
    queryFn: async () => {
      const res = await api.get(`/message/user/${user?._id}`);
      return res.data || [];
    },
    enabled: !!user?._id,
    onSuccess: setChats,
  });

  // Move the conversation a new message belongs to to the top of the list and
  // refresh its preview, without refetching the whole list.
  useEffect(() => {
    if (!message) return;
    setChats((prev) => {
      const i = prev.findIndex(
        (c) =>
          String(c._id) === String(message.chat) ||
          (String(c?.user?._id) === String(message.sender) &&
            String(c?.owner?._id || c?.owner) === String(message.receiver))
      );
      if (i === -1) return prev;

      const incoming = String(message.sender) === String(prev[i]?.user?._id);
      const isOpen = String(prev[i]._id) === String(chatId);
      const updated = {
        ...prev[i],
        message,
        updatedAt: new Date().toISOString(),
        unseen: incoming && !isOpen ? (prev[i].unseen || 0) + 1 : prev[i].unseen,
      };
      return [updated, ...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  }, [message, chatId]);

  const openChat = useCallback(
    (id) => {
      const next = new URLSearchParams(location.search);
      next.set("chat", id);
      navigate(`${location.pathname}?${next.toString()}`);
      // Clearing the badge locally keeps the list honest until the next refetch.
      setChats((prev) =>
        prev.map((c) => (String(c._id) === String(id) ? { ...c, unseen: 0 } : c))
      );
    },
    [location.pathname, location.search, navigate]
  );

  const closeChat = useCallback(() => {
    const next = new URLSearchParams(location.search);
    next.delete("chat");
    navigate(`${location.pathname}?${next.toString()}`);
  }, [location.pathname, location.search, navigate]);

  const isStaff = user?.role === "admin" || user?.role === "moderator";

  if (user && !isStaff && user.status !== "active") {
    return (
      <div className="message flex items-center justify-center min-h-[70dvh]">
        <EmptyState
          icon={ClockIcon}
          title="Your account is awaiting approval"
          hint="Messaging opens up as soon as an admin activates your account."
        />
      </div>
    );
  }

  return (
    <div className="message">
      {/* One shared height for both panes. `min-h-0` on the panes lets their inner
          scroll regions flex instead of the two hardcoded `calc(100dvh - Npx)`
          guesses the list and the thread each used to carry. */}
      <div
        className={`message-shell mx-auto w-full max-w-[1400px] lg:px-4 lg:py-4 ${
          onOpenMenu ? "message-shell--full" : ""
        }`}
      >
        <div
          className="grid h-full min-h-0 overflow-hidden bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm
            grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]"
        >
          <div className={`min-h-0 h-full ${chatId ? "hidden lg:block" : "block"}`}>
            <ChatList
              users={chats}
              loading={isLoading}
              refetch={refetch}
              activeId={chatId}
              onOpen={openChat}
              onOpenMenu={onOpenMenu}
            />
          </div>

          <div className={`min-h-0 h-full ${chatId ? "block" : "hidden lg:block"}`}>
            <ChatBox chatId={chatId} onBack={closeChat} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
