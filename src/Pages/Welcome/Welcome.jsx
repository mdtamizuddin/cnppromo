import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Card } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Typewriter } from 'react-simple-typewriter'
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { Menu } from "@material-tailwind/react";

const Welcome = () => {
  const { user } = useSelector((state) => state.user);
  return (
    <div className="min-h-[85vh] py-10 container mx-auto px-4">
      <h1 className="text-2xl font-semibold text-center text-primary">
        Welcome {user?.name} 
       
      </h1>
      <div className="mt-10 grid lg:grid-cols-3 grid-cols-2 gap-6">
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/home" className="flex flex-col items-center">
            <h2 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Home Page
            </h2>
            <p className="text-sm  font-normal mt-2 text-center">
              Start your journey with us
            </p>
          </Link>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/works" className="flex flex-col items-center">
            <h2 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              All Works
            </h2>
            <p className="text-sm  font-normal mt-2 text-center">
              Earn money with us
            </p>
          </Link>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Menu>
            <MenuHandler>
              <div to="/refer" className="flex flex-col items-center">
                <h2 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
                  Refer
                </h2>
                <p className="text-sm  font-normal mt-2 text-center">
                  Earn money by refer
                </p>
              </div>
            </MenuHandler>
            <MenuList>
              <MenuItem>
                <Link
                  to="/refer"
                  className="flex items-center   text-black transition-colors"
                >
                  Referral Link
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to="/refer-info"
                  className="flex items-center text-black transition-colors"
                >
                  Refer Info
                </Link>
              </MenuItem>
            </MenuList>
          </Menu>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/account/withdraw" className="flex flex-col items-center">
            <h2 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Withdraw
            </h2>
            <p className="text-sm  font-normal mt-2 text-center">
              Withdraw your balance
            </p>
          </Link>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/social-works" className="flex flex-col items-center">
            <h2 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Watch To Earn
            </h2>
            <p className="text-sm  font-normal mt-2 text-center">
              Watch youtube video and get money
            </p>
          </Link>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/training" className="flex flex-col items-center">
            <h1 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Training
            </h1>
            <p className="text-sm  font-normal mt-2 text-center">
              Get training form our team
            </p>
          </Link>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/tips" className="flex flex-col items-center">
            <h1 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Work Tips
            </h1>
            <p className="text-sm  font-normal mt-2 text-center">
              Get tips from us
            </p>
          </Link>
        </Card>
        {user?.role === "admin" && (
          <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
            <Link to="/leaderboard" className="flex flex-col items-center">
              <h1 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
                Leader Board
              </h1>
              <p className="text-sm  font-normal mt-2 text-center">
                Referal Leader Board
              </p>
            </Link>
          </Card>
        )}
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/level" className="flex flex-col items-center">
            <h1 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Level
            </h1>
            <p className="text-sm  font-normal mt-2 text-center">
              Check Your Level Info
            </p>
          </Link>
        </Card>
        <Card className="border-none shadow-md shadow-blue-50 flex justify-center items-center hover:shadow-sm bg-gradient-to-tl from-primary to-secondary text-white">
          <Link to="/message" className="flex flex-col items-center">
            <h1 className="lg:text-2xl text-lg font-semibold flex items-center gap-2">
              Message
            </h1>
            <p className="text-sm  font-normal mt-2 text-center">
              Contact With Admin
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
