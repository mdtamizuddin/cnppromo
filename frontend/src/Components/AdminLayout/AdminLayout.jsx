import React, { useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { IconButton } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import AdminSidebar from "./AdminSidebar";
import DefaultFetch from "../DefaultFetch";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Messaging is a full-height surface with its own header, so it runs without
  // the mobile top bar and without the page padding and max-width the rest of
  // the admin pages sit inside.
  const fullBleed = pathname.startsWith("/admin/message");

  return (
    <div className="bg-[#f3f4f9] min-h-screen text-[#333]">
      <ScrollRestoration />
      <DefaultFetch />
      <Toaster />

      {/* Mobile Sidebar Toggle (Only visible on small screens) */}
      {!fullBleed && (
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-wider text-[#0a1157]">CNP PROMO</h1>
          <IconButton variant="text" onClick={toggleSidebar}>
            <Bars3Icon className="h-6 w-6 stroke-2" />
          </IconButton>
        </div>
      )}

      <div className="flex w-full min-h-screen">
        {/* Left Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        {/* lg:ml-[260px] pushes content right to accommodate the fixed sidebar */}
        <main
          className={`flex-1 lg:ml-[260px] w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
            fullBleed ? "" : "p-4 sm:p-6 lg:px-5"
          }`}
        >
          <div className={fullBleed ? "w-full h-full" : "w-full h-full max-w-7xl mx-auto"}>
            {/* Full-bleed pages lose the top bar, so they get the sidebar toggle
                handed to them — otherwise mobile has no way back to the menu. */}
            <Outlet context={{ toggleSidebar }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
