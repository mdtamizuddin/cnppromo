import React from 'react';
import Loader from '../Components/Loader';
import { useQuery } from 'react-query';
import { api } from './axios';
import { useLocation } from 'react-router-dom';

const AdminChecker = ({ children }) => {
    const moderatorAccess = [
        "/users",
    ]
    const path = useLocation().pathname;
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const res = await api.get('/user/me')
            return res.data
        },
        queryKey: 'user'
    })
    if (isLoading) {
        return <Loader />
    }
    if (!data) {
        return window.location.href = "/login"
    }
    if (data?.role === "admin") {
        return children
    }
    else if (data?.role === "moderator") {
        if (moderatorAccess.includes(path)) {
            return children
        }
        else {
            return window.location.href = "/"
        }
    }
};

export default AdminChecker;