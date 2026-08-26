import {
  Menu, MenuHandler, MenuList, MenuItem, Button, Typography, Avatar,
} from "@material-tailwind/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, PowerIcon } from "@heroicons/react/24/solid";
import {
  CurrencyBangladeshiIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Cookie from "js-cookie";

const items = [
  { label: "Account", icon: CurrencyBangladeshiIcon, to: "/account" },
  { label: "Message", icon: EnvelopeIcon, to: "/message" },
  { label: "Profile", icon: UserCircleIcon, to: "/profile" },
  { label: "Work History", icon: UserCircleIcon, to: "/work-history" },
];

const ProfileMenu = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Avatar
            variant="circular"
            size="sm"
            alt="avatar"
            className="border border-gray-900 p-0.5"
            src="/avater.avif"
          />
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <MenuItem key={item.to} onClick={closeMenu} className="flex items-center gap-2 rounded">
              <Icon className="h-4 w-4" strokeWidth={2} />
              <Link to={item.to}>
                <Typography as="span" variant="small" className="font-normal">
                  {item.label}
                </Typography>
              </Link>
            </MenuItem>
          );
        })}
        <MenuItem
          onClick={() => {
            Cookie.remove("token-you");
            window.location.href = "/";
            localStorage.clear();
          }}
          className="flex items-center gap-2 rounded"
        >
          <PowerIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
          <Typography as="span" variant="small" className="font-normal text-red-500">
            Sign Out
          </Typography>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenu;
