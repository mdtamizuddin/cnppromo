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

    // 3. If user is not active (non-admins) -> show the RequierActive waiting screen
    const isActive = user.status === "active" || user.active === true;
    if (requireActive && user.role !== "admin" && user.role !== "moderator" && !isActive) {
        return <RequierActive />;
    }

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
