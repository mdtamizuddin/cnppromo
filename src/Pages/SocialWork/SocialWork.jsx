import { Button, Table } from "antd";
import React from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { Spin } from "antd";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const SocialWork = () => {
  const { user } = useSelector((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ["social-works"],
    queryFn: async () => {
      const res = await api.get("social-works/all");
      return res.data;
    },
  });
  if (isLoading) {
    return <Spin />;
  }
  return (
    <div className="min-h-screen container mx-auto py-10 px-4">
      <h2 className="text-2xl mb-10 font-semibold text-center">
        Watch To Earn (Youtube Videos)
      </h2>
      {user?.role === "admin" && (
        <Link to="/add-work">
          <Button type="primary">Add Work</Button>
        </Link>
      )}
      <div className="mt-5 flex flex-col gap-y-3">
        {data.length === 0 ? (
          <h2 className="text-xl font-semibold text-center text-primary">
            No Works 
          </h2>
        ) : (
          data.map((work) => <WorkCard key={work._id} work={work} />)
        )}
      </div>
    </div>
  );
};

export default SocialWork;

const WorkCard = ({ work }) => {
  const { user } = useSelector((state) => state.user);
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold">{work.title}</h3>
      <p className="text-gray-600 font-light text-xs mt-1">
        {work.description}
      </p>
      <h4 className="text-red-500 text-sm mt-2">
        Video Duration:{" "}
        {work.duration >= 60
          ? `${Math.floor(work.duration / 60)} min ${work.duration % 60} sec`
          : `${work.duration} sec`}{" "}
        ৳
      </h4>
      <h4 className="text-red-500 text-sm mt-2">Earning: {work.price} ৳</h4>
      <h4 className="text-sm mt-2">
        Status:{" "}
        {work.status === "active" ? (
          <span className="text-green-500">Active</span>
        ) : (
          <span className="text-red-500">Inactive</span>
        )}
      </h4>
      <h4 className="text-primary text-sm mt-2">
        Pending Submits: {work.count}
      </h4>
      {user?.role === "admin" ? (
        <div className="flex gap-x-2 mt-2">
          <Link to={`/update-works/${work._id}`}>
            <Button type="default">Update Work</Button>
          </Link>
        </div>
      ) : (
        <Link to={`/social-works/${work._id}`}>
          <Button type="primary" className="mt-2">
            Earn Now
          </Button>
        </Link>
      )}
    </div>
  );
};
