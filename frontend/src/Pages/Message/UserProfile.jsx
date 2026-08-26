import React from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { Spin } from "antd";
import toast from "react-hot-toast";
import moment from "moment";

const UserProfile = ({ uid }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", uid],
    queryFn: async () => {
      const res = await api.get(`/user/${uid}`);
      return res.data;
    },
    enabled: !!uid,
  });
  if (isLoading) {
    return <Spin />;
  }
  return (
    <div>
      <ul className="userprofile">
        <Specification title="ID" value={data?._id} />
        <Specification title="Name" value={data?.name} />
        <Specification title="Username" value={data?.username} />
        <Specification title="Email" value={data?.email} />
        <Specification title="Phone" value={data?.phone} />
        <Specification title="Gender" value={data?.gender} />
        <Specification title="Balance" value={data?.balance} />
        <Specification title="Facebook" value={data?.fb} />
        <Specification title="Created At" value={data?.createdAt} />
        <Specification title="Updated At" value={data?.updatedAt} />
        <Specification title="Online" value={data?.active ? "Yes" : "No"} />  <Specification title="Active Status" value={data?.status} />
        <li>
          <h4 className="text-sm">Referer :</h4>
        </li>
        {data?.reffer && (
          <div className="px-3">
            <Specification title="Name" value={data?.reffer?.name} />
            <Specification title="Username" value={data?.reffer?.username} />
            <Specification title="Email" value={data?.reffer?.email} />
          </div>
        )}
      </ul>
    </div>
  );
};

export default UserProfile;

const Specification = ({ title, value }) => {
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  return (
    <li className="flex justify-between">
      <h4 className="text-sm">{title} :</h4>
      <p className="text-sm" onClick={() => copy(value)}>
        {title.includes("At") ? moment(value).format("DD-MM-YYYY") : value}
      </p>
    </li>
  );
};
