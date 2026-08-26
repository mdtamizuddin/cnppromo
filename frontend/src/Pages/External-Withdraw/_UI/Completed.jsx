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
    queryKey: ["completed", user?._id],
    queryFn: async () => {
      const res = await api.get(
        user?.role === "admin"
          ? `/external-withdraw`
          : `/external-withdraw/user/${user?._id}`,
        {
          params: {
            status: "completed",
          },
        }
      );
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
                <span className="capitalize text-green-600 font-semibold">
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
            <div>
              {record?.video && (
                <video width={300} src={record?.video} controls />
              )}
              {record?.image && <Image width={300} src={record?.image} />}
              {!record?.video && !record?.image && "No Document"}
            </div>
          ),
          rowExpandable: (record) => record?.video || record?.image,
        }}
        rowKey={(record) => record._id}
        dataSource={data}
      />
    </div>
  );
};

export default Pending;
