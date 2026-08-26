import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { useSocketContext } from "../../Components/SocketContext";
import { useLocation } from "react-router-dom";
import { Spin } from "antd";

const Message = () =>
{
  const { socket, message } = useSocketContext();
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const search = location.search;
  const searchparams = new URLSearchParams(search);
  const chatId = searchparams.get("chat");
  const sortby = searchparams.get("sortby");

  const [data, setData] = useState([]);

  const { refetch, isLoading } = useQuery({
    queryKey: ["chat-list", user?._id, chatId],
    queryFn: async () =>
    {
      const res = await api.get(`/message/user/${user?._id}?sortby=${sortby}`);
      setData(res.data);
      return res.data;
    },
    enabled: !!user,
  });
  useEffect(() =>
  {
    if (message) {
      const index = data.findIndex(
        (item) =>
          item._id === message?.chat ||
          (item?.user?._id === message?.sender &&
            item?.owner?._id === message?.receiver)
      );
      if (index !== -1) {
        setData((prev) =>
          prev.map((item, i) =>
          {
            if (index === i) {
              return {
                ...item,
                message: message,
                updatedAt: new Date(),
              };
            }
            return item;
          })
        );
      }
    }
  }, [message]);

  const [mode, setMode] = useState(false);
  const [notactive, setNotActive] = useState(false);
  useEffect(() =>
  {
    if (user?.status !== "active") {   
      setNotActive(true);
    }
    else {
      setNotActive(false);
    }
  }, [user]);


  return <>
    {
      notactive ?
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-red-500">
            Your account is not active. Please Wait for admin approval.
          </h1>
        </div>
        :
        <div className="message">
          <Spin spinning={isLoading} />
          <div className="container mx-auto">
            <div className="">
              {mode || !chatId ? (
                <ChatList
                  setOpen={setMode}
                  socket={socket}
                  users={data}
                  open={mode}
                  refetch={refetch}
                />
              ) : (
                <ChatBox setShowSidebar={setMode} socket={socket} users={data} />
              )}
            </div>
          </div>
        </div>
    }
  </>
};
export default Message;
