import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
} from "@material-tailwind/react";

import { useQuery } from "react-query";

import toast from "react-hot-toast";
import { useState } from "react";

import { useSelector } from "react-redux";

import moment from "moment/moment";
import { api } from "../../../util/axios";
import Loader from "../../../Components/Loader";
import logoProvider from "../Users/_Ui/logoProvider";
import Pagination from "../../Account/Pagination";
import { Input } from "@material-tailwind/react";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Status from "./Status";
import { Popover } from "antd";
import { Image } from "antd";

const TABLE_HEAD = [
  "Date",
  "Name",
  "Whatsapp",
  "Amount",
  "Payment",
  "Status",
  "",
];

export default function Withdrawals({ historyType }) {
  const [option, setOption] = useState({
    page: 1,
    limit: 20,
  });
  const [status, setStatus] = useState("pending");
  const { user } = useSelector((state) => state.user);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`history-${historyType}`, search, status, option],
    queryFn: async () => {
      const res = await api.get(
        `/withdraw?page=${option.page}&limit=${option.limit}&${
          search && `search=${search}`
        }&status=${status}`
      );
      return res.data;
    },
  });
  const [image, setImage] = useState(null);

  const queryFn = async (e) => {
    e.preventDefault();
    const text = e.target.search.value;
    setSearch(text);
  };
  const actionHandler = async (id, type, imageUrl) => {
    try {
      if (type === "rejected") {
        const res = await api.put(`/withdraw/reject/${id}`);
        toast.success(res.data.message);
        refetch();
      } else {
        const res = await api.put(`/withdraw/${id}`, {
          status: type,
          image: imageUrl || "",
        });
        toast.success(res.data.message);
        refetch();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    }
  };
  const handleImage = async (id, status) => {
    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      try {
        const res = await api.post("/upload", formData);
        actionHandler(id, status, res.data.url);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong"
        );
      }
    } else {
      actionHandler(id, status);
    }
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <Card className="h-full w-full container my-10 lg:p-0 p-5">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray" className="capitalize">
              All Withdawals
            </Typography>
            <Typography color="gray" className="mt-1 font-normal capitalize">
              Manage all Withdraw Request
            </Typography>
          </div>

          <form
            onSubmit={queryFn}
            className="flex w-full shrink-0 gap-2 md:w-max"
          >
            <div className="w-full md:w-72">
              <Input
                defaultValue={search}
                name="search"
                label="Search"
                type="date"
              />
            </div>
            <Button type="submit" className="flex items-center gap-3" size="sm">
              Search
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
        <Status state={status} setState={setStatus} />
        <table className="w-full  table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.data
              ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(
                (
                  {
                    _id,
                    amount,
                    status,
                    method,
                    account,
                    createdAt,
                    user,
                    image: url,
                  },
                  index
                ) => {
                  const isLast = index === data?.data?.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={_id}>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal text-xs"
                        >
                          {moment(createdAt).format("DD-MM-YYYY hh:mm A")}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={"/default-avater.png"}
                            alt={user.name}
                            size="sm"
                            className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {user.name}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="cursor-pointer hover:text-primary text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(user.username);
                                toast.success("Username Copyed");
                              }}
                            >
                              {user.username}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className=""
                        >
                          <a
                            href={`https://wa.me/${user.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer hover:text-primary font-normal text-xs"
                          >
                            {user.phone}
                          </a>
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal text-xs"
                        >
                          {amount}Tk
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-12 rounded-md border border-blue-gray-50 p-1">
                            <Avatar
                              src={logoProvider(method?.toLowerCase())}
                              size="sm"
                              alt={method}
                              variant="square"
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70 text-xs"
                            >
                              {method}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal capitalize cursor-pointer text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(account);
                                toast.success("Account Copyed");
                              }}
                            >
                              {account}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <Chip
                            size="sm"
                            variant="ghost"
                            value={status}
                            color={
                              status === "completed"
                                ? "green"
                                : status === "pending"
                                ? "amber"
                                : "red"
                            }
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        {status === "pending" ? (
                          <div className="flex gap-2">
                            <Popover
                              trigger={"click"}
                              content={
                                <div className="flex flex-col gap-2">
                                  <input
                                    className="border mb-2 p-1"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        setImage(e.target.files[0]);
                                      } else {
                                        setImage(null);
                                      }
                                    }}
                                  />
                                  <Button
                                    onClick={() =>
                                      handleImage(_id, "completed")
                                    }
                                  >
                                    Accept
                                  </Button>
                                </div>
                              }
                            >
                              <button
                              //   onClick={() => actionHandler(_id, "completed")}
                              >
                                <Chip color="green" value="Accept" />
                              </button>
                            </Popover>
                            <button
                              onClick={() => actionHandler(_id, "rejected")}
                            >
                              <Chip color="red" value="Reject" />
                            </button>
                          </div>
                        ) : (
                          <>{url && <Image src={url} height={80} />}</>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Button
          variant="outlined"
          size="sm"
          onClick={() => {
            if (option.page > 1 && data?.pages > 1) {
              setOption({
                ...option,
                page: option.page + 1,
              });
            }
          }}
          disabled={option.page === 1 && data?.pages === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Pagination
            pages={data?.pages}
            setState={(e) => {
              setOption({ ...option, page: e });
            }}
            active={option.page}
          />
        </div>
        <Button variant="outlined" size="sm">
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
