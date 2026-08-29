import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import {
  UsersIcon,
  UserMinusIcon,
  NoSymbolIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CreditCardIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { IconButton } from "@material-tailwind/react";

const sidebarData = [
  {
    category: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: Squares2X2Icon, to: "/admin/dashboard", color: "text-indigo-500" },
    ]
  },
  {
    category: "USER MANAGEMENT",
    items: [
      { label: "Admins", icon: UsersIcon, to: "/admin/admins", color: "text-blue-500" },
      { label: "Moderators", icon: UsersIcon, to: "/admin/moderator", color: "text-indigo-500" },
      { label: "Non-Active User", icon: UserMinusIcon, to: "/admin/non-active-users", color: "text-purple-500" },
      { label: "Active User", icon: UsersIcon, to: "/admin/users", color: "text-green-500" },
      { label: "Banned User", icon: NoSymbolIcon, to: "/admin/banned-users", color: "text-red-500" },
    ]
  },
  {
    category: "FINANCIAL MANAGEMENT",
    items: [
      { label: "Withdrawal", icon: CurrencyDollarIcon, to: "/admin/withdrawals", color: "text-indigo-600" },
      { label: "External Withdraw", icon: ArrowsRightLeftIcon, to: "/admin/external-withdrawals", color: "text-purple-600" },
      { label: "TopUp / Transaction", icon: ArrowsRightLeftIcon, to: "/admin/topup", color: "text-blue-500" },
      { label: "Earning Overview", icon: ChartBarIcon, to: "#", color: "text-emerald-500" },
      { label: "Payment Gateway", icon: CreditCardIcon, to: "/admin/payment-gateway", color: "text-cyan-500" },
    ]
  },
  {
    category: "WORK MANAGEMENT",
    items: [
      { label: "Works", icon: BriefcaseIcon, to: "/admin/works", color: "text-amber-500" },
      { label: "Social Works", icon: ClipboardDocumentCheckIcon, to: "/admin/social-works", color: "text-teal-500" },
      
      
    ]
  },
  {
    category: "SUPPORT & COMMUNICATION",
    items: [
      { label: "Support Ticket", icon: TicketIcon, to: "#", color: "text-red-400" },
      { label: "Message", icon: ChatBubbleLeftRightIcon, to: "/admin/message", color: "text-blue-500" },
    ]
  },
  {
    category: "ACCOUNT",
    items: [
      { label: "Settings", icon: UserCircleIcon, to: "/admin/settings", color: "text-purple-600" },
    ]
  }
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  const handleLogout = () => {
    Cookie.remove("token-you");
    localStorage.clear();
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-[#f8f9fa] border-r border-gray-200 z-50 w-[260px] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Mobile Header (Hidden on Desktop since Topbar handles it) */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200 bg-white">
          <span className="font-bold text-lg text-[#0a1157]">CNP Admin</span>
          <IconButton variant="text" onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </IconButton>
        </div>

        {/* Profile Summary (Like the image) */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-200 bg-white shadow-sm mt-0">
          <img
            src={user?.avatar || "/avater.avif"}
            alt="Profile"
            className="w-12 h-12 rounded-full border border-gray-200 shadow-sm"
          />
          <div>
            <h3 className="text-sm font-bold text-gray-800">{user?.name || "Admin"}</h3>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 bg-white">
          {sidebarData.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {section.category}
              </h4>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${isActive
                        ? "bg-[#f4f0ff] text-[#4d28e2]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-[#4d28e2]" : item.color}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <div className="pt-2 pb-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
