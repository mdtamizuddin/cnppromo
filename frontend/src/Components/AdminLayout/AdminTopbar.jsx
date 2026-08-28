import React from "react";
import { IconButton } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import AdminDropdown from "../Navbar/AdminDropdown";

const AdminTopbar = ({ toggleSidebar }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-[#0a1157] text-white shadow-sm w-full lg:ml-[260px] lg:w-[calc(100%-260px)]">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <IconButton
          variant="text"
          className="text-white hover:bg-white/10 lg:hidden"
          onClick={toggleSidebar}
        >
          <Bars3Icon className="h-6 w-6 stroke-2" />
        </IconButton>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "/avater.avif"}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white/20 object-cover bg-white"
          />
          <div className="hidden sm:block text-right pr-2">
            <h3 className="text-sm font-bold leading-tight">{user?.name || "Admin"}</h3>
            <p className="text-[10px] text-gray-300">Super Admin</p>
          </div>
          <AdminDropdown />
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
