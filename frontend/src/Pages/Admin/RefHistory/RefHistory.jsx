
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
        return <Loader />
    }
    return (
        <Card className="h-full rounded-2xl w-full overflow-hidden mt-5 container mx-auto p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h1 className='text-lg md:text-xl font-bold text-gray-900'>Total Referrals: {data?.total || data?.data?.length || 0}</h1>
            </div>

            {/* 📱 Mobile View: Referral History Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
                {data?.data?.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 font-medium">No Data Available</div>
                ) : (
                    data?.data?.map(({ user, reffer, commition, gen, createdAt }, index) => (
                        <div key={index} className="p-3.5 space-y-2 hover:bg-blue-50/20 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900">{user?.name || "Anonymous"}</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                    Gen {gen}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Referrer: <strong className="text-gray-700 font-medium">{reffer?.name || "Direct"}</strong></span>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    +{commition} TK
                                </span>
                            </div>

                            <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-50">
                                {moment(createdAt).format('DD/MM/YYYY hh:mm A')}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🖥️ Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[650px] table-auto text-left">
                    <thead>
                        <tr>
                            {TABLE_HEAD.map((head) => (
                                <th key={head} className="border-b border-gray-200 bg-gray-50 p-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data?.data?.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-400">No Data Available</td></tr>
                        )}
                        {data?.data?.map(({ user, reffer, commition, gen, createdAt }, index) => (
                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-3.5 text-xs text-gray-600">
                                    {moment(createdAt).format('DD/MM/YYYY')}
                                </td>
                                <td className="p-3.5 text-xs font-medium text-gray-900">
                                    {reffer?.name || "Direct"}
                                </td>
                                <td className="p-3.5 text-xs font-semibold text-gray-900">
                                    {user?.name}
                                </td>
                                <td className="p-3.5 text-xs font-bold text-emerald-600">
                                    {commition} TK
                                </td>
                                <td className="p-3.5 text-xs">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                        {gen}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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