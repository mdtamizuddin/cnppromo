import React from "react";
import Form from "./Form";
import AllWorks from "./AllWorks";
import { useSelector } from "react-redux";

const Works = () => {
  const { user } = useSelector((state) => state.user);

  return (
    <div className="container mx-auto min-h-[80vh] py-10 home2 px-4">
      {user?.role === "admin" && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Manage Works</h1>
          <Form />
        </div>
      )}
      <AllWorks />
    </div>
  );
};

export default Works;