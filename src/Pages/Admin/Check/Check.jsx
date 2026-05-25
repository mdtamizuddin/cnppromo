import React from 'react';

import { Card, Typography } from "@material-tailwind/react";
import { useState } from 'react';
import { useQuery } from 'react-query';

import { useSelector } from 'react-redux';
import { api } from '../../../util/axios';
import Loader from '../../../Components/Loader';
import { Input } from '@material-tailwind/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '@material-tailwind/react';
import toast from 'react-hot-toast';
import { LoaderIcon } from 'react-hot-toast';

const TABLE_HEAD = ["Generation", "Total Points", "Total Refer"];



export function TableWithStripedRows() {
    const { settings } = useSelector(state => state.user)

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const search = async (text) => {
        if (text === "") {
            return toast.error("Please enter Email Or Username")
        }
        try {
            setIsLoading(true)
            setData(null)
            const res = await api.get(`/refer/statistic/${text}`)
            setData(res.data)
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    // const { data, isLoading } = useQuery({
    //     queryKey: ["statistics-user", search],
    //     queryFn: async () => {

    //     }
    // })

    const TABLE_ROWS = [
        {
            name: `1st generation ( ${settings?.ref_comm?.gen1}tk per refer )`,
            job: data?.gen1,
            date: data?.gen1,
        },
        {
            name: `2nd generation ( ${settings?.ref_comm?.gen2}tk per refer )`,
            job: data?.gen2,
            date: data?.gen2,
        },
        {
            name: `3rd generation ( ${settings?.ref_comm?.gen3}tk per refer )`,
            job: data?.gen3,
            date: data?.gen3,
        },
        {
            name: `4th generation ( ${settings?.ref_comm?.gen4}tk per refer )`,
            job: data?.gen4,
            date: data?.gen4,
        },
        {
            name: `5th generation ( ${settings?.ref_comm?.gen5}tk per refer )`,
            job: data?.gen5,
            date: data?.gen5,
        },
        {
            name: `6th generation ( ${settings?.ref_comm?.gen6}tk per refer )`,
            job: data?.gen6,
            date: data?.gen6,
        }
    ];
    const [updating, setUpdating] = useState(false)
    const updatebalance = async (e) => {
        e.preventDefault();
        const balance = e.target.balance.value
        try {
            setUpdating(true)
            await api.put(`/user/${data?.user?._id}`, { balance })
            toast.success("Balance Updated Successfull")
            search(data?.user?.email)
            setUpdating(false)
        } catch (error) {
            setUpdating(false)
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    if (isLoading) {
        <Loader />
    }
    return (
        <Card className="h-full w-full overflow-auto mt-5 p-2">
            <div className="flex flex-col gap-5">
                <div>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        search(e.target.search.value)
                    }} className="flex w-full shrink-0 gap-2 md:w-max mb-5">
                        <div className="w-full md:w-72">
                            <Input
                                label="Search"
                                name="search"
                                placeholder='Username or Email'
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}

                            />
                        </div>
                        <Button disabled={isLoading} type='submit' className="flex items-center gap-3" size="sm">
                            Search {
                                isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />
                            }
                        </Button>
                    </form>
                    <div className='text-sm p-2'>
                        Name : {data?.user?.name} <br />
                        Email : {data?.user?.email} <br />
                        Phone : {data?.user?.phone} <br />
                        Username: {data?.user?.username} <br />
                        Balance: {data?.user?.balance}
                    </div>
                </div>
                {
                    !isLoading && data?.user && <form className='mb-5'
                        onSubmit={updatebalance}
                    >
                        <Input
                            defaultValue={data?.user?.balance}
                            label="Balance"
                            name="balance"
                        />
                        <Button disabled={updating || isLoading} type='submit' className="flex items-center gap-3 bg-primary mt-2" size="sm">
                            Update Balance {
                                updating || isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />
                            }
                        </Button>
                    </form>
                }
            </div>
            <table className="w-full  table-auto text-left">
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th key={head} className="border-b border-blue-gray-100 bg-primary p-4">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-semibold leading-none text-white"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {TABLE_ROWS.map(({ name, job, date }, index) => (
                        <tr key={name} className="even:bg-blue-gray-50/50">
                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-semibold text-primary text-xs">
                                    {name}
                                </Typography>
                            </td>
                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {job}
                                </Typography>
                            </td>
                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {date}
                                </Typography>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
const Check = () => {
    return (
        <div className='container mx-auto pt-10 pb-20 px-5'>
            <h2 className='text-3xl font-bold text-center'>
                Check an user
            </h2>

            <TableWithStripedRows />
        </div>
    );
};

export default Check;

