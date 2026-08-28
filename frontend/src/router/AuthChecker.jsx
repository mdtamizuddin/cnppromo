import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Cookie from 'js-cookie';
import Loader from '../Components/Loader';
import RequierActive from './RequierActive';

const Login = lazy(() => import('../Pages/Auth/Login/Login'));

const AuthChecker = ({ children, requireActive = false }) => {
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

    // 3. If active status is required (e.g. for /message) and user is not active (non-admins)
    if (requireActive && user.role !== "admin" && user.role !== "moderator" && user.status !== "active") {
        return <RequierActive />;
    }

    const location = useLocation();

    // 4. Redirect admins away from the main user dashboards
    if ((user.role === "admin" || user.role === "moderator") && 
        (location.pathname === "/user/home" || location.pathname === "/user/welcome")) {
        window.location.href = "/admin";
        return null;
    }

    // 5. Authenticated & Authorized user
    return children;
};

export default AuthChecker;
