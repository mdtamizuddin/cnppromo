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
  { label: "Message", icon: EnvelopeIcon, to: "/user/message" },
  { label: "All Admins", icon: UsersIcon, to: "/admin" },
  { label: "All Moderators", icon: UsersIcon, to: "/admin/moderator" },
  { label: "All Users", icon: UsersIcon, to: "/admin/users" },
  { label: "Withdrawals", icon: CurrencyBangladeshiIcon, to: "/admin/withdrawals" },
  { label: "Dollar Withdrawals", icon: CurrencyBangladeshiIcon, to: "/user/external-withdraw" },
  { label: "TopUp", icon: CurrencyBangladeshiIcon, to: "/admin/topup" },
  { label: "Works", icon: CurrencyBangladeshiIcon, to: "/user/works" },
  { label: "Marketplace", icon: CurrencyBangladeshiIcon, to: "/admin/marketplace" },
  { label: "Marketplace Reports", icon: CurrencyBangladeshiIcon, to: "/admin/marketplace/reports" },
  { label: "Settings", icon: GlobeAmericasIcon, to: "/admin/settings" },
  { label: "Refer History", icon: UsersIcon, to: "/admin/refers" },
  { label: "Check User", icon: UsersIcon, to: "/admin/check" },
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
