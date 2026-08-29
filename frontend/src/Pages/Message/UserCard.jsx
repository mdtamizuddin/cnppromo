import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { PresenceAvatar } from "./components/Primitives";

const UserCard = ({ user, setOpen }) => {
  const { user: currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const startChat = async () => {
    if (busy) return;
    try {
      setBusy(true);
      const res = await api.post("/message/chat", { owner: currentUser?._id, user: user?._id });
      const params = new URLSearchParams(window.location.search);
      params.set("chat", res.data._id);
      navigate(`${window.location.pathname}?${params.toString()}`);
      setOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not open that conversation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startChat}
      disabled={busy}
      className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left
        hover:bg-gray-50 disabled:opacity-60 transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <PresenceAvatar name={user?.name} active={user?.active} size={44} />
      <span className="flex-1 min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-800 truncate">{user?.name}</span>
          <span className="text-[10px] text-gray-400 shrink-0">{user?.username}</span>
        </span>
        <span className="block text-xs text-gray-500 truncate mt-0.5">
          {user?.phone || user?.email || " "}
        </span>
      </span>
      <span
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-gray-500 shrink-0
          group-hover:bg-brand-soft group-hover:text-brand transition-colors"
      >
        <ChatBubbleLeftRightIcon className="w-[18px] h-[18px]" />
      </span>
    </button>
  );
};

export default UserCard;
