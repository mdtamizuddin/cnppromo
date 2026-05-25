import { Button, Spin } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { api } from "../../../util/axios";

import { Table } from "antd";
import moment from "moment";
import { Image } from "antd";
import Update from "./Update";
import { Popover } from "antd";
import { Input } from "antd";
import toast from "react-hot-toast";
const Pending = () => {
  const { user } = useSelector((state) => state.user);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["pending", user],
    queryFn: async () => {
      const res = await api.get(
        user?.role === "admin"
          ? `/external-withdraw`
          : `/external-withdraw/user/${user?._id}`,
        {
          params: {
            status: "pending",
          },
        }
      );
      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60000,
  });
  const [update, setUpdate] = React.useState(false);
  const [id, setId] = React.useState(null);
  const [reson, setReson] = React.useState("");

  const handleReject = (id) => {
    try {
      const res = api.put(`/external-withdraw/${id}`, {
        status: "rejected",
        reason: reson,
      });
      toast.success("Rejection Successful");
      refetch();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };
  const handleComplete = (id) => {
    try {
      const res = api.put(`/external-withdraw/${id}`, {
        status: "completed",
      });
      toast.success("Request Completed");
      refetch();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };
  const setShow = () => {
    setUpdate(false);
    setId(null);
  };
  return (
    <div>
      {update && (
        <Update show={update} setShow={setShow} data={id} refetch={refetch} />
      )}
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
                <span className="capitalize text-yellow-600 font-semibold">
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
          {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (text, record) => {
              return (
                <div className="flex gap-2">
                  {user?.role !== "admin" ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        setId(record);
                        setUpdate(true);
                      }}
                    >
                      Update
                    </Button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          handleComplete(record._id);
                        }}
                      >
                        Mark as Completed
                      </Button>
                      <Popover
                        trigger={["click"]}
                        title="Hhy?"
                        content={
                          <div>
                            <p>Are you sure you want to reject this request?</p>
                            <Input.TextArea
                              value={reson}
                              onChange={(e) => setReson(e.target.value)}
                              className="mt-2"
                              placeholder="Write Reason Here"
                            />
                            <Button
                              onClick={() => handleReject(record._id)}
                              type="primary"
                              size="small"
                              danger
                              className="mt-2"
                            >
                              Reject
                            </Button>
                          </div>
                        }
                        onConfirm={() => {}}
                      >
                        <Button
                          size="small"
                          type="primary"
                          danger
                          // onClick={() => {
                          //   setId(record);
                          //   setUpdate(true);
                          // }}
                        >
                          Reject
                        </Button>
                      </Popover>
                    </div>
                  )}
                </div>
              );
            },
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
