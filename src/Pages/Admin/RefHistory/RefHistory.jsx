
import React from 'react';

import { Card, Typography } from "@material-tailwind/react";
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import moment from 'moment/moment';
import { api } from '../../../util/axios';
import Loader from '../../../Components/Loader';

const TABLE_HEAD = ["REGISTRATION TIME", "Referer", "User", "Commission", "Generation"];



export function TableWithStripedRows() {
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const res = await api.get(`/refer`)
            return res.data
        },
        queryKey: ["all-refer-all",]
    })

    if (isLoading) {
        <Loader />
    }
    return (
        <Card className="h-full rounded-none w-full overflow-auto mt-5 container mx-auto p-5">
            <h1 className='text-xl py-5'>Total {data?.total}</h1>
            <table className="w-full  table-auto text-left">
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
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
                    {
                        data?.data?.length === 0 && <tr><td colSpan={5} className="p-4 text-center">No Data Available</td></tr>
                    }
                    {data?.data?.map(({ user, reffer, commition, gen, createdAt }, index) => (
                        <tr key={index} className="even:bg-blue-gray-50/50">
                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {moment(createdAt).format('DD/MM/YYYY')}
                                </Typography>
                            </td>
                            <td className="p-4">

                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {reffer?.name}
                                </Typography>
                            </td>
                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {user?.name}
                                </Typography>
                            </td>

                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {commition}TK
                                </Typography>
                            </td>
                            <td className="p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {gen}
                                </Typography>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
const ReferHistory = () => {
    return (
        <div>
            <Card className='rounded mt-7'>
                <div className="bg-primary px-7 py-2">
                    <h2 className='text-base text-white font-semibold text-center'>
                        All Referral History
                    </h2>
                </div>
                <div className='flex justify-between items-center'>
                    <TableWithStripedRows />
                </div>
            </Card>
        </div>
    );
};

export default ReferHistory;