import React from 'react';
import Loader from '../Components/Loader';
import { useQuery } from 'react-query';
import { api } from './axios';
import { Navigate, useLocation } from 'react-router-dom';

import Cookie from 'js-cookie';

// Admin routes are nested under /admin, so these must be full router paths.
const MODERATOR_ACCESS = [
    "/admin/users",
    "/admin/non-active-users",
    "/admin/banned-users",
];

const MODERATOR_HOME = "/admin/users";

const AdminChecker = ({ children }) => {
    const path = useLocation().pathname;
    const token = Cookie.get("token-you");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const { data, isLoading, isError } = useQuery({
        queryFn: async () => {
            const res = await api.get('/user/me');
            return res.data;
        },
        queryKey: 'user',
        staleTime: 1000 * 60,
    });

    if (isLoading) {
        return <Loader />;
    }
    if (isError || !data) {
        return <Navigate to="/login" replace />;
    }
    if (data.role === "admin") {
        return children;
    }
    if (data.role === "moderator") {
        if (MODERATOR_ACCESS.includes(path)) {
            return children;
        }
        return <Navigate to={MODERATOR_HOME} replace />;
    }
    return <Navigate to="/user/welcome" replace />;
};

export default AdminChecker;
