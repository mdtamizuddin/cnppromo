import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { Button, Input, Select, Option } from "@material-tailwind/react";
import moment from "moment";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { api } from "../../../../util/axios";
import { ACCOUNT_STATES, getAccountState } from "../../../../util/accountState";
import DeleteConfirmModal from "../../../../Components/DeleteConfirmModal";

const InfoRow = ({ icon: Icon, label, value, onCopy, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
    <span className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
      <Icon className="w-4 h-4 text-gray-400" />
      {label}
    </span>
    <span className="flex items-center gap-1.5 min-w-0 text-sm font-medium text-gray-900">
      {children || <span className="truncate">{value || "N/A"}</span>}
      {onCopy && value && (
        <button
          type="button"
          onClick={onCopy}
          className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
          title={`Copy ${label}`}
        >
          <DocumentDuplicateIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  </div>
);

const PremiumUserDetailsModal = ({ user, onClose, refetch, deleted = false }) => {
  const navigate = useNavigate();
  const { user: admin } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [shown, setShown] = useState(false);

  const [value, setValue] = useState({
    name: "",
    username: "",
    role: "user",
  });

  useEffect(() => {
    if (user) {
      setValue({
        name: user.name || "",
        username: user.username || "",
        role: user.role || "user",
      });
      setPassword("");
      setDeleteReason("");
      setConfirmApprove(false);
      setIsEditing(false); // Reset to view mode on user change
    }
  }, [user]);

  // Slide the drawer in on open; lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!user) {
      setShown(false);
      return;
    }
    const frame = requestAnimationFrame(() => setShown(true));
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !deleteOpen && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [user, deleteOpen, loading, onClose]);

  if (!user) return null;

  const accountState = deleted ? "deleted" : getAccountState(user);
  const state = ACCOUNT_STATES[accountState];
  const isDeleted = accountState === "deleted";
  const isPending = accountState === "pending";
  const isBanned = accountState === "banned";
  // Every write endpoint behind this drawer is admin-only on the backend.
  const isAdmin = admin?.role === "admin";
  const canEdit = isAdmin && !isDeleted;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/user/${user._id}`, value);
      toast.success(res.data.message || "User updated successfully");
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password) return toast.error("Please enter a new password");
    try {
      setLoading(true);
      await api.put(`/user/new-password/${user._id}`, { password });
      toast.success("Password updated successfully");
      setPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await api.delete(`/user/${user._id}`, { data: { reason: deleteReason.trim() } });
      toast.success(res.data.message || "User deleted");
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/user/restore/${user._id}`);
      toast.success(res.data.message || "User restored");
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to restore user");
    } finally {
      setLoading(false);
    }
  };

  const handleLockUnlock = async (lockStatus) => {
    try {
      setLoading(true);
      const res = await api.put(`/user/${user._id}`, { lock: lockStatus });
      toast.success(res.data.message || `User ${lockStatus ? 'locked' : 'unlocked'}`);
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update lock status");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await api.put(`/user/active/${user._id}`);
      toast.success("User is now active");
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to activate user");
    } finally {
      setLoading(false);
      setConfirmApprove(false);
    }
  };

  const handleGoToCheckBalance = () => {
    onClose();
    const query = encodeURIComponent(user.username || user.email);
    navigate(`/admin/check?search=${query}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={() => !loading && onClose()}
      />

      {/* Drawer: bottom sheet on mobile, right-side panel on md+ */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-[2rem]
          md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[460px] md:max-h-none md:rounded-none md:rounded-l-3xl
          ${shown ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}`}
      >
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[inherit]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={user.avatar || "/default-avater.png"}
                alt={user.name}
                className="w-16 h-16 rounded-2xl border border-gray-100 shadow-sm object-cover"
                onError={(e) => { e.target.src = "/default-avater.png"; }}
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${state.dot}`} title={state.label}></span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900 truncate">{user.name}</h2>
              <button
                type="button"
                onClick={() => handleCopy(user.username, "Username")}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                @{user.username}
              </button>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${state.badge}`}>
                  {state.label}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 capitalize">
                  {user.role || "user"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-full transition-colors ${isEditing ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                  title={isEditing ? "View details" : "Edit profile"}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* State banner: why this account is not plain active */}
          {state.banner && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${state.banner}`}>
              {isDeleted ? (
                <TrashIcon className="w-5 h-5 shrink-0" />
              ) : isBanned ? (
                <LockClosedIcon className="w-5 h-5 shrink-0" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
              )}
              <div className="min-w-0 space-y-0.5">
                {isDeleted ? (
                  <>
                    <p className="font-bold">
                      Deleted {user.deletedAt ? moment(user.deletedAt).format("MMM DD, YYYY h:mm A") : ""}
                      {" by "}
                      {user.deletedBy ? `${user.deletedBy.name} (@${user.deletedBy.username})` : "unknown admin"}
                    </p>
                    <p className="break-words">Reason: {user.deleteReason || "Not recorded"}</p>
                  </>
                ) : isBanned ? (
                  <p className="font-bold">This account is locked. The user cannot sign in.</p>
                ) : isPending ? (
                  <>
                    <p className="font-bold">Waiting for activation since {moment(user.createdAt).format("MMM DD, YYYY")}.</p>
                    <p>Approving activates the account and pays referral commission to the upline.</p>
                  </>
                ) : (
                  <p className="font-bold">This account is inactive.</p>
                )}
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Edit Profile</h3>
              <Select
                label="User Role"
                value={value.role}
                onChange={(val) => setValue({ ...value, role: val })}
              >
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
                <Option value="moderator">Moderator</Option>
              </Select>
              <Input
                label="Full Name"
                value={value.name}
                onChange={(e) => setValue({ ...value, name: e.target.value })}
              />
              <Input
                label="Username"
                value={value.username}
                onChange={(e) => setValue({ ...value, username: e.target.value })}
              />
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                  <KeyIcon className="w-4 h-4 text-gray-500" /> Update Password
                </h4>
                <div className="flex gap-2">
                  <Input
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button color="green" className="whitespace-nowrap normal-case" onClick={handleUpdatePassword}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Balance */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 to-[#1b263b] text-white flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300/80">Balance</span>
                  <div className="text-2xl font-black font-mono">
                    <span className="text-teal-400">৳</span> {user.balance}
                  </div>
                </div>
                {!isDeleted && (
                  <button
                    type="button"
                    onClick={handleGoToCheckBalance}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition-colors"
                    title="Update balance on Check & Balance page"
                  >
                    <BanknotesIcon className="w-4 h-4 text-teal-300" />
                    Check & Balance
                  </button>
                )}
              </div>

              {/* Details */}
              <div className="rounded-2xl border border-gray-100 px-4">
                <InfoRow icon={EnvelopeIcon} label="Email" value={user.email} onCopy={() => handleCopy(user.email, "Email")} />
                <InfoRow icon={PhoneIcon} label="WhatsApp" value={user.phone} onCopy={() => handleCopy(user.phone, "Phone")} />
                <InfoRow
                  icon={UserGroupIcon}
                  label="Referrer"
                  value={user.reffer?.username}
                  onCopy={() => handleCopy(user.reffer.username, "Referrer")}
                >
                  {user.reffer?.username ? (
                    <span className="truncate">{user.reffer.name} (@{user.reffer.username})</span>
                  ) : (
                    <span className="text-gray-500">Direct Signup</span>
                  )}
                </InfoRow>
                <InfoRow icon={CalendarDaysIcon} label="Joined" value={moment(user.createdAt).format("MMM DD, YYYY")} />
                {user.activatedAt && (
                  <InfoRow icon={CheckBadgeIcon} label="Activated" value={moment(user.activatedAt).format("MMM DD, YYYY")} />
                )}
                <InfoRow icon={ShieldCheckIcon} label="User ID" value={user._id} onCopy={() => handleCopy(user._id, "User ID")}>
                  <span className="truncate font-mono text-xs text-gray-600">{user._id}</span>
                </InfoRow>
              </div>
            </>
          )}
        </div>

        {/* Footer actions, driven by account state */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-gray-100 bg-gray-50/60 md:rounded-bl-3xl">
          {!isAdmin ? (
            <p className="text-xs text-center text-gray-500">Only admins can change this account.</p>
          ) : isEditing ? (
            <div className="flex justify-end gap-3">
              <Button variant="text" color="gray" onClick={() => setIsEditing(false)} className="normal-case">Cancel</Button>
              <Button color="blue" onClick={handleUpdate} className="normal-case">Save Changes</Button>
            </div>
          ) : confirmApprove ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-700">
                Approve <strong>@{user.username}</strong>? The account becomes active and referral commission is paid to the upline. This cannot be undone from here.
              </p>
              <div className="flex gap-2">
                <Button variant="outlined" color="gray" className="flex-1 normal-case" onClick={() => setConfirmApprove(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 normal-case bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1.5" onClick={handleApprove}>
                  <CheckCircleIcon className="w-4 h-4" /> Confirm Approve
                </Button>
              </div>
            </div>
          ) : isDeleted ? (
            <Button
              className="w-full normal-case bg-gray-900 hover:bg-gray-800 flex items-center justify-center gap-1.5"
              onClick={handleRestore}
            >
              <ArrowPathIcon className="w-4 h-4" /> Restore User
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="text"
                color="red"
                className="normal-case hover:bg-red-50 flex items-center gap-1.5"
                onClick={() => setDeleteOpen(true)}
              >
                <TrashIcon className="w-4 h-4" /> {isPending ? "Reject" : "Delete"}
              </Button>
              <div className="flex-1" />
              {isBanned ? (
                <Button
                  color="green"
                  className="normal-case shadow-none flex items-center gap-1.5"
                  onClick={() => handleLockUnlock(false)}
                >
                  <LockOpenIcon className="w-4 h-4" /> Unlock
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="red"
                  className="normal-case border-red-100 text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                  onClick={() => handleLockUnlock(true)}
                >
                  <LockClosedIcon className="w-4 h-4" /> Lock
                </Button>
              )}
              {isPending && (
                <Button
                  className="normal-case bg-blue-600 hover:bg-blue-700 shadow-none flex items-center gap-1.5"
                  onClick={() => setConfirmApprove(true)}
                >
                  <CheckCircleIcon className="w-4 h-4" /> Approve
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`${isPending ? "Reject" : "Delete"} "${user.name}"?`}
        message="আপনি কি নিশ্চিত যে এই ইউজারকে মুছে ফেলতে চান? মুছে ফেলা ইউজারকে Deleted Users পেজ থেকে ফিরিয়ে আনা যাবে।"
        itemName={`#${user.username}`}
        confirmText={isPending ? "Reject User" : "Delete User"}
        cancelText="Cancel"
        loading={loading}
      >
        <textarea
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Reason (e.g. invalid TRX, duplicate account)"
          className="w-full text-sm text-gray-900 p-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-300 outline-none resize-none"
        />
      </DeleteConfirmModal>
    </>
  );
};

export default PremiumUserDetailsModal;
