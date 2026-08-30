import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Button } from "@material-tailwind/react";
import {
  UserIcon,
  LockClosedIcon,
  CreditCardIcon,
  BellIcon,
  ChevronLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Cookie from "js-cookie";
import { api } from "../../util/axios";
import Loader from "../../Components/Loader";

const UserSettings = () => {
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "Male",
    education: user?.education || "Other",
    fbId: user?.fbId || "",
    paymentMethod: user?.paymentMethod || "Bkash",
    account: user?.account || "",
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

  const handleLogout = () => {
    Cookie.remove("token-you");
    localStorage.clear();
    toast.success("লগআউট সফল হয়েছে");
    window.location.href = "/";
  };

  const tabs = [
    { id: "profile", label: "প্রোফাইল তথ্য", icon: UserIcon },
    { id: "security", label: "সিকিউরিটি & পাসওয়ার্ড", icon: LockClosedIcon },
    { id: "payment", label: "উইথড্রয়াল অ্যাকাউন্ট", icon: CreditCardIcon },
    { id: "preferences", label: "প্রিফারেন্স & নোটিফিকেশন", icon: BellIcon },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-[#f8faff] min-h-screen pb-24 pt-4">
      <div className="container mx-auto px-4 max-w-3xl space-y-4">
        
        {/* 📱 Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
          <div className="flex items-center gap-2.5">
            <Link
              to="/user/home"
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:text-[#5a32fa] transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#0b0c2a]">
                অ্যাকাউন্ট সেটিংস
              </h1>
              <p className="text-[11px] text-gray-400">
                ব্যক্তিগত তথ্য ও সিকিউরিটি কনফিগারেশন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            <span>ভেরিফাইড মেম্বার</span>
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
                    ? "bg-[#5a32fa] text-white shadow-sm"
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
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5a32fa] flex items-center justify-center font-black text-sm">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-1">
                  <span>{user?.name}</span>
                  <CheckBadgeIcon className="w-4 h-4 text-[#5a32fa]" />
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">@{user?.username} • Level {user?.level || 1}</p>
              </div>
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">লিঙ্গ (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#5a32fa]"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#5a32fa]"
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5a32fa]"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
                >
                  প্রোফাইল সেভ করুন
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 🔒 Tab 2: Security & Password */}
        {activeTab === "security" && (
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-1.5">
                <LockClosedIcon className="w-4 h-4 text-[#5a32fa]" />
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
              </h3>
              <p className="text-[11px] text-gray-400">
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#5a32fa] pr-10"
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
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#5a32fa] pr-10"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#5a32fa]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
                >
                  পাসওয়ার্ড আপডেট করুন
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 💳 Tab 3: Withdrawal Accounts */}
        {activeTab === "payment" && (
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-1.5">
                <CreditCardIcon className="w-4 h-4 text-[#5a32fa]" />
                <span>উইথড্রয়াল অ্যাকাউন্ট ডিফল্ট সেটিংস</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                টাকা উত্তোলনের সময় যে নম্বর ও মেথড স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">পছন্দের পেমেন্ট মেথড</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#5a32fa]"
                >
                  <option value="Bkash">🌸 বিকাশ (bKash Personal)</option>
                  <option value="Nagad">🔥 নগদ (Nagad Personal)</option>
                  <option value="Rocket">🚀 রকেট (Rocket DBBL)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700">ডিফল্ট পার্সোনাল অ্যাকাউন্ট নম্বর</label>
                <input
                  type="text"
                  required
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#5a32fa]"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#5a32fa] hover:bg-[#4b26e0] normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
                >
                  পেমেন্ট ইনফো সেভ করুন
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ⚙️ Tab 4: Preferences & Alerts */}
        {activeTab === "preferences" && (
          <Card className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b0c2a] flex items-center gap-1.5">
                <BellIcon className="w-4 h-4 text-[#5a32fa]" />
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
                  className="w-4 h-4 text-[#5a32fa] rounded cursor-pointer accent-[#5a32fa]"
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
                  className="w-4 h-4 text-[#5a32fa] rounded cursor-pointer accent-[#5a32fa]"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0b0c2a]">ডিফল্ট ভাষা</p>
                  <p className="text-[11px] text-gray-400">বাংলা (বাংলাদেশ)</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-[#5a32fa] font-bold text-[11px]">
                  বাংলা (সক্রিয়)
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 🚪 Log Out & Account Security Footer */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>ভার্সন: <strong>1.0.0</strong></span>
            <span>•</span>
            <span>CNP-PROMO Secure</span>
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
    </div>
  );
};

export default UserSettings;
