import { LoginOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Avatar } from 'antd';
import React from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { api } from '../../util/axios';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, setOpen }) => {
    const { user: currentUser } = useSelector(state => state.user)
    const navigate = useNavigate();
    const searchparams = new URLSearchParams(window.location.search);
    const chatHandler = async () => {
        try {
            const newChat = { owner: currentUser?._id, user: user?._id }
            const res = await api.post('/message/chat', newChat)
            searchparams.set('chat', res.data._id)
            navigate(`/message?${searchparams.toString()}`)
            setOpen(false)
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Something went wrong')
        }
    }
    return (
        <div className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 hover:bg-gray-100 focus:outline-none gap-x-4">
            <Avatar size={50} style={{ minWidth: "50px", minHeight: "50px" }} className='w-10 h-10 rounded-full border-primary'>
                {user?.name?.slice(0, 1)}
            </Avatar>
            <div className="w-full pb-2">
                <div className="flex justify-between">
                    <span className="block ml-2 font-semibold text-gray-600">{user?.name}</span>
                    <span className="block ml-2 text-xs text-gray-600">{user?.username}</span>
                </div>
                <span className="block ml-2 text-sm text-gray-600">{user?.phone}</span>
            </div>
            <Button type='primary' onClick={chatHandler}>
                <MessageOutlined />
            </Button>
        </div>
    );
};

export default UserCard;
