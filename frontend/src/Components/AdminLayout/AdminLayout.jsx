import React, { useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";
import DefaultFetch from "../DefaultFetch";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-[#f3f4f9] min-h-screen text-[#333]">
      <ScrollRestoration />
      <DefaultFetch />
      <Toaster />
      
      {/* Top Navigation */}
      <AdminTopbar toggleSidebar={toggleSidebar} />

      <div className="flex w-full min-h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        {/* lg:ml-[260px] pushes content right to accommodate the fixed sidebar */}
        <main className="flex-1 lg:ml-[260px] p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out">
          <div className="w-full h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
