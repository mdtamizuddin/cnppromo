import React from "react";
import { useSocketContext } from "../../Components/SocketContext";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { LinkifyText } from "./ChatBox";
import { Image } from "antd";
import {
  ArrowRightOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Link } from "react-router-dom";
import { Spin } from "antd";
const AllMessages = () => {
  const { socket, message } = useSocketContext();
  const search = new URLSearchParams(window.location.search);
  const user = search.get("user");
  const { data, isFetching } = useQuery({
    queryKey: ["messages", message, user],
    queryFn: async () => {
      const res = await api.get(
        `/message/all/msg?limit=200${user && `&user=${user}`}`
      );
      return res.data;
    },
  });
  const [playing, setPlaying] = React.useState(false);
  const [play, setPlay] = React.useState(false);
  return (
    <div className="h-screen container mx-auto border overflow-y-auto grid gap-y-2 bg-black p-5">
      <Spin size="large" spinning={isFetching} fullscreen/>
      {data?.map((msg, i) => {
        return (
          <div key={i}>
            <div className="flex text-white text-xs mb-1">
              <a href={`/all-message?user=${msg.sender?._id}`}>
                {msg.sender?.username}
              </a>
              <ArrowRightOutlined className="px-2" />
              <a href={`/all-message?user=${msg.receiver?._id}`}>
                {msg.receiver?.username}
              </a>
            </div>
            <div
              key={i}
              className="relative max-w-xl px-2 py-2 text-black font-normal bg-white shadow rounded-2xl"
            >
              <LinkifyText text={msg?.message} />
              {msg.image && <Image height={100} src={msg?.image} />}
              {msg.video &&
                (playing ? (
                  <video
                    width={300}
                    controls
                    autoPlay={false}
                    className="rounded-lg"
                  >
                    <source src={msg.video} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-[300px] h-[140px] flex items-center justify-center flex-col">
                    <PlayCircleFilled
                      className="text-4xl cursor-pointer"
                      onClick={() => setPlaying(true)}
                    />
                    <h2 className="text-sm mt-2">Click To Play</h2>
                  </div>
                ))}
              {msg.audio && (
                <div className="flex items-center gap-x-2">
                  <button
                    className="text-xl"
                    onClick={() => {
                      setPlay(!play);
                    }}
                  >
                    {!play && <PlayCircleOutlined />}
                  </button>
                  {play ? (
                    <audio controls src={msg.audio}></audio>
                  ) : (
                    <img width={130} height={40} src="/message-wave.png" alt="voice" />
                  )}
                </div>
              )}
              <p className="text-[8px]  w-auto text-black mt-1">
                {moment(msg?.createdAt).fromNow()}
                <span
                  className={`ml-2 ${
                    msg?.seen ? "text-green-300" : "text-gray-100"
                  }`}
                >
                  {msg?.seen ? "Seen" : "Sent"}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMessages;
