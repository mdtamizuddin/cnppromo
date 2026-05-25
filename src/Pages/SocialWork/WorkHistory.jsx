import { Button, Spin, Table } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { api } from "../../util/axios";
import moment from "moment";
import { Select } from "antd";
import UserProfile from "../Message/UserProfile";
import { Modal } from "antd";
import { Popconfirm } from "antd";
import { Popover } from "antd";

const WorkHistory = () => {
  const { user } = useSelector((state) => state.user);
  const [status, setStatus] = React.useState("pending");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["social-works", status],
    queryFn: async () => {
      const res = await api.get(
        user?.role === "admin"
          ? `social-works/all-submits?status=${status}`
          : `social-works/submit/${user._id}?status=${status}`
      );
      return res.data;
    },
    enabled: !!user,
  });
  if (isLoading) {
    return <Spin fullscreen />;
  }
  return (
    <div className="min-h-screen container mx-auto p-3">
      <h1 className="text-2xl text-center font-semibold py-10">Work History</h1>
      <div className="flex items-center justify-between">
        <Select
          style={{ width: 200 }}
          onChange={(val) => setStatus(val)}
          value={status}
          options={[
            {
              value: "pending",
              label: "Pending",
            },
            {
              value: "completed",
              label: "Completed",
            },
            {
              value: "rejected",
              label: "Rejected",
            },
          ]}
        />
        <h3>Total Result: {data?.length}</h3>
      </div>
      <div className="flex flex-col gap-y-2 mt-4">
        {data?.map((item) => (
          <HisToryCard key={item._id} data={item} refetch={refetch} />
        ))}
      </div>
    </div>
  );
};

export default WorkHistory;

const HisToryCard = ({ data, refetch }) => {
  const { user } = useSelector((state) => state.user);
  const durationCalculator = (duration) => {
    return duration >= 60
      ? `${Math.floor(duration / 60)} min ${duration % 60} sec`
      : `${duration} sec`;
  };
  const handleComplete = async () => {
    try {
      await api.put(`social-works/complete/${data._id}`);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };
  const handleReject = async () => {
    try {
      await api.put(`social-works/submit/${data._id}`, {
        status: "rejected",
      });
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const [showProfile, setShowProfile] = React.useState(false);
  return (
    <div className="mb-2 border p-3 rounded-lg">
      <div className="bg-blue-50 p-1 rounded-lg w-full">
        <h4 className="text-base font-semibold">{data?.workId?.title}</h4>
        <p className="text-xs mt-1">{data?.workId?.description}</p>
        <p className="text-xs mt-1">
          {" "}
          <strong>Video Duration:</strong>{" "}
          {durationCalculator(data?.workId?.duration)}
        </p>
        <Popover
          trigger={"click"}
          content={
            <div>
              <h4 className="font-semibold mb-2">Questions</h4>
              <ul className="list-decimal list-inside">
                {data?.workId?.questions?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          }
        >
          <Button type="link">View Questions</Button>
        </Popover>
      </div>

      {user?.role === "admin" && (
        <>
          <p className="text-xs mt-1" onClick={() => setShowProfile(true)}>
            {" "}
            <strong>User:</strong> {data?.userId?.name}
          </p>
          <Modal
            open={showProfile}
            onCancel={() => setShowProfile(false)}
            footer={null}
          >
            {showProfile && <UserProfile uid={data?.userId?._id} />}
          </Modal>
        </>
      )}
      <p className="text-xs mt-1">
        {" "}
        <strong>Watch Time:</strong> {durationCalculator(data?.duration)}
      </p>
      {/* Status  */}
      <h4 className="text-sm mt-2">
        Status:{" "}
        {data?.status === "pending" ? (
          <span className="text-yellow-900">Pending</span>
        ) : data?.status === "completed" ? (
          <span className="text-green-500">Completed</span>
        ) : (
          <span className="text-red-500">Rejected</span>
        )}
      </h4>

      <p className="text-sm mt-1">
        {moment(data.createdAt).format("DD-MM-YYYY h:mm A")}
      </p>
      {user?.role === "admin" && data?.status === "pending" && (
        <div className="flex mt-2 gap-x-2">
          <Button type="primary" size="small" onClick={handleComplete}>
            Complete
          </Button>
          <Popconfirm title="Are you sure to reject?" onConfirm={handleReject}>
            <Button type="primary" size="small" danger>
              Reject
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};
