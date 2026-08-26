import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";

const links = [
  { label: "Home Page", to: "/home", desc: "Start your journey", icon: "🏠", color: "violet" },
  { label: "All Works", to: "/works", desc: "Earn money with us", icon: "💼", color: "emerald" },
  { label: "Refer", to: "/refer", desc: "Earn by referring", icon: "🤝", color: "fuchsia", sub: true },
  { label: "Withdraw", to: "/account/withdraw", desc: "Withdraw your balance", icon: "💳", color: "amber" },
  { label: "Watch To Earn", to: "/social-works", desc: "Watch videos & earn", icon: "▶️", color: "sky" },
  { label: "Training", to: "/training", desc: "Get training", icon: "📚", color: "teal" },
  { label: "Work Tips", to: "/tips", desc: "Tips from our team", icon: "💡", color: "rose" },
  { label: "Level", to: "/level", desc: "Check your level", icon: "🏆", color: "indigo" },
  { label: "Message", to: "/message", desc: "Contact admin", icon: "💬", color: "purple" },
];

const accentMap = {
  violet: "border-violet-500 text-violet-600",
  emerald: "border-emerald-500 text-emerald-600",
  fuchsia: "border-fuchsia-500 text-fuchsia-600",
  amber: "border-amber-500 text-amber-600",
  sky: "border-sky-500 text-sky-600",
  teal: "border-teal-500 text-teal-600",
  rose: "border-rose-500 text-rose-600",
  indigo: "border-indigo-500 text-indigo-600",
  purple: "border-purple-500 text-purple-600",
  red: "border-red-500 text-red-600",
};

const Welcome = () => {
  const { user } = useSelector((state) => state.user);
  const firstLink = links.slice(0, 2);
  const restLinks = user?.role === "admin"
    ? [...links.slice(2), { label: "Leader Board", to: "/leaderboard", desc: "Referral Leader Board", icon: "📊", color: "red" }]
    : links.slice(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 lg:p-12 text-white mb-8 shadow-2xl shadow-indigo-900/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                  {user?.name}
                </span>
              </h1>
              <p className="mt-2 text-indigo-200 text-sm lg:text-base max-w-md">
                Ready to earn today? Pick up where you left off.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all"
              >
                🚀 Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-amber-500 to-rose-500 rounded-full inline-block" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {firstLink.map((item) => (
            <Link key={item.to} to={item.to}>
              <div
                className={`group relative overflow-hidden rounded-2xl bg-white border-l-4 ${accentMap[item.color]} p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <span className="text-3xl block mb-3">{item.icon}</span>
                <h3 className="font-semibold text-sm lg:text-base text-gray-800">{item.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </Link>
          ))}
          {restLinks.map((item) =>
            item.sub ? (
              <Menu key={item.label}>
                <MenuHandler>
                  <div
                    className={`group relative overflow-hidden rounded-2xl bg-white border-l-4 ${accentMap[item.color]} p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                  >
                    <span className="text-3xl block mb-3">{item.icon}</span>
                    <h3 className="font-semibold text-sm lg:text-base text-gray-800">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </MenuHandler>
                <MenuList className="bg-white border border-gray-200 shadow-xl rounded-xl p-2 min-w-[180px]">
                  <MenuItem className="rounded-lg hover:bg-gray-50">
                    <Link to="/refer" className="block px-2 py-1 text-sm text-gray-700">Referral Link</Link>
                  </MenuItem>
                  <MenuItem className="rounded-lg hover:bg-gray-50">
                    <Link to="/refer-info" className="block px-2 py-1 text-sm text-gray-700">Refer Info</Link>
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Link key={item.to} to={item.to}>
                <div
                  className={`group relative overflow-hidden rounded-2xl bg-white border-l-4 ${accentMap[item.color]} p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <span className="text-3xl block mb-3">{item.icon}</span>
                  <h3 className="font-semibold text-sm lg:text-base text-gray-800">{item.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              </Link>
            )
          )}
        </div>

        {/* ── Footer ── */}
        <p className="mt-10 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} CNP Promo Virtual Money Maker's. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
