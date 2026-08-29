import React, { useState, useEffect } from "react";
import { IconButton, Button } from "@material-tailwind/react";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileMenu from "./ProfileMenu";
import AdminDropdown from "./AdminDropdown";
import UserSidebarDrawer from "./UserSidebarDrawer";
import UserBottomBar from "./UserBottomBar";

const publicNavItems = [
  { label: "হোম", to: "/" },
  { label: "আমাদের সম্পর্কে", to: "/about" },
  { label: "কিভাবে কাজ করে", to: "/how-it-works" },
  { label: "ফিচারসমূহ", to: "/features" },
  { label: "পেমেন্ট প্রুফ", to: "/payment-proof" },
  { label: "রিভিউ", to: "/reviews" },
];

// `hideHeader` keeps the sidebar and bottom nav mounted while dropping the app
// header — used by full-height surfaces like messaging that supply their own.
const Topbar = ({ hideHeader = false }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, settings } = useSelector((state) => state.user);
  const { pathname } = useLocation();

  const handleWindowResize = () => {
    if (window.innerWidth >= 1024) setMobileNavOpen(false);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setMobileNavOpen(false);
  }, [pathname]);

  // ----------------------------------------------------
  // LOGGED-IN USER: APP-SHELL HEADER (WITH DESKTOP SIDEBAR)
  // ----------------------------------------------------
  if (user) {
    return (
      <>
        {/* User Sidebar: Permanent on Desktop, Drawer on Mobile */}
        <UserSidebarDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        {/* Top App Header (with lg:pl-72 for desktop sidebar alignment) */}
        {!hideHeader && (
        <header className="sticky top-0 z-30 bg-[#0b0c2a] text-white px-4 sm:px-6 py-3 border-b border-indigo-950/40 shadow-lg lg:pl-72 transition-all">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Mobile Hamburger & Welcome Greeting */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center text-white shrink-0 border border-white/10 shadow-sm lg:hidden"
                title="মেনু খুলুন"
              >
                <Bars3Icon className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div className="leading-tight">
                <p className="text-[11px] text-indigo-200/80 font-medium">
                  Welcome back,
                </p>
                <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1">
                  <span>{user?.name || "Member"}</span>
                  <span>👋</span>
                </h2>
                <p className="text-[10px] text-gray-400 hidden sm:block">
                  Let's complete tasks and earn more!
                </p>
              </div>
            </div>

            {/* Right: Admin Controls (if admin), Notifications & Profile Menu */}
            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <div className="hidden sm:block">
                  <AdminDropdown />
                </div>
              )}

              <Link
                to="/user/notifications"
                className="relative w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 transition-all flex items-center justify-center text-white border border-white/10 shadow-sm"
                title="নোটিফিকেশন"
              >
                <BellIcon className="w-5 h-5 text-gray-200" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0b0c2a] animate-pulse">
                  3
                </span>
              </Link>

              <ProfileMenu user={user} />
            </div>

          </div>
        </header>
        )}

        {/* Floating Bottom Navigation Bar for Mobile */}
        <UserBottomBar />
      </>
    );
  }

  // ----------------------------------------------------
  // PUBLIC / GUEST USER NAVBAR
  // ----------------------------------------------------
  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center gap-3" to="/">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[6px] border-[#5a32fa] border-r-transparent rotate-45"></div>
              <div className="w-3.5 h-3.5 bg-[#5a32fa] rounded-full mr-1 mt-1"></div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-[#0b0c2a] text-xl font-bold tracking-wide">
                {settings?.siteName || "CNP-PROMO"}
              </h2>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">
                Virtual Money Makers
              </p>
            </div>
          </Link>

          {/* Public Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {publicNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`transition-colors text-[15px] font-semibold tracking-wide ${
                  pathname === item.to
                    ? "text-[#5a32fa] font-bold"
                    : "text-[#0b0c2a] hover:text-[#5a32fa]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-4">
              <Link to="/login">
                <Button
                  variant="outlined"
                  size="sm"
                  className="border-[#5a32fa] text-[#5a32fa] normal-case font-bold text-xs px-4 py-2 rounded-xl"
                >
                  লগইন করুন
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="bg-[#5a32fa] hover:bg-[#4b26e0] text-white normal-case font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20"
                >
                  রেজিস্টার করুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <IconButton
            variant="text"
            className="ml-auto h-8 w-8 text-[#0b0c2a] hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 lg:hidden rounded-full"
            ripple={false}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            {mobileNavOpen ? (
              <XMarkIcon className="h-7 w-7" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-7 w-7" strokeWidth={2} />
            )}
          </IconButton>
        </div>
      </div>

      {/* Guest Mobile Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0b0c2a]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto shadow-2xl ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <span className="text-[#0b0c2a] font-bold text-lg">
            {settings?.siteLogo || "CNP-PROMO"}
          </span>
          <IconButton
            variant="text"
            className="text-gray-500 hover:bg-gray-100 rounded-full w-8 h-8"
            onClick={() => setMobileNavOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          </IconButton>
        </div>

        <div className="py-4 space-y-1 px-3">
          {publicNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                pathname === item.to
                  ? "bg-indigo-50 text-[#5a32fa]"
                  : "text-[#0b0c2a] hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileNavOpen(false)}>
              <Button
                variant="outlined"
                className="w-full border-[#5a32fa] text-[#5a32fa] normal-case text-xs"
              >
                লগইন করুন
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileNavOpen(false)}>
              <Button className="w-full bg-[#5a32fa] text-white normal-case text-xs">
                রেজিস্টার করুন
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;
