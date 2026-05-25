import React, { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import Cookie from 'js-cookie';
import Loader from '../Components/Loader';
import RequierActive from './RequierActive';

const Login = lazy(() => import('../Pages/Auth/Login/Login'));

const AuthChecker = ({ children }) => {
    const { user } = useSelector(state => state.user)
    const token = Cookie.get("token-you",);
    if (token && !user) {
        return <Loader />
    }
    else if (user?.status === "pending") {
        return <RequierActive />
    }
    return user ? children : <Suspense fallback={<Loader />}><Login /></Suspense>
};

export default AuthChecker;
