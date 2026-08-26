import React from 'react';

import { Card, Typography } from "@material-tailwind/react";
import { useState } from 'react';
import { useQuery } from 'react-query';
import Loader from '../../Components/Loader';
import { api } from '../../util/axios';
import { useSelector } from 'react-redux';

const TABLE_HEAD = ["Generation", "Total Points", "Total Refer"];



export function TableWithStripedRows() {
    const { settings } = useSelector(state => state.user)
    const { data, isLoading } = useQuery({
        queryKey: ["statistics"],
        queryFn: async () => {
            const res = await api.get("/refer/statistic")
            return res.data
        }
    })
    if (isLoading) {
        <Loader />
    }
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
    return (
        <Card className="h-full w-full overflow-auto mt-5">
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
                                <Typography variant="small" color="blue-gray" className="font-semibold text-primary">
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
const ReferInfo = () => {
    return (
        <div className='container mx-auto py-20 px-5'>
            <h2 className='text-3xl font-bold text-center'>
                Your total referral balance info
            </h2>

            <TableWithStripedRows />
        </div>
    );
};

export default ReferInfo;

