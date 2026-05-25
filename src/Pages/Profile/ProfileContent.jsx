import React from 'react';
import InputFeild, { InputSelect } from '../Auth/InputFeild';
import { Option } from '@material-tailwind/react';
import { Button } from '@material-tailwind/react';
import { useEffect } from 'react';
import { api } from '../../util/axios';
import toast from 'react-hot-toast';

const ProfileContent = ({ user }) => {
    const [details, setDetails] = React.useState({
        name: "",
        gender: "",
        education: "",
        phone: ""
    })
    const updateProfile = async (e) => {
        e.preventDefault()
        try {
            const res = await api.put(`/user/${user?._id}`, details);
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    const [password, setPassword] = React.useState({
        old: "",
        new: "",
        confirm: ""
    })
    useEffect(() => {
        setDetails({
            name: user?.name,
            gender: user?.gender,
            education: user?.education,
            phone: user?.phone
        })
    }, [user])

    const updatePassword = async (e) => {
        e.preventDefault()
        try {
            for (const field of ["new", "confirm"]) {
                if (password[field].length < 6) {
                    toast.error(`${field} Password must be at least 6 characters`)
                    return
                }
            }
            const res = await api.put(`/user/password/${user?._id}`, password);
            toast.success(res.data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
    }

    if (!user) {
        return
    }

    return (
        <div className='grid lg:grid-cols-3 grid-cols-1 gap-5 w-full p-5'>
            <form onSubmit={updateProfile} className='w-full col-span-2'>
                <h1 >Profile Settings</h1>
                <div className='grid lg:grid-cols-2 gap-7 mt-8'>
                    <InputFeild
                        label="User Name"
                        type="text"
                        name="username"
                        value={user?.username}
                        variant={"outlined"}
                        styles={"mb-4 "}
                        disabled
                    />
                    <InputFeild
                        label="Name"
                        type="text"
                        name="name"
                        value={details?.name}
                        variant={"outlined"}
                        onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    />
                    <InputSelect
                        required
                        label="Gender"
                        name="gender"
                        value={details?.gender}
                        variant={"outlined"}
                        onChange={(e) => setDetails({ ...details, gender: e })}
                    >
                        <Option value="">Select Gender</Option>
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                    </InputSelect>
                    <InputSelect
                        variant={"outlined"}
                        label="Education Level"
                        name="education"
                        value={details?.education}
                        onChange={(e) => setDetails({ ...details, education: e })}
                    >
                        <Option value="">Select Education</Option>
                        <Option value="JSC">JSC</Option>
                        <Option value="SSC">SSC</Option>
                        <Option value="HSC">HSC</Option>
                        <Option value="Diploma">Diploma</Option>
                        <Option value="Masters">Masters</Option>
                        <Option value="BSC">BSC</Option>
                        <Option value="Masters">Masters</Option>
                    </InputSelect>
                    <InputFeild
                        label="Email Address"
                        type="text"
                        name="email"
                        value={user?.email}
                        variant={"outlined"}
                        styles={"mb-4 "}
                        disabled
                    />
                    <InputFeild
                        label="Phone Number"
                        type="text"
                        name="email"
                        value={details?.phone}
                        variant={"outlined"}
                        styles={"mb-4 "}
                        onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                            />
                            <Button
                                type='submit'
                                className='w-full py-2 bg-green-500 text-white rounded-md'>Update Profile</Button>
                </div>
            </form>
            <div className='w-full'>
                <h1 >Profile Settings</h1>
                <form className='grid gap-5 mt-8'>
                    <InputFeild
                        required
                        label="Current Password"
                        type="password"
                        name="password"
                        placeholder="Enter Your Password"
                        variant={"outlined"}
                        value={password?.old}
                        onChange={(e) => setPassword({ ...password, old: e.target.value })}
                    />
                    <div className="grid gap-5">
                        <InputFeild
                            required
                            error={password?.new?.length < 6}
                            label="New Password"
                            type="password"
                            name="password"
                            placeholder="Enter Your Password"
                            variant={"outlined"}
                            value={password?.new}
                            onChange={(e) => setPassword({ ...password, new: e.target.value })}
                        />
                        <InputFeild
                            required
                            error={password?.confirm !== password?.new || password?.new?.length < 6}
                            label="Confirm Password"
                            type="password"
                            name="password"
                            placeholder="Enter Your Password"
                            variant={"outlined"}
                            value={password?.confirm}
                            onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={updatePassword}
                        type='submit' className='w-full py-2 bg-red-500 text-white rounded-md'>Update Password</Button>
                </form>
            </div>
        </div>
    );
};

export default ProfileContent;