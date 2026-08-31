import React, { useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bars3Icon } from "@heroicons/react/24/outline";
import AdminSidebar from "./AdminSidebar";
import AdminBottomBar from "./AdminBottomBar";
import DefaultFetch from "../DefaultFetch";
import Loader from "../Loader";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  const { user } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const fullBleed = pathname.startsWith("/admin/message");
  const isStaff = user?.role === "admin" || user?.role === "moderator";

  if (!isStaff) {
    return (
      <div className="bg-[#f3f4f9] min-h-screen flex items-center justify-center">
        <ScrollRestoration />
        <DefaultFetch />
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-[#f3f4f9] min-h-screen text-[#333]">
      <ScrollRestoration />
      <DefaultFetch />
      <Toaster />

      <div className="flex w-full min-h-screen">
        {/* Left Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        {/* lg:ml-[260px] pushes content right to accommodate the fixed sidebar */}
        <main
          className={`flex-1 lg:ml-[260px] w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
            fullBleed ? "" : "p-4 sm:p-6 lg:px-5 pb-24 lg:pb-6"
          }`}
        >
          <div className={fullBleed ? "w-full h-full" : "w-full h-full max-w-7xl mx-auto"}>
            <Outlet context={{ toggleSidebar }} />
          </div>
        </main>
      </div>

      {/* Floating Bottom Bar for Admin Mobile Screens */}
      {!fullBleed && <AdminBottomBar toggleSidebar={toggleSidebar} />}
    </div>
  );
};

export default AdminLayout;
