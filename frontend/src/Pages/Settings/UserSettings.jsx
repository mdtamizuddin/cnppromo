import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Button } from "@material-tailwind/react";
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  ChevronLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Cookie from "js-cookie";
import { api } from "../../util/axios";
import { uploadImageToS3 } from "../../util/s3Upload";
import { setCurrentUser } from "../../redux/features/user/userSlice";
import Loader from "../../Components/Loader";
import ImageCropModal from "../../Components/ImageCropModal";

const UserSettings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "Male",
    education: user?.education || "Other",
    fbId: user?.fbId || "",
  });

  // Password Form State
  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Preferences
  const [pushEnabled, setPushEnabled] = useState(user?.notificationsEnabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);

  // Device Limit
  const [deviceLimit, setDeviceLimit] = useState(user?.maxActiveSessions ?? 5);
  const [deviceLimitSaving, setDeviceLimitSaving] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setSelectedFile(file);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedBlob) => {
    try {
      setUploadingAvatar(true);
      // Automatically optimize to 512x512 WebP and upload directly to S3
      const avatarUrl = await uploadImageToS3(
        croppedBlob,
        null,
        "user/avatar",
        { maxWidth: 512, maxHeight: 512, quality: 0.85 }
      );

      // Save to user profile in backend
      const res = await api.put("/user/avatar", { avatar: avatarUrl });
      if (res.data?.user) {
        dispatch(setCurrentUser(res.data.user));
      }
      toast.success("Profile photo updated successfully!");
      setCropModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleToggleNotifications = async (checked) => {
    setPushEnabled(checked);
    setPrefSaving(true);
    try {
      const res = await api.put("/user/notification-settings", {
        notificationsEnabled: checked,
      });
      toast.success(res.data?.message || "নোটিফিকেশন সেটিং আপডেট হয়েছে");
    } catch (error) {
      setPushEnabled(!checked);
      toast.error(
        error?.response?.data?.message || error?.message || "সেটিং আপডেট ব্যর্থ হয়েছে"
      );
    } finally {
      setPrefSaving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    try {
      setLoading(true);
      await api.put(`/user/${user._id}`, formData);
      toast.success("প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে"
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("নতুন পাসওয়ার্ড দুটি মিলছে না!");
      return;
    }

    if (passData.newPassword.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/user/password/${user._id}`, {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword,
      });
      toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "বর্তমান পাসওয়ার্ড সঠিক নয়"
      );
    }
  };

const handleDeviceLimitSubmit = async (e) => {
    e.preventDefault();
    const limit = Number(deviceLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      toast.error("ডিভাইস লিমিট ১ থেকে ২০ এর মধ্যে হতে হবে!");
      return;
    }
    setDeviceLimitSaving(true);
    try {
      const res = await api.put("/user/device-limit", { maxActiveSessions: limit });
      toast.success(res.data?.message || "ডিভাইস লিমিট আপডেট হয়েছে");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "ডিভাইস লিমিট আপডেট ব্যর্থ হয়েছে"
      );
    } finally {
      setDeviceLimitSaving(false);
    }
  };

  const handleLogout = () => {
    Cookie.remove("token-you");
    localStorage.clear();
    toast.success("লগআউট সফল হয়েছে");
    window.location.href = "/";
  };

  const tabs = [
    { id: "profile", label: "প্রোফাইল তথ্য", icon: UserIcon },
    { id: "security", label: "সিকিউরিটি & পাসওয়ার্ড", icon: LockClosedIcon },
    { id: "preferences", label: "প্রিফারেন্স & নোটিফিকেশন", icon: BellIcon },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-3xl space-y-4">
        
        {/* 📱 Top Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#042f2e] via-[#0f766e] to-[#0284c7] text-white p-5 shadow-lg shadow-teal-900/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-10 w-24 h-24 rounded-full bg-teal-400/20 blur-xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/user/home"
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-bold">
                  অ্যাকাউন্ট সেটিংস
                </h1>
                <p className="text-[11px] text-white/70">
                  ব্যক্তিগত তথ্য ও সিকিউরিটি কনফিগারেশন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-100 text-[11px] font-bold border border-emerald-300/30 backdrop-blur">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-300" />
              <span>ভেরিফাইড মেম্বার</span>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-3">
            {/* Clickable Profile Avatar with hover camera badge */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-14 h-14 rounded-2xl cursor-pointer overflow-hidden border-2 border-white/40 shadow-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0 transition-transform active:scale-95"
              title="Change Profile Picture"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-black text-xl text-white">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
              {/* Camera Icon Overlay on Hover */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <CameraIcon className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Edit</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-1">
                <span>{user?.name}</span>
                <CheckBadgeIcon className="w-4 h-4 text-sky-300" />
              </p>
              <p className="text-[11px] text-white/70 font-mono">@{user?.username} • Level {user?.level || 1}</p>
            </div>
          </div>
        </div>

        {/* 🏷️ Settings Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 👤 Tab 1: Profile Information */}
        {activeTab === "profile" && (
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-black text-sm shadow-md shadow-teal-500/20">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b0c2a]">
                  প্রোফাইল তথ্য
                </h3>
                <p className="text-[11px] text-gray-400">
                  আপনার ব্যক্তিগত তথ্য সম্পাদনা করুন
                </p>
              </div>
            </div>

            {/* Avatar Row */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-150/80">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-200 border border-gray-200 flex items-center justify-center shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-500">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-800">Profile Photo</h4>
                <p className="text-[11px] text-gray-500">Crop and upload your custom avatar photo.</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all shadow-xs flex items-center gap-1.5"
              >
                <CameraIcon className="w-4 h-4 text-primary" />
                <span>Change Photo</span>
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">ইউজারনেম (অপরিবর্তনীয়)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ""}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-mono text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">ইমেইল এড্রেস (অপরিবর্তনীয়)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-mono text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">পূর্ণ নাম (Full Name)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">ফোন নম্বর (Phone Number)</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">লিঙ্গ (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">মহিলা (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">শিক্ষাগত যোগ্যতা (Education)</label>
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-primary"
                  >
                    <option value="HSC">HSC / Alim</option>
                    <option value="SSC">SSC / Dakhil</option>
                    <option value="Honours">Honours / Degree / Masters</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">Facebook প্রোফাইল লিংক বা আইডি</label>
                <input
                  type="text"
                  required
                  value={formData.fbId}
                  onChange={(e) => setFormData({ ...formData, fbId: e.target.value })}
                  placeholder="https://facebook.com/username"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/20"
                >
                  প্রোফাইল সেভ করুন
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 🔒 Tab 2: Security & Password */}
        {activeTab === "security" && (
          <>
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                  <LockClosedIcon className="w-4 h-4" />
                </span>
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1.5">
                অ্যাকাউন্টের সুরক্ষার জন্য শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">বর্তমান পাসওয়ার্ড (Current Password)</label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    required
                    value={passData.oldPassword}
                    onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                    placeholder="বর্তমান পাসওয়ার্ড দিন"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">নতুন পাসওয়ার্ড (New Password)</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={passData.newPassword}
                      onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">পাসওয়ার্ড নিশ্চিত করুন (Confirm)</label>
                  <input
                    type="password"
                    required
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/20"
                >
                  পাসওয়ার্ড আপডেট করুন
                </Button>
              </div>
            </form>
          </Card>

          {/* 📱 Tab 2b: Active Device Limit */}
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                  <DevicePhoneMobileIcon className="w-4 h-4" />
                </span>
                <span>সক্রিয় ডিভাইস সীমা</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1.5">
                একই সাথে কয়টি ডিভাইসে লগইন থাকতে পারবেন তা নির্ধারণ করুন (১-২০)। ডিফল্ট ৫।
              </p>
            </div>

            <form onSubmit={handleDeviceLimitSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">সর্বোচ্চ ডিভাইস সংখ্যা</label>
                <div className="relative">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={deviceLimit}
                    onChange={(e) => setDeviceLimit(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={deviceLimitSaving}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/20"
                >
                  {deviceLimitSaving ? "সেভ হচ্ছে..." : "ডিভাইস লিমিট সেভ করুন"}
                </Button>
              </div>
            </form>
          </Card>
          </>
        )}

        {/* ⚙️ Tab 3: Preferences & Alerts */}
        {activeTab === "preferences" && (
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <BellIcon className="w-4 h-4" />
                </span>
                <span>অ্যাপ নোটিফিকেশন & ভাষা সেটিংস</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100 text-xs text-gray-700">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0b0c2a]">পুশ নোটিফিকেশন</p>
                  <p className="text-[11px] text-gray-400">
                    বন্ধ করলে নতুন টাস্ক, উইথড্র ও পেমেন্টের কোনো নোটিফিকেশন তৈরি হবে না
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled={prefSaving}
                  checked={pushEnabled}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer accent-teal-600"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0b0c2a]">নোটিফিকেশন সাউন্ড</p>
                  <p className="text-[11px] text-gray-400">নতুন মেসেজ আসলে অডিও প্লে করুন</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer accent-teal-600"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0b0c2a]">ডিফল্ট ভাষা</p>
                  <p className="text-[11px] text-gray-400">বাংলা (বাংলাদেশ)</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-primary-light text-primary font-bold text-[11px]">
                  বাংলা (সক্রিয়)
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 🚪 Log Out & Account Security Footer */}
        <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>ভার্সন: <strong>1.0.0</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" /> CNP-PROMO Secure</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>

      </div>

      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Interactive 1:1 Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSource={selectedFile}
        loading={uploadingAvatar}
        onClose={() => {
          setCropModalOpen(false);
          setSelectedFile(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default UserSettings;
