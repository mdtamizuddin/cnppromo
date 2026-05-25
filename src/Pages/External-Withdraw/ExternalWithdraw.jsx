import {
  CheckCircleOutlined,
  CloseSquareOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Tabs } from "antd";
import React from "react";
import { useState } from "react";
import Create from "./_UI/Create";
import Pending from "./_UI/Pending";
import Completed from "./_UI/Completed";
import Rejected from "./_UI/Rejected";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { act } from "react";

const ExternalWithdraw = ({ page }) => {
  const [activeTab, setActiveTab] = useState("2");
  const { user } = useSelector((state) => state.user);
  const onChange = (e) => {
    setActiveTab(e);
  };
  useEffect(() => {
    if (user?.role === "admin") {
      setActiveTab("2");
    } else {
      setActiveTab("1");
    }
  }, [user]);
  return (
    <div className="min-h-screen py-10 container mx-auto px-4">
      <h1 className="text-center text-2xl font-semibold">
        {user?.role !== "admin" ? "Submit a Withdraw" : "Manage Withdraws"}
      </h1>
      <div className="flex mt-5">
        <Tabs
          className="w-full"
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={onChange}
          items={[
            {
              key: "1",
              label: "Submit a Withdraw",
              children: activeTab === "1" && <Create setStep={setActiveTab} />,
              icon: <PlusOutlined />,
              disabled: user?.role === "admin",
            },
            {
              key: "2",
              label: "Pending",
              children: activeTab === "2" && <Pending />,
              icon: <LoadingOutlined />,
            },
            {
              key: "3",
              label: "Completed",
              children: activeTab === "3" && <Completed />,
              icon: <CheckCircleOutlined />,
            },
            {
              key: "4",
              label: "Rejected",
              children: activeTab === "4" && <Rejected />,
              icon: <CloseSquareOutlined />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ExternalWithdraw;
