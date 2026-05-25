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

const NAV_ITEMS = [
  { label: "Home", to: "/", auth: false, loggedIn: "/home" },
  { label: "Reviews", to: "/reviews", auth: false },
  { label: "Works", to: "/works", auth: true },
  { label: "Training", to: "/training", auth: true },
  { label: "Referral", to: null, auth: true, sub: [
    { label: "Referral Link", to: "/refer" },
    { label: "Refer Info", to: "/refer-info" },
  ]},
  { label: "Withdraw", to: "/account/withdraw", auth: true },
  { label: "Level", to: "/level", auth: false },
];

const NavList = ({ user, onLinkClick }) => {
  const { pathname } = useLocation();

  const isActive = (to) => to && pathname === to;

  return (
    <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-1 gap-1">
      {NAV_ITEMS.map((item) => {
        if (item.auth && !user) return null;
        const resolvedTo = item.loggedIn && user ? item.loggedIn : item.to;

        if (item.sub) {
          return (
            <li key={item.label} className="lg:hidden">
              <Typography as="div" variant="small" color="blue-gray" className="font-medium">
                <div className="px-4 py-2 text-white font-semibold text-sm">{item.label}</div>
              </Typography>
              <div className="ml-4 flex flex-col border-l border-white/20">
                {item.sub.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    onClick={onLinkClick}
                    className={`block px-4 py-2 text-sm text-white/80 hover:text-white transition-colors ${isActive(sub.to) ? "text-white font-bold bg-white/10" : ""}`}
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
            <Typography as="div" variant="small" color="blue-gray" className="font-medium">
              <Link
                to={resolvedTo}
                onClick={onLinkClick}
                className={`flex items-center px-4 py-2 text-white transition-colors rounded-lg ${
                  isActive(resolvedTo) ? "bg-white/20 font-bold" : "hover:bg-white/10"
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
          <Typography as="div" variant="small" color="blue-gray" className="font-medium">
            <div className="px-4 py-2 text-white font-semibold text-sm">Admin</div>
          </Typography>
          <div className="ml-4 flex flex-col border-l border-white/20">
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
                className={`block px-4 py-2 text-sm text-white/80 hover:text-white transition-colors ${pathname === sub.to ? "text-white font-bold bg-white/10" : ""}`}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </li>
      )}
      {user?.role === "moderator" && (
        <li>
          <Typography as="div" variant="small" color="blue-gray" className="font-medium">
            <Link
              to="/users"
              onClick={onLinkClick}
              className={`flex items-center px-4 py-2 text-white transition-colors rounded-lg ${
                pathname === "/users" ? "bg-white/20 font-bold" : "hover:bg-white/10"
              }`}
            >
              Manage Users
            </Link>
          </Typography>
        </li>
      )}
      {user ? (
        <li className="lg:hidden border-t border-white/20 mt-2 pt-2">
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
                className={`block px-4 py-2 text-sm text-white/80 hover:text-white transition-colors ${pathname === sub.to ? "text-white font-bold bg-white/10" : ""}`}
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
              className="block px-4 py-2 text-sm text-red-300 hover:text-red-200 text-left"
            >
              Sign Out
            </button>
          </div>
        </li>
      ) : (
        <li className="lg:hidden flex gap-2 px-4 pt-2">
          <Link to="/register" onClick={onLinkClick}>
            <Button className="bg-secondary rounded-3xl text-sm">Register</Button>
          </Link>
          <Link to="/login" onClick={onLinkClick}>
            <Button className="bg-white text-black rounded-3xl text-sm">Login</Button>
          </Link>
        </li>
      )}
    </ul>
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

  // Close drawer on route change
  React.useEffect(() => {
    setOpenNav(false);
  }, [pathname]);

  return (
    <>
      <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white text-xs py-2 px-4 shadow-lg shadow-indigo-900/20">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold shrink-0">
            <FontAwesomeIcon icon={faBullhorn} className="text-[10px]" />
            <span className="hidden sm:inline">Notice</span>
          </span>
          <span className="text-amber-300/40 hidden sm:block">|</span>
          <span className="font-medium text-white/90">
            <Typewriter
              words={[settings?.notice || `Welcome to ${settings?.siteName || "CNP-PROMO"}`]}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={45}
              deleteSpeed={30}
              delaySpeed={5000}
            />
          </span>
          <span className="text-amber-400 text-[10px] animate-pulse hidden sm:block">✦</span>
        </div>
      </div>
      <div className="sticky top-[28px] z-40 px-6 py-3 shadow-none bg-primary border-none">
        <div className="flex mx-auto container items-center justify-between text-black">
          <Link
            className="mr-4 cursor-pointer py-1.5 text-white font-semibold lg:text-xl text-base"
            to={user ? "/welcome" : "/"}
          >
            {settings?.siteLogo || "CNP-PROMO"}
          </Link>
          <div className="hidden lg:block">
            <DesktopNav user={user} pathname={pathname} />
          </div>
          <IconButton
            variant="text"
            className="ml-auto h-8 w-8 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden text-white"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-8 w-8" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-8 w-8" strokeWidth={2} />
            )}
          </IconButton>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {openNav && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-primary transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          openNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
          <span className="text-white font-semibold text-lg">
            {settings?.siteLogo || "CNP-PROMO"}
          </span>
          <IconButton
            variant="text"
            className="text-white hover:bg-transparent focus:bg-transparent active:bg-transparent"
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

const DesktopNav = ({ user, pathname }) => {
  const isActive = (to) => to && pathname === to;

  return (
    <div className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        if (item.auth && !user) return null;
        const resolvedTo = item.loggedIn && user ? item.loggedIn : item.to;

        if (item.sub) {
          return (
            <div key={item.label} className="relative group">
              <button className="flex items-center px-3 py-2 text-white transition-colors rounded-lg text-sm font-medium hover:bg-white/10">
                {item.label}
              </button>
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {item.sub.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg ${isActive(sub.to) ? "font-bold text-primary" : ""}`}
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
            to={resolvedTo}
            className={`flex items-center px-3 py-2 text-white transition-colors rounded-lg text-sm font-medium ${
              isActive(resolvedTo) ? "bg-white/20 font-bold" : "hover:bg-white/10"
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
          className={`flex items-center px-3 py-2 text-white transition-colors rounded-lg text-sm font-medium min-w-[130px] ${
            isActive("/users") ? "bg-white/20 font-bold" : "hover:bg-white/10"
          }`}
        >
          Manage Users
        </Link>
      )}
      {user ? (
        <ProfileMenu user={user} />
      ) : (
        <div className="flex gap-2 ml-2">
          <Link to="/register">
            <Button className="bg-secondary rounded-3xl text-sm">Register</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-white text-black rounded-3xl text-sm">Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Topbar;
