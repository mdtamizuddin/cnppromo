import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { Avatar, Button, Image, Popover, Input, Modal } from "antd";
import {
  BarsOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";
import WriteChat from "./WriteChat";
import { useSocketContext } from "../../Components/SocketContext";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Virtuoso } from "react-virtuoso";
import UserProfile from "./UserProfile";

const ChatBox = ({ users, setShowSidebar }) => {
  const search = new URLSearchParams(window.location.search);
  const chatId = search.get("chat");
  const { socket, message } = useSocketContext();
  const { user } = useSelector((state) => state.user);
  const [typingUser, setTypingUser] = useState(false);

  const { data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await api.get(`/message/${chatId || users[0]?._id}`);
      await api.put(`/message/seen/${chatId || users[0]?._id}`);
      socket && socket.emit("seenOnly", chatId || users[0]?._id);
      return res.data;
    },
    enabled: !!chatId && !!users,
    refetchOnWindowFocus: true,
  });

  const { refetch } = useQuery({
    queryKey: ["messages", data, user],
    queryFn: async () => {
      const res = await api.get(`/message/msg/all?sender=${user?._id}&receiver=${data?.user?._id}`);
      setMessages(res.data);
      return res.data;
    },
    enabled: !!data,
    refetchOnWindowFocus: false,
  });

  const [messages, setMessages] = useState([]);
  const virtuosoRef = useRef(null);
  const markRef = useRef("");
  const replyRef = useRef(null);
  const scrollOnLoad = useRef(false);
  const [reply, setReplyState] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [, forceUpdate] = useState(0);

  const setMark = useCallback((id) => {
    markRef.current = id;
    forceUpdate((n) => n + 1);
  }, []);

  const setReply = useCallback((r) => {
    replyRef.current = r;
    setReplyState(r);
  }, []);

  // Typing indicator
  useEffect(() => {
    if (!socket) return;
    let typingTimeout;
    const handler = (data) => {
      if (data?.chat === chatId || data?.sender === data?.user?._id) {
        if (data?.stop) {
          setTypingUser(false);
        } else {
          setTypingUser(true);
          clearTimeout(typingTimeout);
          typingTimeout = setTimeout(() => setTypingUser(false), 3000);
        }
      }
    };
    socket.on("typing", handler);
    return () => { socket.off("typing", handler); clearTimeout(typingTimeout); };
  }, [socket, chatId]);

  // Optimistic message append from socket
  useEffect(() => {
    if (!message) return;
    const matchSender =
      data?.user?._id === message?.sender && data?.owner?._id === message?.receiver;
    const matchChat = data?._id === message?.chat;

    if (matchSender || matchChat) {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: "LAST", behavior: "smooth" });
      }, 50);
    }

    if (matchSender) {
      socket && socket.emit("seen", message);
    }
    setTypingUser(false);
  }, [message]);

  // Background sync when receiving "seen"
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    };
    socket.on("seen", handler);
    return () => { socket.off("seen", handler); };
  }, [socket]);

  const navigate = useNavigate();
  const goBack = useCallback(() => {
    search.delete("chat");
    navigate(`/message?${search.toString()}`);
  }, [search, navigate]);

  if (!chatId) {
    return (
      <div className="lg:col-span-2 h-full min-h-[400px] flex justify-center items-center">
        <h1 className="text-2xl font-semibold text-white">Start A New Chat</h1>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 w-full h-full">
      {user?.role === "admin" && (
        <Modal
          title="User Profile"
          open={showProfile}
          footer={null}
          onCancel={() => setShowProfile(false)}
        >
          {showProfile && <UserProfile uid={data?.user?._id} />}
        </Modal>
      )}
      <div className="w-full h-full flex flex-col">
        <div className="relative flex items-center p-3 border-b border-gray-300 bg-primary justify-between shrink-0">
          <button className="lg:hidden text-white mr-2" onClick={() => { setShowSidebar((p) => !p); goBack(); }}>
            <BarsOutlined className="text-xl" />
          </button>
          <div className="flex items-center" onClick={() => setShowProfile((p) => !p)}>
            <div className="relative">
              <Avatar size={44} style={{ minWidth: "44px", minHeight: "44px" }} className="rounded-full">
                {data?.user?.name?.slice(0, 1)}
              </Avatar>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${data?.user?.active ? "bg-green-500" : "bg-gray-400"}`} />
            </div>
            <div className="ml-3">
              <span className="block font-bold text-white text-sm">{data?.user?.name}</span>
              <span className="block text-xs text-white/80">
                {typingUser ? "Typing..." : data?.user?.active ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <button className="hidden lg:block text-white text-2xl font-semibold" onClick={() => { setShowSidebar((p) => !p); goBack(); }}>
            <BarsOutlined />
          </button>
        </div>
        <div className="overflow-hidden relative" style={{ height: "calc(100dvh - 210px)" }}>
          <MessageList
            virtuosoRef={virtuosoRef}
            messages={messages}
            user={user}
            chatUser={data?.user}
            markRef={markRef}
            setMark={setMark}
            refetch={refetch}
            setReply={setReply}
            chatId={chatId}
          />
        </div>
        <WriteChat socket={socket} chat={data} reply={reply} setReply={setReply} />
      </div>
    </div>
  );
};

export default ChatBox;

// --- Date separator helper ---
const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const MessageList = ({ messages, user, chatUser, markRef, setMark, refetch, setReply, virtuosoRef, chatId }) => {
  let lastDate = "";
  const [atBottom, setAtBottom] = useState(true);
  const pendingScroll = useRef(false);

  useEffect(() => {
    pendingScroll.current = true;
  }, [chatId]);

  useEffect(() => {
    if (pendingScroll.current && messages.length) {
      pendingScroll.current = false;
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: "LAST", behavior: "smooth" });
      }, 100);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({ index: "LAST", behavior: "smooth" });
  };

  return (
    <div className="relative h-full">
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        followOutput="smooth"
        overscan={200}
        atBottomStateChange={setAtBottom}
        itemContent={(index, msg) => {
          const msgDate = msg?.createdAt ? new Date(msg.createdAt).toDateString() : "";
          const showDateSep = msgDate && msgDate !== lastDate;
          if (showDateSep) lastDate = msgDate;
          return (
            <React.Fragment key={msg?._id || index}>
              {showDateSep && (
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                    {formatDateLabel(msg?.createdAt)}
                  </span>
                </div>
              )}
              <MessageItem
                msg={msg}
                user={user}
                chatUser={chatUser}
                refetch={refetch}
                setReply={setReply}
                markRef={markRef}
                setMark={setMark}
              />
            </React.Fragment>
          );
        }}
      />
      {!atBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 z-10"
        >
          <VerticalAlignBottomOutlined className="text-lg" />
        </button>
      )}
    </div>
  );
};

const fmtTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
};

const UserAvatar = ({ name, size = 32 }) => (
  <Avatar size={size} className="rounded-full shrink-0 bg-gray-400 text-white text-xs">
    {name?.slice(0, 1) || "?"}
  </Avatar>
);

const MessageItem = memo(({ msg, user, chatUser, refetch, setReply, markRef, setMark }) => {
  const [play, setPlay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const isOwn = msg?.sender === user?._id;
  const isMarked = markRef.current === msg?._id;

  const deleteMessage = useCallback(async () => {
    try {
      await api.delete(`/message/${msg?._id}`);
      refetch();
      toast.success("Message Delete Success");
    } catch { toast.error("Something went wrong"); }
  }, [msg?._id, refetch]);

  const updateMessage = useCallback((e) => {
    e.preventDefault();
    api.put(`/message/update/${msg?._id}`, { message: e.target.message.value }).then(() => {
      refetch();
      toast.success("Message Update Success");
    });
  }, [msg?._id, refetch]);

  const handleReply = useCallback(() => setReply(msg), [msg, setReply]);

  const scrollToReplied = useCallback(() => {
    const el = document.getElementById(msg?.reply?._id);
    if (el) {
      setMark(msg?.reply?._id);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [msg?.reply?._id, setMark]);

  const copyText = useCallback(() => {
    if (msg?.message) {
      navigator.clipboard.writeText(msg?.message);
      toast.success("Copied");
    }
  }, [msg?.message]);

  return (
    <div className={`flex items-end gap-2 px-4 py-1 ${isOwn ? "flex-row-reverse" : ""}`}>
      {isOwn ? (
        <UserAvatar name={user?.name} />
      ) : (
        <UserAvatar name={chatUser?.name} />
      )}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className="flex items-center gap-1 mb-0.5">
          <Popover
            trigger={"click"}
            showArrow
            content={
              <div className="flex flex-col gap-y-2 text-gray-800">
                {isOwn && (
                  <>
                    <button onClick={deleteMessage} className="w-[200px] py-1 text-start border-b border-primary">Delete Message</button>
                    <Popover
                      trigger={"click"}
                      showArrow
                      content={
                        <form onSubmit={updateMessage} className="min-w-[300px] flex flex-col gap-y-2">
                          <Input.TextArea name="message" defaultValue={msg?.message} />
                          <Button type="primary" size="small" htmlType="submit" className="w-[100px] py-3">Update</Button>
                        </form>
                      }
                    >
                      <button className="w-[200px] py-1 text-start border-b border-primary">Update Message</button>
                    </Popover>
                  </>
                )}
                <button onClick={handleReply} className="w-[200px] py-1 text-start border-b border-black">Reply</button>
                {msg.message && (
                  <button onClick={copyText} className="w-[200px] py-1 text-start border-black">Copy</button>
                )}
              </div>
            }
          >
            <button className="text-gray-400 hover:text-gray-600 text-base p-2"><FontAwesomeIcon icon={faPenToSquare} /></button>
          </Popover>
          {msg.reply && (
            <button onClick={scrollToReplied} className="text-gray-400 text-[10px] hover:underline truncate max-w-[150px]">
              ↰ {msg?.reply?.message?.slice(0, 30) || "media"}
            </button>
          )}
        </div>
        <div
          id={msg?._id}
          className={`relative px-3 py-2 text-sm leading-snug rounded-2xl shadow-sm ${
            isOwn
              ? "bg-[#180d60] text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md"
          } ${isMarked ? "ring-2 ring-yellow-400" : ""}`}
        >
          {msg.reply && (
            <div className="mb-1 pl-2 border-l-2 border-white/40 text-[10px] opacity-70">
              {msg?.reply?.message?.slice(0, 60) || "Replied to media"}
            </div>
          )}
          <LinkifyText text={msg?.message} />
          {msg.image && <Image width={200} src={msg?.image} className="mt-1 rounded-lg" style={{ maxWidth: "100%" }} />}
          {msg.video &&
            (playing ? (
              <video width={260} controls autoPlay={false} className="rounded-lg mt-1" style={{ maxWidth: "100%" }}>
                <source src={msg.video} type="video/mp4" />
              </video>
            ) : (
              <div className="w-[260px] h-[130px] flex items-center justify-center flex-col bg-black/5 rounded-lg mt-1" style={{ maxWidth: "100%" }}>
                <PlayCircleFilled className="text-4xl cursor-pointer text-gray-500" onClick={() => setPlaying(true)} />
                <h2 className="text-xs mt-1">Click To Play</h2>
              </div>
            ))}
          {msg.audio && (
            <div className="flex items-center gap-x-2 mt-1">
              <button className="text-lg" onClick={() => setPlay((p) => !p)}>
                {!play && <PlayCircleOutlined />}
              </button>
              {play ? (
                <audio controls src={msg.audio} className="h-8"></audio>
              ) : (
                <img width={100} height={30} src="/message-wave.png" alt="voice" />
              )}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[9px] text-gray-400">{fmtTime(msg?.createdAt)}</span>
          {isOwn && (
            <span className={`text-[9px] ${msg?.seen ? "text-blue-400" : "text-gray-400"}`}>
              {msg?.seen ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export const LinkifyText = ({ text }) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </p>
  );
};
