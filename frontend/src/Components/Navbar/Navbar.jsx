import React from "react";
import { IconButton, Button, Typography } from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import Cookie from "js-cookie";
import ProfileMenu from "./ProfileMenu";
import AdminDropdown from "./AdminDropdown";
import { Typewriter } from "react-simple-typewriter";

const getNavItems = (user) => {
  if (!user) {
    return [
      { label: "হোম", to: "/" },
      { label: "আমাদের সম্পর্কে", to: "/about" },
      { label: "কিভাবে কাজ করে", to: "/how-it-works" },
      { label: "ফিচারসমূহ", to: "/features" },
      { label: "পেমেন্ট প্রুফ", to: "/payment-proof" },
      { label: "যোগাযোগ করুন", to: "/contact" },
    ];
  } else {
    return [
      { label: "Home", to: "/home" },
      { label: "Reviews", to: "/reviews" },
      { label: "Works", to: "/works" },
      { label: "Training", to: "/training" },
      {
        label: "Referral", to: null, sub: [
          { label: "Referral Link", to: "/refer" },
          { label: "Refer Info", to: "/refer-info" },
        ]
      },
      { label: "Withdraw", to: "/account/withdraw" },
      { label: "Level", to: "/level" },
    ];
  }
};

const NavList = ({ user, onLinkClick }) => {
  const { pathname } = useLocation();
  const isActive = (to) => to && pathname === to;
  const items = getNavItems(user);

  return (
    <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-6 gap-2">
      {items.map((item) => {
        if (item.sub) {
          return (
            <li key={item.label} className="lg:hidden">
              <Typography as="div" variant="small" className="font-medium text-[#0b0c2a]">
                <div className="px-4 py-2 font-semibold text-sm">{item.label}</div>
              </Typography>
              <div className="ml-4 flex flex-col border-l border-gray-200">
                {item.sub.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    onClick={onLinkClick}
                    className={`block px-4 py-2 text-sm transition-colors ${isActive(sub.to) ? "text-[#5a32fa] font-bold bg-indigo-50/50" : "text-gray-600 hover:text-[#5a32fa]"
                      }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Typography as="div" variant="small" className="font-medium">
              <Link
                to={item.to}
                onClick={onLinkClick}
                className={`relative flex items-center px-3 py-2 transition-all text-[15px] font-medium ${
                  isActive(item.to)
                    ? "text-[#5a32fa] font-bold lg:after:content-[''] lg:after:absolute lg:after:-bottom-1 lg:after:left-2 lg:after:right-2 lg:after:h-[2.5px] lg:after:bg-[#5a32fa] lg:after:rounded-full bg-indigo-50/50 lg:bg-transparent"
                    : "text-[#0b0c2a] hover:text-[#5a32fa]"
                }`}
              >
                {item.label}
              </Link>
            </Typography>
          </li>
        );
      })}

      {user?.role === "admin" && (
        <li className="lg:hidden">
          <Typography as="div" variant="small" className="font-medium">
            <div className="px-4 py-2 text-[#0b0c2a] font-semibold text-sm">Admin</div>
          </Typography>
          <div className="ml-4 flex flex-col border-l border-gray-200">
            {[
              { label: "Dashboard", to: "/admin" },
              { label: "Users", to: "/users" },
              { label: "Withdrawals", to: "/withdrawals" },
              { label: "TopUp", to: "/topup" },
              { label: "Works", to: "/works" },
              { label: "Settings", to: "/settings" },
              { label: "Check User", to: "/check" },
            ].map((sub) => (
              <Link
                key={sub.to}
                to={sub.to}
                onClick={onLinkClick}
                className={`block px-4 py-2 text-sm transition-colors ${pathname === sub.to ? "text-[#5a32fa] font-bold bg-indigo-50/50" : "text-gray-600 hover:text-[#5a32fa]"
                  }`}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </li>
      )}

      {user?.role === "moderator" && (
        <li className="lg:hidden">
          <Typography as="div" variant="small" className="font-medium">
            <Link
              to="/users"
              onClick={onLinkClick}
              className={`flex items-center px-4 py-2 transition-colors rounded-lg text-[15px] ${pathname === "/users" ? "text-[#5a32fa] font-bold bg-indigo-50/50" : "text-[#0b0c2a] hover:text-[#5a32fa]"
                }`}
            >
              Manage Users
            </Link>
          </Typography>
        </li>
      )}

      {user ? (
        <li className="lg:hidden border-t border-gray-200 mt-2 pt-2">
          <div className="flex flex-col gap-1">
            {[
              { label: "Account", to: "/account" },
              { label: "Message", to: "/message" },
              { label: "Profile", to: "/profile" },
              { label: "Work History", to: "/work-history" },
            ].map((sub) => (
              <Link
                key={sub.to}
                to={sub.to}
                onClick={onLinkClick}
                className={`block px-4 py-2 text-sm transition-colors ${pathname === sub.to ? "text-[#5a32fa] font-bold bg-indigo-50/50" : "text-gray-600 hover:text-[#5a32fa]"
                  }`}
              >
                {sub.label}
              </Link>
            ))}
            <button
              onClick={() => {
                Cookie.remove("token-you");
                window.location.href = "/";
                localStorage.clear();
              }}
              className="block px-4 py-2 text-sm text-red-500 hover:text-red-600 text-left"
            >
              Sign Out
            </button>
          </div>
        </li>
      ) : (
        <li className="lg:hidden flex flex-col gap-3 px-4 pt-4 border-t border-gray-100">
          <Link to="/login" onClick={onLinkClick} className="w-full">
            <Button variant="outlined" className="w-full border-[#5a32fa] text-[#5a32fa] normal-case text-sm">লগইন করুন</Button>
          </Link>
          <Link to="/register" onClick={onLinkClick} className="w-full">
            <Button className="w-full bg-[#5a32fa] text-white normal-case text-sm">রেজিস্টার করুন</Button>
          </Link>
        </li>
      )}
    </ul>
  );
};

const DesktopNav = ({ user, pathname }) => {
  const isActive = (to) => to && pathname === to;
  const items = getNavItems(user);

  return (
    <div className="flex items-center gap-6">
      {items.map((item) => {
        if (item.sub) {
          return (
            <div key={item.label} className="relative group">
              <button className="flex items-center text-[#0b0c2a] hover:text-[#5a32fa] transition-colors text-[15px] font-semibold tracking-wide">
                {item.label}
              </button>
              <div className="absolute top-full left-0 mt-3 w-44 bg-white rounded-lg shadow-xl shadow-[#0b0c2a]/5 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {item.sub.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    className={`block px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${isActive(sub.to) ? "font-bold text-[#5a32fa] bg-indigo-50/50" : "text-gray-600 hover:bg-gray-50 hover:text-[#5a32fa]"
                      }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.to}
            className={`transition-colors text-[15px] font-semibold tracking-wide ${isActive(item.to) ? "text-[#5a32fa]" : "text-[#0b0c2a] hover:text-[#5a32fa]"
              }`}
          >
            {item.label}
          </Link>
        );
      })}

      {user?.role === "admin" && <AdminDropdown />}

      {user?.role === "moderator" && (
        <Link
          to="/users"
          className={`transition-colors text-[15px] font-semibold tracking-wide ${isActive("/users") ? "text-[#5a32fa]" : "text-[#0b0c2a] hover:text-[#5a32fa]"
            }`}
        >
          Manage Users
        </Link>
      )}

      {user && (
        <div className="pl-4 ml-2 border-l border-gray-200">
          <ProfileMenu user={user} />
        </div>
      )}
    </div>
  );
};

const Topbar = () => {
  const [openNav, setOpenNav] = React.useState(false);
  const { user, settings } = useSelector((state) => state.user);
  const { pathname } = useLocation();

  const handleWindowResize = () => {
    if (window.innerWidth >= 1024) setOpenNav(false);
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  React.useEffect(() => {
    setOpenNav(false);
  }, [pathname]);

  return (
    <>
      {/* Top Banner (Dark Blue) */}
      <div className="bg-[#0b0c2a] text-white py-2.5 px-6 hidden">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">
          <div className="flex items-center max-w-[1000px] gap-2.5 text-[13px] md:text-sm">
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

          {/* Auth Buttons for Guests */}
          {!user && (
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/login" className="text-[14px] font-medium text-gray-200 hover:text-white transition-colors tracking-wide">
                লগইন করুন
              </Link>
              <Link to="/register" className="bg-[#5a32fa] hover:bg-[#4b26e0] text-white px-5 py-1.5 rounded-md text-[14px] font-medium transition-colors shadow-lg shadow-indigo-500/20">
                রেজিস্টার করুন
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar (White) */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link
            className="flex items-center gap-3"
            to={user ? "/home" : "/"}
          >
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[6px] border-[#5a32fa] border-r-transparent rotate-45"></div>
              <div className="w-3.5 h-3.5 bg-[#5a32fa] rounded-full mr-1 mt-1"></div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-[#0b0c2a] text-xl font-bold tracking-wide">{settings?.siteName || "CNP-PROMO"}</h2>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">Virtual Money Makers</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <DesktopNav user={user} pathname={pathname} />
          </div>

          {/* Mobile Toggle */}
          <IconButton
            variant="text"
            className="ml-auto h-8 w-8 text-[#0b0c2a] hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 lg:hidden rounded-full"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-7 w-7" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-7 w-7" strokeWidth={2} />
            )}
          </IconButton>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {openNav && (
        <div
          className="fixed inset-0 z-40 bg-[#0b0c2a]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto shadow-2xl ${openNav ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[4px] border-[#5a32fa] border-r-transparent rotate-45"></div>
              <div className="w-2.5 h-2.5 bg-[#5a32fa] rounded-full mr-0.5 mt-0.5"></div>
            </div>
            <span className="text-[#0b0c2a] font-bold text-lg">
              {settings?.siteLogo || "CNP-PROMO"}
            </span>
          </div>
          <IconButton
            variant="text"
            className="text-gray-500 hover:bg-gray-100 rounded-full w-8 h-8"
            ripple={false}
            onClick={() => setOpenNav(false)}
          >
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          </IconButton>
        </div>
        <div className="py-4">
          <NavList user={user} onLinkClick={() => setOpenNav(false)} />
        </div>
      </div>
    </>
  );
};

export default Topbar;
