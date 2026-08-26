import React, { useState, useEffect } from "react";
import
    {
        Button,
        Dialog,
        DialogHeader,
        DialogBody,
        DialogFooter,
        Avatar,
        Typography,
        Select,
        Option,
    } from "@material-tailwind/react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { api } from "../../../../util/axios";
import Loader from "../../../../Components/Loader";
import InputFeild from "../../../Auth/InputFeild";
import logoProvider from "./logoProvider";

export function UpdateModal({ open, setOpen, data: user, refetch })
{
    const { user: admin } = useSelector((state) => state.user);
    const handleOpen = () => setOpen(!open);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const [value, setValue] = useState({
        name: "",
        username: "",
        role: "user",
    });

    // Set user data when modal opens
    useEffect(() =>
    {
        if (user) {
            setValue({
                name: user?.name || "",
                username: user?.username || "",
                role: user?.role || "user",
            });
        }
    }, [user]);

    const makeActive = async () =>
    {
        try {
            setLoading(true);
            const res = await api.put(`/user/active/${user?._id}`);
            toast.success(res.data.message);
            refetch();
            setOpen(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async () =>
    {
        try {
            setLoading(true);
            const res = await api.put(`/user/${user?._id}`, value);
            toast.success(res.data.message);
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async () =>
    {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            setLoading(true);
            const res = await api.delete(`/user/${user?._id}`);
            toast.success(res.data.message);
            setOpen(false);
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const lockUnlock = async (status) =>
    {
        try {
            setLoading(true);
            const res = await api.put(`/user/${user?._id}`, { lock: status });
            toast.success(res.data.message);
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () =>
    {
        if (!password) return toast.error("Please enter password");
        try {
            setLoading(true);
            const res = await api.put(`/user/new-password/${user?._id}`, { password });
            toast.success("Password updated successfully");
            setPassword("");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (admin?.role !== "admin" && admin?.role !== "moderator") return null;

    return (
        <Dialog open={open} handler={handleOpen}>
            <DialogHeader>{user?.name}</DialogHeader>
            <DialogBody>
                {loading && <Loader />}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-12 rounded-md border border-blue-gray-50 p-1">
                        <Avatar
                            src={logoProvider(user?.paymentMethod?.toLowerCase())}
                            size="sm"
                            alt={user?.paymentMethod}
                            variant="square"
                            className="h-full w-full object-contain p-1"
                        />
                    </div>
                    <div className="flex flex-col">
                        <Typography variant="small" color="blue-gray" className="font-normal capitalize">
                            {user?.account}
                        </Typography>
                        <Typography variant="small" color="blue-gray" className="font-normal opacity-70 uppercase">
                            {user?.trx}
                        </Typography>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                    <h5>Referer</h5>
                    <div className="flex flex-col">
                        <Typography variant="small" color="blue-gray" className="font-normal capitalize">
                            {user?.reffer?.name || "N/A"}
                        </Typography>
                        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                            {user?.reffer?.username || "N/A"}
                        </Typography>
                    </div>
                </div>

                <form className="grid grid-cols-1 gap-2">
                    {
                        admin?.role === "admin" && <div className="py-4">
                            <Select
                            label="Change Role"
                            variant="static"
                            value={value?.role}
                            onChange={(val) => setValue({ ...value, role: val })}
                        >
                            <Option value="user">User</Option>
                            <Option value="admin">Admin</Option>
                            <Option value="moderator">moderator</Option>
                        </Select>
                        </div>
                    }

                    <InputFeild
                        label="Name"
                        value={value.name}
                        onChange={(e) => setValue({ ...value, name: e.target.value })}
                    />

                    <InputFeild label="Email" value={user?.email} disabled={true} />

                    <InputFeild
                        label="User Name"
                        value={value.username}
                        onChange={(e) => setValue({ ...value, username: e.target.value })}
                    />

                    <InputFeild label="Account Balance" value={user?.balance} disabled={true} />
                </form>

                {user?.status !== "active" ? (
                    <>
                        <Button onClick={makeActive} className="mt-4 mr-3" color="green" size="sm" disabled={loading}>
                            Make Active
                        </Button>
                        <Button onClick={deleteAccount} className="mt-4 mr-3" color="red" size="sm" disabled={loading}>
                            Delete Account
                        </Button>
                    </>
                ) : (
                    <div>
                        {user?.lock ? (
                            <Button
                                onClick={() => lockUnlock(false)}
                                disabled={loading}
                                className="mt-4"
                                color="green"
                                size="sm"
                            >
                                Unlock Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={deleteAccount}
                                    className="mt-4 mr-3"
                                    color="red"
                                    size="sm"
                                    disabled={loading}
                                >
                                    Delete Account
                                </Button>
                                <Button
                                    onClick={() => lockUnlock(true)}
                                    disabled={loading}
                                    className="mt-4"
                                    color="red"
                                    size="sm"
                                >
                                    Lock Profile
                                </Button>
                            </>
                        )}
                    </div>
                )}

                <div className="mt-5">
                    <InputFeild
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter New Password"
                    />
                    <Button
                        variant="filled"
                        color="green"
                        onClick={updatePassword}
                        className="mt-3"
                        disabled={loading}
                    >
                        Update Password
                    </Button>
                </div>
            </DialogBody>

            <DialogFooter>
                <Button variant="text" color="red" onClick={handleOpen} className="mr-1" disabled={loading}>
                    <span>Cancel</span>
                </Button>
                <Button disabled={loading} variant="gradient" color="green" onClick={updateUser}>
                    <span>Update</span>
                </Button>
            </DialogFooter>
        </Dialog>
    );
}