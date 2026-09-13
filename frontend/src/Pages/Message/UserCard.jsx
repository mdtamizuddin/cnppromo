import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChatBubbleLeftRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { PresenceAvatar } from "./components/Primitives";

const UserCard = ({ user, setOpen }) => {
  const { user: currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const isTamiz =
    user?.username?.trim().toLowerCase() === "tamiz" ||
    user?.name?.toLowerCase().includes("tamiz") ||
    user?.name?.toLowerCase().includes("don't message");
  const [unlocked, setUnlocked] = useState(true);
  const [clicks, setClicks] = useState(0);

  const isDisabled = isTamiz && !unlocked;

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

  const handleClick = () => {
    if (isDisabled) {
      const nextClicks = clicks + 1;
      setClicks(nextClicks);
      if (nextClicks >= 10) {
        setUnlocked(true);
        toast.success("Unlocked!");
        startChat();
      }
      return;
    }
    startChat();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-disabled={isDisabled}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all select-none focus:outline-none ${
        isDisabled
          ? "bg-gray-50/60 cursor-not-allowed hover:bg-gray-100/60"
          : "hover:bg-gray-50 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer"
      }`}
    >
      <div className={isDisabled ? "opacity-60" : ""}>
        <PresenceAvatar
          src={user?.avatar}
          name={user?.name}
          active={user?.active}
          size={44}
        />
      </div>
      <span className="flex-1 min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold truncate ${isDisabled ? "text-gray-600" : "text-gray-800"}`}>
            {user?.name}
          </span>
          <span className="text-[10px] text-gray-400 shrink-0">{user?.username}</span>
        </span>
        {isTamiz ? (
          <span className="block text-[11px] font-medium text-rose-500 leading-tight mt-0.5">
            কোনো সাপোর্টের প্রয়োজন হলে বাকি ২ জন অ্যাডমিনকে মেসেজ করুন
          </span>
        ) : (
          <span className="block text-xs text-gray-400 truncate mt-0.5">
            {user?.phone || user?.email || "\u00A0"}
          </span>
        )}
      </span>
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
          isDisabled
            ? "bg-gray-100 text-gray-400"
            : "bg-gray-100 text-gray-500 group-hover:bg-brand-soft group-hover:text-brand"
        }`}
      >
        {isDisabled ? (
          <LockClosedIcon className="w-[18px] h-[18px]" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-[18px] h-[18px]" />
        )}
      </span>
    </button>
  );
};

export default UserCard;
