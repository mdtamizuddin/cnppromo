import { PencilIcon } from "@heroicons/react/24/solid";
import
{
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import
{
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
} from "@material-tailwind/react";
import logoProvider from "./logoProvider";
import { useQuery } from "react-query";
import { api } from "../../../../util/axios";
import Loader from "../../../../Components/Loader";
import toast from "react-hot-toast";
import { useState } from "react";

import Pagination from "../../../Account/Pagination";
import { UpdateModal } from "../../Users/_Ui/UpdateModel";
import { Popover } from "antd";
import GiveUserAccess from "./GiveUserAccess";

const TABLE_HEAD = ["Name", "Email", "Whatsapp", "Referer", "Payment",
  "Status", ""];


export default function Table({ moderator = false })
{
  const [option, setOption] = useState({
    page: 1,
    limit: 20
  })
  const { data, isLoading, refetch } = useQuery(
    {
      queryKey: [`All ${moderator ? "Moderators" : "Admins"}`, option, moderator],
      queryFn: async () =>
      {
        const res = await api.get(`/user?page=${option.page}&limit=${option.limit}&admin=${moderator ? "false" : "true"}&moderator=${moderator ? "true" : "false"}`);
        return res.data
      }
    }
  )
  const [selectedUser, setSelectedUser] = useState(null)
  const [open, setOpen] = useState(false)
  if (isLoading) {
    return <Loader />
  }
  return (
    <Card className="h-full w-full mt-10">
      {
        open && <UpdateModal refetch={refetch} data={selectedUser} open={open} setOpen={setOpen} />
      }
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              All {moderator ? "Moderators" : "Admins"}
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Manage your {moderator ? "moderators" : "admins"} here.
            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>

          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
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
            {data?.users?.map(
              (
                user,
                index,
              ) =>
              {
                const isLast = index === data?.users?.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={user?.name}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        {
                          user?.role === "moderator" ?
                            <Popover trigger={"click"}
                              title={`Give Users Access to ${user?.name}`}
                              content={<GiveUserAccess user={user} 
                              refetch={refetch}
                              />}
                            >
                              <Avatar
                                src={"/default-avater.png"}
                                alt={user?.name}
                                size="md"
                                className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                              />
                            </Popover>
                            :
                            <Avatar
                              src={"/default-avater.png"}
                              alt={user?.name}
                              size="md"
                              className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                            />
                        }
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {user?.name}
                          </Typography>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="cursor-pointer hover:text-primary"
                            onClick={() =>
                            {
                              navigator.clipboard.writeText(user?.username)
                              toast.success("Username Copyed")
                            }}
                          >
                            {user?.username}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {user?.email}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        <a href={`https://wa.me/${user?.phone}`} target="_blank">
                          {user?.phone}
                        </a>
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {user?.referer ? user?.referer?.name : "N/A"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-12 rounded-md border border-blue-gray-50 p-1">
                          <Avatar
                            src={
                              logoProvider(user?.paymentMethod?.toLowerCase())
                            }
                            size="sm"
                            alt={user?.paymentMethod}
                            variant="square"
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal capitalize"
                          >
                            {user?.account}
                          </Typography>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70 uppercase"
                          >
                            {user?.trx}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={user?.status}
                          color={
                            user?.status === "active"
                              ? "green"
                              : user?.status === "pending"
                                ? "amber"
                                : "red"
                          }
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      <Tooltip content="Edit User">
                        <IconButton variant="text"
                          onClick={() =>
                          {
                            setOpen(true)
                            setSelectedUser(user)
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Button variant="outlined" size="sm"
          onClick={() =>
          {
            if (option.page > 1 && data?.pages > 1) {
              setOption({
                ...option, page: option.page - 1
              })
            }
          }}
          disabled={option.page === 1 || data?.pages === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Pagination setState={(e) => setOption({ ...option, page: e })} pages={data?.pages} active={option.page} />
        </div>
        <Button variant="outlined" size="sm"
          onClick={() =>
          {
            if (data?.pages > 1) {
              setOption({
                ...option, page: option.page + 1
              })
            }
          }}
          disabled={option.page === data?.pages}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}