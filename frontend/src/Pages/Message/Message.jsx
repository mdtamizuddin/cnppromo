import React, { useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
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
  const { socket, message } = useSocketContext();
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  // Admin renders this page inside its own layout and passes the sidebar toggle
  // down, since removing the top bar also removed the only way in to the menu.
  const outlet = useOutletContext();
  const onOpenMenu = outlet?.toggleSidebar;

  const queryClient = useQueryClient();

  const params = new URLSearchParams(location.search);
  const chatId = params.get("chat");
  const sortby = params.get("sortby") || "All";
  const search = params.get("search") || "";
  const date = params.get("date") || "";

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["chat-list", user?._id, sortby],
    queryFn: async ({ pageParam = null }) => {
      const res = await api.get(`/message/user/${user?._id}`, {
        params: { cursor: pageParam, sortby, limit: 40 },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: !!user?._id,
  });

  const chats = data?.pages?.flatMap(page => page?.chats || []) || [];
  const counts = {
    All: data?.pages?.[0]?.totalAll || 0,
    Favourite: data?.pages?.[0]?.totalFavourite || 0,
    Unread: data?.pages?.[0]?.totalUnread || 0,
  };

  // Move the conversation a new message belongs to to the top of the list and
  // refresh its preview, without refetching the whole list.
  useEffect(() => {
    if (!message) return;
    queryClient.setQueryData(["chat-list", user?._id, sortby], (oldData) => {
      if (!oldData) return oldData;
      
      let foundChat = null;
      let chatPageIdx = -1;
      let chatItemIdx = -1;
      
      for (let i = 0; i < oldData.pages.length; i++) {
        const page = oldData.pages[i];
        const idx = page.chats.findIndex(
          (c) =>
            String(c._id) === String(message.chat) ||
            (String(c?.user?._id) === String(message.sender) &&
              String(c?.owner?._id || c?.owner) === String(message.receiver))
        );
        if (idx !== -1) {
          foundChat = page.chats[idx];
          chatPageIdx = i;
          chatItemIdx = idx;
          break;
        }
      }
      
      if (!foundChat) {
         // Chat not found in current loaded pages, could refetch here if needed
         return oldData;
      }

      const incoming = String(message.sender) === String(foundChat?.user?._id);
      const isOpen = String(foundChat._id) === String(chatId);
      const updatedChat = {
        ...foundChat,
        message,
        updatedAt: new Date().toISOString(),
        unseen: incoming && !isOpen ? (foundChat.unseen || 0) + 1 : foundChat.unseen,
      };
      
      const newPages = oldData.pages.map((page, i) => {
         if (i === chatPageIdx) {
            return {
               ...page,
               chats: page.chats.filter((_, idx) => idx !== chatItemIdx)
            }
         }
         return page;
      });
      
      newPages[0].chats = [updatedChat, ...newPages[0].chats];
      
      return { ...oldData, pages: newPages };
    });
  }, [message, chatId, user?._id, sortby, queryClient]);

  // Listen for real-time presence updates to update green online dots live
  useEffect(() => {
    if (!socket) return;
    const handlePresence = (payload) => {
      if (!payload?.userId) return;
      queryClient.setQueryData(["chat-list", user?._id, sortby], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            chats: page.chats.map((c) => {
              if (String(c?.user?._id) === String(payload.userId)) {
                return {
                  ...c,
                  user: {
                    ...c.user,
                    active: !!payload.active,
                  },
                };
              }
              return c;
            }),
          })),
        };
      });
    };

    socket.on("user:presence", handlePresence);
    return () => socket.off("user:presence", handlePresence);
  }, [socket, user?._id, sortby, queryClient]);

  const openChat = useCallback(
    (id) => {
      const next = new URLSearchParams(location.search);
      next.set("chat", id);
      navigate(`${location.pathname}?${next.toString()}`);
      
      // Clearing the badge locally keeps the list honest until the next refetch.
      queryClient.setQueryData(["chat-list", user?._id, sortby], (oldData) => {
        if (!oldData) return oldData;
        return {
           ...oldData,
           pages: oldData.pages.map(page => ({
              ...page,
              chats: page.chats.map(c => String(c._id) === String(id) ? { ...c, unseen: 0 } : c)
           }))
        }
      });
    },
    [location.pathname, location.search, navigate, user?._id, sortby, queryClient]
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
              counts={counts}
              loading={isLoading}
              refetch={refetch}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
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
