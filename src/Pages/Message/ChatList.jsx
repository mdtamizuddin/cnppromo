import {
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Button, Input } from "antd";
import { Modal } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import UserCard from "./UserCard";
import { Avatar } from "antd";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import moment from "moment/moment";
import { useLocation } from "react-router-dom";
import { Popover } from "antd";
import { useState } from "react";
import { DatePicker } from "antd";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../../Components/SocketContext";
import SearchMessage from "./SearchMessage";
import { Virtuoso } from "react-virtuoso";

const ChatList = ({ socket, users, open, setOpen, refetch }) => {
  const [visible, setVisible] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [name, setName] = React.useState("");
  const { message } = useSocketContext();
  const { user } = useSelector((state) => state.user);
  const [params, setParams] = React.useState({});
  const { data, isLoading } = useQuery({
    queryKey: ["users-chat-list", params, message],
    queryFn: async () => {
      const res = await api.get(`/user`, { params });
      return res.data || [];
    },
    enabled: visible && !!user,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (query) {
      setParams({ search: query, limit: 100 });
    } else if (user?.role !== "admin") {
      setParams({ admin: true, limit: 100 });
    } else {
      setParams({ limit: 100 });
    }
  }, [query]);
  const [contacts, setContacts] = useState([]);
  const location = useLocation();
  const lo = location?.search;
  const [date, setDate] = useState("");
  const searchparams = new URLSearchParams(window.location.search);
  const sortby = searchparams.get("sortby") || "All";
  const navigate = useNavigate();
  const setSortby = (value) => {
    searchparams.set("sortby", value);
    navigate(`?${searchparams.toString()}`);
  };
  useEffect(() => {
    if (date) {
      const contactsNew = users.filter((item) => {
        const date2 = item?.message?.createdAt
          ? moment(item?.message?.createdAt).format("YYYY-MM-DD")
          : "";
        return date2 === date;
      });
      setContacts(contactsNew);
    }
  }, [date]);
  useEffect(() => {
    setContacts(users);
  }, [users]);
  const [unread, setUnread] = useState(0);
  const [favourite, setFavourite] = useState(0);
  useEffect(() => {
    if (contacts) {
      setUnread(contacts.filter((item) => item?.unseen > 0).length);
      setFavourite(contacts.filter((item) => item?.marked).length);
    }
  }, [contacts]);
  const sortedContacts = contacts
    ?.filter((item) => {
      if (sortby === "Ununswered") return item?.message?.sender === item?.user?._id;
      if (sortby === "Unread") return item?.unseen > 0;
      return item;
    })
    .filter(
      (u) =>
        u?.user?.name?.toLowerCase()?.includes(name.toLowerCase()) ||
        u?.user?.username?.toLowerCase()?.includes(name.toLowerCase())
    )
    .filter((u) => {
      if (sortby === "Favourite") return u?.marked;
      return u;
    })
    .sort((a, b) => (a?.updatedAt > b?.updatedAt ? -1 : 1));
  const steps = [
    { label: "All", key: "All" },
    { label: "Unread", key: "Unread", count: unread },
    { label: "Favourite", key: "Favourite", count: favourite },
  ];
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  useEffect(() => {
    const p = searchparams.get("page") || 1;
    if (p) setPage(p);
  }, [lo]);
  const [openSearch, setOpenSearch] = useState(false);

  const itemsPerPage = 50;
  const pageData = sortedContacts?.slice(0, page * itemsPerPage) || [];

  return (
    <div className="border-r h-auto border-gray-300 lg:col-span-1 lg:block bg-black">
      <SearchMessage open={openSearch} setOpen={setOpenSearch} />
      {visible && (
        <Modal
          open={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          title={user?.role === "admin" ? "Start New Chat" : "Chat With Admin"}
          loading={isLoading}
          footer={null}
        >
          {user?.role === "admin" && (
            <Input
              placeholder="Search User"
              suffix={<SearchOutlined onClick={() => setQuery(search)} />}
              className="mt-3"
              onKeyDown={(e) => { if (e.key === "Enter") setQuery(search); }}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          )}
          <div className="max-h-[75vh] overflow-y-auto mt-5">
            {data?.users?.map((userItem, index) => (
              <UserCard setOpen={setVisible} key={userItem?._id || index} user={userItem} />
            ))}
          </div>
        </Modal>
      )}
      <div className="flex py-3 justify-between items-center px-3">
        <Input
          suffix={
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5 text-gray-300">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="search"
          className="min-w-[250px] max-w-[300px]"
          name="search"
          placeholder="Search User"
          required
        />
        <div className="flex gap-x-3 text-white">
          <button className="p-2 text-lg" onClick={() => setVisible(true)}>
            <PlusOutlined />
          </button>
          <Popover
            trigger={"click"}
            content={
              <div className="flex flex-col space-y-2">
                <Button type="primary" size="small" onClick={() => setOpenSearch(true)}>
                  Search Message
                </Button>
                <DatePicker
                  onChange={(e) => {
                    if (e) setDate(moment(e.$d).format("YYYY-MM-DD"));
                    else { setDate(""); setContacts(users); }
                  }}
                  className="w-[200px]"
                />
              </div>
            }
            placement="bottom"
          >
            <button className="p-2 text-lg"><FilterOutlined /></button>
          </Popover>
        </div>
      </div>
      <div className="flex justify-around overflow-x-auto">
        {steps?.map((item, index) => (
          <div
            onClick={() => { setSortby(item?.key); setName(""); }}
            key={index}
            className={`flex items-center justify-center px-3 py-2 lg:text-sm text-xs transition duration-150 ease-in-out border-b border-gray-300 hover:bg-gray-600 focus:outline-none gap-x-4 cursor-pointer ${
              sortby === item?.key ? "bg-gray-100 text-red-600" : "text-gray-200"
            }`}
          >
            <span>{item?.label}</span>
            {!!item?.count && (
              <span className="bg-red-600 text-xs text-white px-2 py-1 rounded-full">{item?.count}</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: "calc(100vh - 200px)" }}>
        <Virtuoso
          data={pageData}
          itemContent={(index, record) => (
            <Person refetch={refetch} onClick={() => setOpen(false)} socket={socket} user={record} />
          )}
          endReached={() => {
            if (page * itemsPerPage < (sortedContacts?.length || 0)) {
              setPage((p) => p + 1);
            }
          }}
          overscan={200}
        />
      </div>
    </div>
  );
};

export default ChatList;

const Person = React.memo(({ socket, user: chatUser, refetch, onClick }) => {
  const addfavourite = async () => {
    try {
      const res = await api.put(`/message/chat/${chatUser._id}`);
      refetch();
      toast.success(!chatUser?.marked ? "Marked as favourite" : "Removed from favourite");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  const navigate = useNavigate();
  const searchparams = new URLSearchParams(window.location.search);
  const sortby = searchparams.get("sortby") || "All";
  const handleClick = () => {
    searchparams.set("sortby", sortby);
    searchparams.set("chat", chatUser?._id);
    navigate(`/message?${searchparams.toString()}`);
    onClick();
  };
  return (
    <div
      onClick={handleClick}
      className="flex items-center px-3 text-sm transition duration-150 ease-in-out cursor-pointer bg-white focus:outline-none justify-between gap-x-1"
    >
      <Avatar size={50} style={{ minWidth: "50px", minHeight: "50px" }} className="w-10 h-10 rounded-full border-primary">
        {chatUser?.user?.name?.slice(0, 1)}
      </Avatar>
      <div className="w-full pb-2">
        <div className="flex justify-between">
          <span className="block ml-2 font-semibold text-gray-600">
            <span>{chatUser?.user?.name} </span>
            <StarFilled
              onClick={addfavourite}
              className={chatUser?.marked ? "text-yellow-500 text-lg" : "text-gray-500 text-lg"}
            />
          </span>
          <span className="block ml-2 text-sm text-gray-700">
            {chatUser?.user?.active ? (
              <span className="text-green-500">Online</span>
            ) : chatUser?.message?.createdAt ? (
              <span className="text-[8px]">{moment(chatUser?.message?.createdAt).fromNow()}</span>
            ) : (
              <span className="text-red-500">Offline</span>
            )}
          </span>
        </div>
        <p className="ml-2 text-xs text-gray-700 flex items-center">
          {chatUser?.message?.message
            ? chatUser?.message?.message?.slice(0, 50)
            : chatUser?.message?.audio
            ? "Voice Message"
            : chatUser?.message?.video
            ? "Video Message"
            : "No message"}
          {!!chatUser?.unseen && (
            <div className="w-[17px] h-[17px] bg-red-400 text-white rounded-full flex justify-center items-center text-xs ml-2">
              {chatUser?.unseen}
            </div>
          )}
        </p>
      </div>
    </div>
  );
});
