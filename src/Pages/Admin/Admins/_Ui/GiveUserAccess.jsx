import { Input } from 'antd';
import React from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../../util/axios';
import { Typography } from 'antd';

const GiveUserAccess = ({ user, refetch }) =>
{
    const [result, setResult] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const searchUser = async (e) =>
    {
        if (!e) {
            setResult([]);
            return;
        }
        try {
            setLoading(true);
            const res = await api.get(`/user?search=${e}`);
            setResult(res.data?.users || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }
    const giveUserAccess = async (id) =>
    {
        try {
            setLoading(true);
            const res = await api.put(`/user/access/${user?._id}`, { userId: id });
            toast.success(res.data.message || 'Access granted successfully');
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <ul className='list-none p-0 mb-4'>
                {user?.allowedUsers?.map(user => (
                    <li key={user.id}>
                        <Typography variant="small" color="blue-gray"
                            onClick={() => giveUserAccess(user._id)}
                            className='cursor-pointer hover:underline border-b border-blue-gray-200 py-2'
                        >
                            {user.username} - {user.email}
                        </Typography>
                    </li>
                ))}
            </ul>
            <Input.Search
                loading={loading}
                title='Search User'
                placeholder='Search by username or email'
                onSearch={searchUser}
                style={{ width: 300, marginBottom: '20px' }}
            />
            {
                result.length > 0 && (
                    <ul>
                        {result.map(user => (
                            <li key={user.id}>
                                <Typography variant="small" color="blue-gray"
                                    onClick={() => giveUserAccess(user._id)}
                                    className='cursor-pointer hover:underline border-b border-blue-gray-200 py-2'
                                >
                                    {user.username} - {user.email}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                )
            }
        </div>
    );
};

export default GiveUserAccess;