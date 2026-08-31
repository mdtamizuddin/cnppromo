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
import Cookie from "js-cookie";
import { useUnreadNotifications } from "../../util/useUnreadNotifications";
import { Typewriter } from "react-simple-typewriter";

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
const Topbar = ({
  hideHeader = false,
  drawerOpen: propDrawerOpen,
  setDrawerOpen: propSetDrawerOpen,
}) => {
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, settings } = useSelector((state) => state.user);
  const { pathname } = useLocation();
  const unreadCount = useUnreadNotifications();

  const drawerOpen = propDrawerOpen !== undefined ? propDrawerOpen : localDrawerOpen;
  const setDrawerOpen = propSetDrawerOpen || setLocalDrawerOpen;

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

  const isInactiveUser =
    user &&
    user.role !== "admin" &&
    user.role !== "moderator" &&
    user.status !== "active" &&
    !user.active;

  // ----------------------------------------------------
  // LOGGED-IN ACTIVE USER: KEEP DESKTOP SIDEBAR & MOBILE BOTTOM BAR
  // ----------------------------------------------------
  if (user && !isInactiveUser) {
    return (
      <>
        {/* User Sidebar: Permanent on Desktop, Drawer on Mobile */}
        <UserSidebarDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        {/* Floating Bottom Navigation Bar for Mobile */}
        <UserBottomBar onOpenMenu={() => setDrawerOpen(true)} />
      </>
    );
  }

  // ----------------------------------------------------
  // PUBLIC / GUEST USER NAVBAR
  // ----------------------------------------------------
  return (
    <>
      <div className="bg-[#0b0c2a] text-white py-2.5 px-6">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[13px] md:text-sm">
            <span className="text-lg">📢</span>
            <span className="font-light tracking-wide text-gray-200">
              <Typewriter
                words={[settings?.notice || "2026 CNP Promo - অনলাইনে ইনকাম করুন, স্বপ্ন পূরণ করুন! 🚀"]}
                loop={true}
                cursor
                cursorStyle="|"
                typeSpeed={45}
                deleteSpeed={30}
                delaySpeed={5000}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center gap-3" to="/">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[6px] border-primary border-r-transparent rotate-45"></div>
              <div className="w-3.5 h-3.5 bg-primary rounded-full mr-1 mt-1"></div>
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
                className={`transition-colors text-[15px] font-semibold tracking-wide ${pathname === item.to
                  ? "text-primary font-bold"
                  : "text-[#0b0c2a] hover:text-primary"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-4">
              {user ? (
                <Button
                  size="sm"
                  onClick={() => {
                    Cookie.remove("token-you");
                    Cookie.remove("accessToken");
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white normal-case font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
                >
                  লগআউট ({user.username || user.name})
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="outlined"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary-light normal-case font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      লগইন করুন
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary-hover text-white normal-case font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-teal-500/20"
                    >
                      রেজিস্টার করুন
                    </Button>
                  </Link>
                </>
              )}
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
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto shadow-2xl ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"
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
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${pathname === item.to
                ? "bg-primary-light text-primary"
                : "text-[#0b0c2a] hover:bg-gray-50"
                }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <Button
                onClick={() => {
                  Cookie.remove("token-you");
                  Cookie.remove("accessToken");
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white normal-case text-xs"
              >
                লগআউট ({user.username || user.name})
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button
                    variant="outlined"
                    className="w-full border-primary text-primary hover:bg-primary-light normal-case text-xs"
                  >
                    লগইন করুন
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary-hover text-white normal-case text-xs shadow-md shadow-teal-500/20">
                    রেজিস্টার করুন
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;
