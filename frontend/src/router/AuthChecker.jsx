import React, { lazy, Suspense } from 'react';
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

    // 4. Authenticated & Authorized user
    return children;
};

export default AuthChecker;
