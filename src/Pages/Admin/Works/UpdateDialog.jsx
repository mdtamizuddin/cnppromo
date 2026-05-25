import React from 'react';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import InputFeild from '../../Auth/InputFeild';
import { Textarea } from '@material-tailwind/react';
import toast from 'react-hot-toast';
import { api } from '../../../util/axios';
import { category } from './AllWorks';

const UpdateDialog = ({ open, setOpen, data, refetch }) => {
    const handleOpen = () => setOpen(!open);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const dataA = Object.fromEntries(formData);
            const res = await api.put(`/work/${data?._id}`, dataA)
            toast.success("Work Add Successfull")
            handleOpen()
            refetch()
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    return (
        <Dialog open={open} handler={handleOpen} >
            <DialogHeader>Update Work</DialogHeader>
            <DialogBody>
                <form className='flex flex-col gap-y-4' onSubmit={handleSubmit}>
                    <select required label='Select Category' name='category'
                        className='border p-2 text-sm font-normal rounded-lg border-gray-400'
                        defaultValue={data?.category}
                    >
                        <option disabled value="">Select Category</option>
                        {
                            category?.filter(data => data?.path !== "").map((data, i) => <option key={i} value={data?.path}>{data?.name}</option>)
                        }
                    </select>
                    <InputFeild
                        defaultValue={data?.name}
                        type="text"
                        label="Title"
                        name="name"
                        placeholder="Enter Title"
                        variant={"outline"}
                        required
                    />
                    <InputFeild
                        defaultValue={data?.link}
                        type="text"
                        label="Link"
                        name="link"
                        placeholder="Enter Title"
                        variant={"outline"}
                        required
                    />
                    <Textarea
                        defaultValue={data?.desc}
                        type="text"
                        label="Description"
                        name="desc"
                        variant={"outline"}
                        required
                    />
                    <Button type='submit'>
                        Update Work
                    </Button>
                </form>
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="text"
                    color="red"
                    onClick={handleOpen}
                    className="mr-1"
                >
                    <span>Cancel</span>
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default UpdateDialog;