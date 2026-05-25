import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const date = new Date();
  const { settings } = useSelector((state) => state.user);
  const path = useLocation();
  if (path.pathname === "/message") {
    return null;
  }
  return (
    <div className="bg-black text-white flex justify-center items-center py-5">
      <p className="text-sm">
        Copyright @ {date.getFullYear()} - {settings?.siteName}
      </p>
    </div>
  );
};

export default Footer;
