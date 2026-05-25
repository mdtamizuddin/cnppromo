'use client';

import { Table, Avatar, Tag, message } from 'antd';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import moment from 'moment';
import logoProvider from '../Admin/Users/_Ui/logoProvider';
import Loader from '../../Components/Loader';
import { api } from '../../util/axios';
import { Image } from 'antd';

export default function HistoryTable({ historyType }) {
    const [option, setOption] = useState({ page: 1, limit: 20 });
    const { user } = useSelector(state => state.user);

    const { data, isLoading } = useQuery({
        queryKey: [`history-${historyType}`, user?._id, option],
        queryFn: async () => {
            const res = await api.get(`/${historyType === 'withdraw' ? 'withdraw' : 'topup'}?user=${user?._id}&reverse=true&limit=${option.limit}&page=${option.page}`);
            return res.data;
        }
    });

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Account copied');
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => moment(createdAt).format('DD-MM-YYYY hh:mm A'),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount} Tk`,
        },
        {
            title: 'Payment',
            key: 'payment',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        shape="square"
                        size={36}
                        src={logoProvider(record.method?.toLowerCase())}
                        style={{ border: '1px solid #f0f0f0', padding: 4 }}
                    />
                    <div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{record.account}</div>
                        <div
                            style={{ fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}
                            onClick={() => handleCopy(record.account)}
                        >
                            {record.trx}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag
                    color={
                        status === 'completed' ? 'green' :
                        status === 'pending' ? 'gold' :
                        'red'
                    }
                >
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
               image ?  <Image height={80} src={image} /> : null
            ),
           hidden: historyType === "withdraw" ? false : true
        }
    ];

    if (isLoading) return <Loader />;

    return (
        <div className="mt-10">
            <h2 className="text-xl font-semibold capitalize mb-2">
                All {historyType} - Total {historyType} ({data?.totalWithdraw})
            </h2>
            <p className="text-sm text-gray-500 capitalize mb-4">
                Manage all your {historyType}
            </p>
            <Table
                columns={columns}
                dataSource={data?.data}
                rowKey="_id"
                pagination={{
                    current: option.page,
                    pageSize: option.limit,
                    total: data?.count || 0,
                    onChange: (page, pageSize) => {
                        setOption({ page, limit: pageSize });
                    }
                }}
                scroll={{ x: true }}
            />
        </div>
    );
}