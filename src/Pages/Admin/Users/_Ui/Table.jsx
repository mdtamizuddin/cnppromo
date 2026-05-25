import { PencilIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
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
  Option,
} from "@material-tailwind/react";
import logoProvider from "./logoProvider";
import { useQuery } from "react-query";
import { api } from "../../../../util/axios";
import Loader from "../../../../Components/Loader";
import toast from "react-hot-toast";
import { useState } from "react";
import { UpdateModal } from "./UpdateModel";
import Pagination from "../../../Account/Pagination";
import Status from "../../TopUp/Status";
import { Select } from "@material-tailwind/react";
import moment from "moment/moment";

const TABLE_HEAD = ["Name", "Email", "Whatsapp","Balance", "Referer",
  "Status", "Action"];


export default function Table() {
  const [option, setOption] = useState({
    page: 1,
    limit: 20
  })
  const [status, setStatus] = useState("pending")
  const [search, setSearch] = useState("")
  const searchHandler = (e) => {
    e.preventDefault();
    setSearch(e.target.search.value)
  }
  const { data, isLoading, refetch } = useQuery(
    {
      queryKey: ["All Users", option, search, status],
      queryFn: async () => {
        const res = await api.get(`/user?page=${option.page}&limit=${option.limit}&reverse=true&${search && `search=${search}`}&status=${status}`);
        return res.data
      }
    }
  )
  const [selectedUser, setSelectedUser] = useState(null)
  const [open, setOpen] = useState(false)

  return (
    <Card className="h-full w-full mt-10">
      {
        open && <UpdateModal refetch={refetch} data={selectedUser} open={open} setOpen={setOpen} />
      }
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              All Users
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Manage all users
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Total {data?.grandTotal}
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Result {data?.total}
            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <form onSubmit={searchHandler} className="w-full md:w-72">
              <Input
                name="search"
                label="Search"
                icon={<button type="submit">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>}
              />
            </form>
          </div>

        </div>
        <Select label="Select Status" value={status} onChange={(e) => setStatus(e)}>
          <Option value="pending">Pending</Option>
          <Option value="active">Active</Option>
        </Select>
      </CardHeader>
      <CardBody className="overflow-scroll w-full px-0">
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
              ) => {
                const isLast = index === data?.users?.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={user?.name}>
                    <td className={classes}

                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          onClick={() => {
                            setOpen(true)
                            setSelectedUser(user)
                          }}
                          src={"/default-avater.png"}
                          alt={user?.name}
                          size="md"
                          className="border cursor-pointer border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                        />
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
                            onClick={() => {
                              navigator.clipboard.writeText(user?.username)
                              toast.success("Username Copyed")
                            }}
                          >
                            {user?.username}
                          </Typography>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className=" text-sm text-secondary"

                          >
                            {moment(user?.createdAt).fromNow()}
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
                        {user?.balance}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {user?.reffer ? user?.reffer?.name : "N/A"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max"
                        onClick={() => {
                          setOpen(true)
                          setSelectedUser(user)
                        }}
                      >
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
                          onClick={() => {
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
          onClick={() => {
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
          onClick={() => {
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