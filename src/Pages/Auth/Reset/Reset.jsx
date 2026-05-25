import { Card, Option } from '@material-tailwind/react';
import React, { useEffect } from 'react';
import InputFeild from '../InputFeild';
import 'react-phone-number-input/style.css'
import { Button } from '@material-tailwind/react';
import { api } from '../../../util/axios';
import { isExpired, decodeToken } from "react-jwt";
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
const Reset = () => {
    const [data, setData] = React.useState({
        email: "",
        password: "",
        repassword: "",
    });
    const navigate = useNavigate();
    const search = useSearchParams()[0].get("code");
    const [tokenData, setTokenData] = React.useState({});
    useEffect(() => {
        if (search) {
            const myDecodedToken = decodeToken(search);
            const isMyTokenExpired = isExpired(search);

            setTokenData({ ...myDecodedToken, isExpired: isMyTokenExpired });
        }
    }, [search])
    const updateState = (e, e2) => {
        if (!e2) {
            setData({ ...data, [e.target.name]: e.target.value });
        }
        else {
            setData({ ...data, [e2]: e });
        }
    }


    const [error, setError] = React.useState("");
    const SubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const time = localStorage.getItem("time");
            const currentTime = new Date().getTime();
            const email = localStorage.getItem("email");
            if (time && currentTime < Number(time) && email === data.email) {
                toast.error(`Please try after ${Math.floor((time - currentTime) / 60 / 1000)} minutes`);
                return;
            }

            const res = await api.get(`/user/send-link/${data.email}`, data);
            setError("")
            toast.success("Please check your email for reset link");
            localStorage.setItem("time", Date.now() + 5 * 60 * 1000);
            localStorage.setItem("email", data.email);
        } catch (error) {
            setError(error.response.data.message || error.message || "Something went wrong")
        }
    }
    const updatePassword = async (e) => {
        e.preventDefault();
        if (!data.password || data.password.length < 6) {
            toast.error("Please enter password with at least 6 characters")
            return
        }
        try {
            const res = await api.put(`/user/new-password/${tokenData?.id}`, {
                password: data.password
            });

            toast.success("Password updated successfully")
            navigate("/login")
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    return (
        <div className='container mx-auto mt-20 min-h-[80vh]'>
            <Card className='p-10 max-w-[800px] mx-auto' >
                <h1 className='text-2xl font-semibold'>Reset Password</h1>
                <form onSubmit={(e) => {
                    if (search) {
                        updatePassword(e)
                    }
                    else {
                        SubmitHandler(e)
                    }
                }} className="flex flex-col mt-10 gap-x-5 gap-y-5">
                    {
                        search ?
                            <>
                                {
                                    tokenData?.isExpired ?
                                        <div>
                                            <h1 className='text-red-500 text-xl'>Link Expired!</h1>
                                        </div>
                                        :
                                        <>
                                            <InputFeild
                                                label="Email"
                                                type="text"
                                                name="email"
                                                placeholder="Enter Your Email"
                                                value={tokenData.email}
                                                disabled
                                                className='col-span-2'
                                            />
                                            <InputFeild
                                                label="New Password (min 6 characters)"
                                                type="text"
                                                name="password"
                                                placeholder="Enter New Password"
                                                value={data.password}
                                                onChange={(e) => updateState(e)}
                                                required
                                                className='col-span-2'
                                            />
                                            <p className='text-red-500 text-xs col-span-2'>
                                                {error}
                                            </p>
                                            <div className="col-span-2 flex justify-center ">
                                                <Button type='filled' color='green'
                                                    className='px-10'
                                                >
                                                    {
                                                        search ? "Update Password" : "Send Reset Link"
                                                    }
                                                </Button>
                                            </div>
                                        </>
                                }
                            </>
                            :
                            <>
                                <InputFeild
                                    label="Email"
                                    type="text"
                                    name="email"
                                    placeholder="Enter Your Email"
                                    value={data.email}
                                    onChange={(e) => updateState(e)}
                                    required
                                    className='col-span-2'
                                />
                                <p className='text-red-500 text-xs col-span-2'>
                                    {error}
                                </p>
                                <div className="col-span-2 flex justify-center ">
                                    <Button type='filled' color='green'
                                        className='px-10'
                                    >
                                        {
                                            search ? "Update Password" : "Send Reset Link"
                                        }
                                    </Button>
                                </div>
                            </>

                    }

                </form>
            </Card>
        </div>
    );
};

export default Reset;

