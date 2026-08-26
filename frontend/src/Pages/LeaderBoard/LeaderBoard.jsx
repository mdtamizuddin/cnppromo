import { DatePicker, Spin, Table } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
const LeaderBoard = () => {
  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (text, record, index) => record?.position,
    },
    {
      title: "Name",
      dataIndex: "user",
      key: "user",
      render: (text, record) => {
        return record?.user?.name;
      },
    },
    {
      title: "Earning",
      dataIndex: "earning",
      key: "earning",
      render: (text, record) => {
        return `${record?.gen1 * 30} Taka`;
      },
    },
    {
      title: "Refer",
      dataIndex: "gen1",
      key: "gen1",
    },
  ];
  const [date, setDate] = React.useState(new Date());
  const { user } = useSelector((state) => state.user);
  const onChange = (date, dateString) => {
    setDate(dateString);
  };
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", date],
    queryFn: async () => {
      const res = await api.patch("/refer/board", {
        date: date,
      });
      return res.data;
    },
  });

  if (isLoading) {
    return <Spin size="large" fullscreen />;
  }

  if (user.role !== "admin") {
    return null;
  }
  return (
    <div className="home2">
      <div className="min-h-screen container mx-auto py-10">
        <div className="mb-2">
          <DatePicker
            value={dayjs(date)}
            onChange={onChange}
            picker="month"
            size="large"
          />
        </div>
        <Table columns={columns} bordered dataSource={data} />
      </div>
    </div>
  );
};

export default LeaderBoard;
