import React, { useState, useEffect } from "react";
import { XMarkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select, Option } from "@material-tailwind/react";
import moment from "moment";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { api } from "../../../../util/axios";

const PremiumUserDetailsModal = ({ user, onClose, refetch }) => {
  if (!user) return null;

  const { user: admin } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false); // Reset to view mode on user change
    }
  }, [user]);

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
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await api.delete(`/user/${user._id}`);
      toast.success(res.data.message || "User deleted");
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
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
      await api.put(`/user/${user._id}`, { status: "active" });
      toast.success("User is now active");
      refetch();
      onClose();
    } catch (error) {
      toast.error("Failed to activate user");
    } finally {
      setLoading(false);
    }
  };

  const isPending = user.status === "pending";
  const canEdit = admin?.role === "admin" || admin?.role === "moderator";

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-t-[2rem] md:rounded-3xl shadow-2xl border border-gray-200 z-50 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in-up">
        
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[inherit]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-10">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Left Profile Section */}
        <div className="flex flex-col items-center md:justify-center w-full md:w-1/3 md:border-r border-gray-100 pr-0 md:pr-6 relative">
          <div className="relative">
             <img
               src={user.avatar || "/default-avater.png"}
               alt={user.name}
               className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-md object-cover mb-3"
             />
             <span className={`absolute bottom-4 right-1 md:bottom-5 md:right-2 w-4 h-4 rounded-full border-2 border-white ${isPending ? 'bg-amber-500' : 'bg-green-500'}`}></span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">#{user.username}</p>
          <div className="mt-4 md:mt-6 w-full px-4 md:px-0">
             <div className={`w-full rounded-xl p-2.5 flex items-center justify-center gap-2 border ${isPending ? 'bg-amber-50 border-amber-100/50' : 'bg-green-50 border-green-100/50'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${isPending ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                <span className={`text-[11px] font-bold tracking-wider ${isPending ? 'text-amber-700' : 'text-green-700'}`}>
                  {isPending ? 'PENDING REVIEW' : 'ACTIVE USER'}
                </span>
             </div>
          </div>

          {!isPending && canEdit && (
            <div className="mt-6 w-full flex flex-col gap-2">
              <Button 
                variant={isEditing ? "filled" : "outlined"} 
                color="blue" 
                className="w-full normal-case"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "View Details" : "Edit Profile"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Details Section */}
        <div className="flex-1 flex flex-col justify-between mt-2 md:mt-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4 hidden md:block">
              {isEditing ? "Edit User Information" : "User Information"}
            </h3>

            {isEditing ? (
              <div className="flex flex-col gap-4 animate-fade-in">
                {admin?.role === "admin" && (
                  <div className="w-full">
                    <Select
                      label="User Role"
                      value={value.role}
                      onChange={(val) => setValue({ ...value, role: val })}
                    >
                      <Option value="user">User</Option>
                      <Option value="admin">Admin</Option>
                      <Option value="moderator">Moderator</Option>
                    </Select>
                  </div>
                )}
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
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Update Password</h4>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm animate-fade-in">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Referer ID</span>
                  <span className="text-gray-900 font-medium flex items-center gap-2">
                    {user.reffer?.username || "Direct Signup"}
                    {user.reffer?.username && (
                      <DocumentDuplicateIcon 
                        className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
                        onClick={() => {
                          navigator.clipboard.writeText(user.reffer.username);
                          toast.success("Copied Referer ID");
                        }}
                      />
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Role</span>
                  <span className="text-gray-900 font-medium capitalize">{user.role}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Email</span>
                  <span className="text-gray-900 font-medium truncate">{user.email}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">WhatsApp</span>
                  <span className="text-gray-900 font-medium">{user.phone}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Balance</span>
                  <span className="text-gray-900 font-bold text-base">৳ {user.balance}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Joined Date</span>
                  <span className="text-gray-900 font-medium">{moment(user.createdAt).format("MMM DD, YYYY")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3 mt-6 pt-6 border-t border-gray-100 w-full">
            {isPending ? (
              <>
                <Button variant="outlined" color="red" className="flex-1 flex justify-center items-center border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 normal-case px-4 py-2.5 rounded-xl transition-colors focus:ring-0" onClick={handleDelete}>
                  Reject
                </Button>
                <Button 
                  className="flex-1 flex justify-center items-center bg-blue-600 text-white normal-case px-4 py-2.5 hover:bg-blue-700 shadow-none hover:shadow-lg hover:shadow-blue-500/20 rounded-xl transition-all focus:ring-0"
                  onClick={handleApprove}
                >
                  Approve User
                </Button>
              </>
            ) : isEditing ? (
               <div className="flex-1 flex justify-end gap-3">
                 <Button variant="text" color="gray" onClick={() => setIsEditing(false)} className="normal-case">Cancel</Button>
                 <Button color="blue" onClick={handleUpdate} className="normal-case">Save Changes</Button>
               </div>
            ) : (
              <div className="flex-1 flex justify-between items-center gap-2">
                <Button variant="text" color="red" className="normal-case hover:bg-red-50" onClick={handleDelete}>
                  Delete User
                </Button>
                {user.lock ? (
                  <Button variant="filled" color="green" className="normal-case shadow-none" onClick={() => handleLockUnlock(false)}>
                    Unlock Profile
                  </Button>
                ) : (
                  <Button variant="outlined" color="red" className="normal-case border-red-100 text-red-500 hover:bg-red-50" onClick={() => handleLockUnlock(true)}>
                    Lock Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumUserDetailsModal;
