import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { Avatar, Button, Image, Popover, Input, Modal } from "antd";
import {
  BarsOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
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
          <div className="flex items-center" onClick={() => setShowProfile((p) => !p)}>
            <Avatar size={50} style={{ minWidth: "50px", minHeight: "50px" }} className="w-10 h-10 rounded-full">
              {data?.user?.name?.slice(0, 1)}
            </Avatar>
            <div>
              <span className="block ml-2 font-bold text-white">{data?.user?.name}</span>
              <span className="block ml-2 text-sm text-white">
                {data?.user?.active ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <button className="text-white text-2xl font-semibold" onClick={() => { setShowSidebar((p) => !p); goBack(); }}>
            <BarsOutlined />
          </button>
          <span className={`absolute w-3 h-3 rounded-full left-10 top-3 ${data?.user?.active ? "bg-green-600" : "bg-red-600"}`} />
        </div>
        <div className="overflow-hidden relative" style={{ height: "calc(100vh - 210px)" }}>
          <MessageList
            virtuosoRef={virtuosoRef}
            messages={messages}
            user={user}
            markRef={markRef}
            setMark={setMark}
            refetch={refetch}
            setReply={setReply}
          />
        </div>
        <WriteChat socket={socket} chat={data} reply={reply} setReply={setReply} />
      </div>
    </div>
  );
};

export default ChatBox;

const MessageList = ({ messages, user, markRef, setMark, refetch, setReply, virtuosoRef }) => (
  <Virtuoso
    ref={virtuosoRef}
    data={messages}
    followOutput="smooth"
    overscan={200}
    itemContent={(index, msg) => (
      <MessageItem
        key={msg?._id || index}
        msg={msg}
        user={user}
        refetch={refetch}
        setReply={setReply}
        markRef={markRef}
        setMark={setMark}
      />
    )}
  />
);

const fmtTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
};

const MessageItem = memo(({ msg, user, refetch, setReply, markRef, setMark }) => {
  const [play, setPlay] = useState(false);
  const [playing, setPlaying] = useState(false);
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
    <div
      id={msg?._id}
      className={`flex chat ${msg?.sender === user?._id ? "chat-end" : "chat-start"} flex-col px-4 py-1 ${isMarked ? "border-2 border-yellow-400 rounded" : ""}`}
    >
      <div className="chat-header py-[3px]">
        <div className="flex gap-x-4 items-end">
          {msg.reply && (
            <p onClick={scrollToReplied} className="text-gray-400 text-sm cursor-pointer">
              <span className="block">Replied to:</span>
              <span className="text-xs">
                {msg?.reply?.message ? msg.reply.message.slice(0, 50) : msg?.reply?.audio ? "Voice Message" : msg?.reply?.video ? "Video" : "Image"}
              </span>
            </p>
          )}
          <Popover
            trigger={"click"}
            showArrow
            content={
              <div className="flex flex-col gap-y-2 text-gray-800">
                {msg?.sender === user?._id && (
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
                <button onClick={handleReply} className="w-[200px] py-1 text-start border-black border-b">Reply</button>
                {msg.message && (
                  <button onClick={copyText} className="w-[200px] py-1 text-start border-black">Copy</button>
                )}
              </div>
            }
          >
            <button className="text-white"><FontAwesomeIcon icon={faPenToSquare} /></button>
          </Popover>
        </div>
      </div>
      <div onClick={() => setMark("")} className={`relative px-2 py-2 text-black font-normal rounded shadow chat-bubble max-w-[80%] ${msg?.sender === user?._id ? " bg-[#180d60] text-white" : "bg-gray-100"}`}>
        <LinkifyText text={msg?.message} />
        {msg.image && <Image width={200} src={msg?.image} />}
        {msg.video &&
          (playing ? (
            <video width={300} controls autoPlay={false} className="rounded-lg">
              <source src={msg.video} type="video/mp4" />
            </video>
          ) : (
            <div className="w-[300px] h-[140px] flex items-center justify-center flex-col">
              <PlayCircleFilled className="text-4xl cursor-pointer" onClick={() => setPlaying(true)} />
              <h2 className="text-sm mt-2">Click To Play</h2>
            </div>
          ))}
        {msg.audio && (
          <div className="flex items-center gap-x-2">
            <button className="text-xl" onClick={() => setPlay((p) => !p)}>
              {!play && <PlayCircleOutlined />}
            </button>
            {play ? (
              <audio controls src={msg.audio}></audio>
            ) : (
              <img width={130} height={40} src="/message-wave.png" alt="voice" />
            )}
          </div>
        )}
      </div>
      <p className="text-[8px] w-auto text-white mt-1">
        {fmtTime(msg?.createdAt)}
        {msg?.sender === user?._id && (
          <span className={`ml-2 ${msg?.seen ? "text-green-300" : "text-gray-100"}`}>
            {msg?.seen ? "Seen" : "Sent"}
          </span>
        )}
      </p>
    </div>
  );
});

export const LinkifyText = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text?.split(urlRegex);
  return (
    <p className="text-xs">
      {parts?.map((part, index) =>
        urlRegex.test(part) ? (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </p>
  );
};
