import React from 'react';
import Loader from '../Components/Loader';
import { useQuery } from 'react-query';
import { api } from './axios';
import { Navigate, useLocation } from 'react-router-dom';

// Admin routes are nested under /admin, so these must be full router paths.
// A bare "/users" here never matches useLocation().pathname and would lock
// moderators out of every admin page.
const MODERATOR_ACCESS = [
    "/admin/users",
    "/admin/non-active-users",
    "/admin/banned-users",
];

// Where a moderator lands when they hit an admin page they may not open.
// Sending them to "/" would bounce off AuthChecker straight back to /admin.
const MODERATOR_HOME = "/admin/users";

const AdminChecker = ({ children }) => {
    const path = useLocation().pathname;
    const { data, isLoading, isError } = useQuery({
        queryFn: async () => {
            const res = await api.get('/user/me')
            return res.data
        },
        queryKey: 'user'
    })

    if (isLoading) {
        return <Loader />
    }
    if (isError || !data) {
        return <Navigate to="/login" replace />
    }
    if (data.role === "admin") {
        return children
    }
    if (data.role === "moderator") {
        if (MODERATOR_ACCESS.includes(path)) {
            return children
        }
        return <Navigate to={MODERATOR_HOME} replace />
    }
    return <Navigate to="/user/home" replace />
};

export default AdminChecker;
