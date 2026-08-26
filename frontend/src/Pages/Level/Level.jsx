import React from "react";
import { useSelector } from "react-redux";
import Badge from "../Profile/Badge";
import LevelInfo from "../Profile/_Ui/LevelInfo";

const Level = () => {
  const { user, statistic } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen container mx-auto flex items-center flex-col py-10">
      <div className="lg:w-[300px] w-full flex flex-col items-center">
        <Badge number={user?.level} />
        <h2 className="mt-5 baskervville font-semibold text-lg">Your Level: {user?.level}</h2>
        <h2 className="mt-1 font-semibold">Total Refer: {statistic?.gen1}</h2>
        <h3 className="text-sm">Name: {user?.name}</h3>
        <h3 className="text-sm mt-1">Email: {user?.email}</h3>
        <div>
          <h3 className="text-sm mt-1">
            User Id: {user?.username}
            <button
              className="bg-gray-200 rounded px-2 text-xs py-1 ml-2"
              onClick={() => {
                navigator.clipboard.writeText(user?.username);
                toast.success("Copied");
              }}
            >
              Copy
            </button>
          </h3>
        </div>
      </div>
      <LevelInfo />
    </div>
  );
};

export default Level;
