import { Spin } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { api } from "../../../util/axios";

import { Table } from "antd";
import moment from "moment";
const Pending = () => {
  const { user } = useSelector((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ["rejected", user?._id],
    queryFn: async () => {
      const res = await api.get(user?.role === "admin"
        ? `/external-withdraw`
        : `/external-withdraw/user/${user?._id}`, {
        params: {
            status: "rejected",
        },
      });
      return res.data;
    },
  });

  return (
    <div>
      <Table
        loading={isLoading}
        columns={[
          {
            title: "Time",
            dataIndex: "time",
            key: "time",
            render: (text, record) => {
              return moment(record.createdAt).format("lll");
            },
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (text, record) => {
              return (
                <span className="capitalize text-red-600 font-semibold">
                  {record?.status}
                </span>
              );
            },
          },
          {
            title: "Method",
            dataIndex: "method",
            key: "method",
          },
          {
            title: "Account",
            dataIndex: "account",
            key: "account",
          },
        ]}
        expandable={{
          expandedRowRender: (record) => (
            <div className="text-sm text-red-500">{record?.reason || "No Reason Given. Contact Admin"}</div>
          ),
          rowExpandable: (record) => true,
        }}
        rowKey={(record) => record._id}
        dataSource={data}
      />
    </div>
  );
};

export default Pending;
