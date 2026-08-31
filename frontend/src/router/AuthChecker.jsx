import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Cookie from 'js-cookie';
import Loader from '../Components/Loader';
import RequierActive from './RequierActive';

const Login = lazy(() => import('../Pages/Auth/Login/Login'));

const AuthChecker = ({ children, requireActive = true }) => {
    const location = useLocation();
    const { user } = useSelector((state) => state.user);
    const token = Cookie.get("token-you");

    // 1. If token exists but user profile is still loading from API
    if (token && !user) {
        return <Loader />;
    }

    // 2. If not logged in at all, show Login
    if (!user) {
        return (
            <Suspense fallback={<Loader />}>
                <Login />
            </Suspense>
        );
    }

    // 3. Strictly verify active status (admin approval) for regular members
    const isApprovedActive = user.status === "active";
    if (requireActive && user.role !== "admin" && user.role !== "moderator" && !isApprovedActive) {
        return <RequierActive />;
    }

    // 4. Redirect admins & moderators away from any user panel route (/user/*) to the admin panel
    if (user.role === "admin" || user.role === "moderator") {
        if (location.pathname.startsWith("/user") || location.pathname === "/user" || location.pathname === "/message" || location.pathname === "/all-message") {
            const destination = user.role === "admin" ? "/admin/dashboard" : "/admin/users";
            window.location.href = destination;
            return null;
        }
    }

    // 5. Authenticated & Authorized user
    return children;
};

export default AuthChecker;
