import { Input, Modal, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import { api } from "../../util/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SearchMessage = ({ open, setOpen }) => {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!search) { setResult(null); return; }
    const timer = setTimeout(() => {
      api
        .get(`/message/msg/search?text=${search}&user=${user?._id}`)
        .then((res) => setResult(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const navigate = useNavigate();
  const searchparams = new URLSearchParams(window.location.search);

  const chatHandler = async (id) => {
    try {
      const newChat = { owner: user?._id, user: id };
      const res = await api.post("/message/chat", newChat);
      searchparams.set("chat", res.data._id);
      navigate(`/message?${searchparams.toString()}`);
      setOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Modal
      title={`Search Message ${result?.messages?.length || 0}`}
      open={open}
      footer={null}
      onCancel={() => setOpen(false)}
    >
      <Input.Search
        placeholder="Search Message"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      <div className="flex flex-col gap-2 mt-4">
        {result?.messages?.length > 0 ? (
          result?.messages?.map((item) => (
            <div
              onClick={() => chatHandler(item?.sender?._id)}
              key={item._id}
              className="bg-gray-100 p-2 rounded-md shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Avatar size="medium" className="min-w-8" />
              <div>
                <div className="text-sm text-gray-500">{item?.sender?.name}</div>
                <div className="text-xs">{item?.message}</div>
              </div>
            </div>
          ))
        ) : (
          <div>No Message Found</div>
        )}
      </div>
    </Modal>
  );
};

export default SearchMessage;
