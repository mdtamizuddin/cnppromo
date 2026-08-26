import React from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Cookie from 'js-cookie';
import { api } from '../util/axios';
import { setCurrentUser, setSettings, setStatistic } from '../redux/features/user/userSlice';
import { useSelector } from 'react-redux';
import { Button } from '@material-tailwind/react';
import { useLocation } from 'react-router-dom';
const DefaultFetch = () =>
{
    const dispatch = useDispatch();
    const { refresh, user } = useSelector(state => state.user)
    useEffect(() =>
    {
        (
            async () =>
            {
                try {
                    const token = Cookie.get("token-you",);
                    if (token) {
                        const res = await api.get('/user/me');
                        dispatch(setCurrentUser(res.data));

                        const sta = await api.get("/refer/statistic")
                        dispatch(setStatistic(sta.data))
                    }
                    const setting = await api.get('/setting');
                    dispatch(setSettings(setting.data.setting));

                } catch (error) {
                    console.log(error)
                }
            }
        )()
    }, [refresh])
    return (
        <>
            {
                user?.lock && <div className='w-full h-screen  fixed top-0 left-0 bg-black z-[100] text-red-600'>
                    <div className='w-full h-full flex justify-center items-center'>
                        <h1 className='text-xl font-light'>Your Account Is Locked. Please Contact With Support</h1>
                        <Button className='bg-white text-red-600 ml-3'
                            onClick={() =>
                            {
                                Cookie.remove("token-you");
                                window.location.reload();
                            }}
                        >
                            LogOut
                        </Button>
                    </div>
                </div>
            }
        </>
    );
};

export default DefaultFetch;