import { Menu, MenuHandler, MenuList, MenuItem, Button, Typography } from "@material-tailwind/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  UsersIcon,
  CurrencyBangladeshiIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";

const items = [
  { label: "Message", icon: EnvelopeIcon, to: "/message" },
  { label: "All Admins", icon: UsersIcon, to: "/admin" },
  { label: "All Moderators", icon: UsersIcon, to: "/moderator" },
  { label: "All Users", icon: UsersIcon, to: "/users" },
  { label: "Withdrawals", icon: CurrencyBangladeshiIcon, to: "/withdrawals" },
  { label: "Dollar Withdrawals", icon: CurrencyBangladeshiIcon, to: "/external-withdraw" },
  { label: "TopUp", icon: CurrencyBangladeshiIcon, to: "/topup" },
  { label: "Works", icon: CurrencyBangladeshiIcon, to: "/works" },
  { label: "Works History", icon: CurrencyBangladeshiIcon, to: "/work-history" },
  { label: "Settings", icon: GlobeAmericasIcon, to: "/settings" },
  { label: "Refer History", icon: UsersIcon, to: "/refers" },
  { label: "Check User", icon: UsersIcon, to: "/check" },
];

const AdminDropdown = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto text-white"
        >
          Admin
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
      </MenuList>
    </Menu>
  );
};

export default AdminDropdown;
