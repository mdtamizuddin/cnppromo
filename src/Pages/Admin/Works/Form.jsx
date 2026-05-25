import React from 'react';
import InputFeild from '../../Auth/InputFeild';
import { Option, Textarea } from '@material-tailwind/react';
import { Button } from '@material-tailwind/react';
import toast from 'react-hot-toast';
import { api } from '../../../util/axios';
import { Select } from '@material-tailwind/react';
import { category } from './AllWorks';

const Form = () => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const res = await api.post('/work', data)
            toast.success("Work Add Successfull")
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    return (
        <form className='flex flex-col gap-y-4 p-5 my-4 bg-white' onSubmit={handleSubmit}>
            <h2 className='text-xl mt-3'>Add Work</h2>
            <select required label='Select Category' name='category'
            className='border p-2 text-sm font-normal rounded-lg border-gray-400'
            >
                <option disabled value="">Select Category</option>
                {
                    category?.filter(data => data?.path !== "").map((data, i) => <option key={i} value={data?.path}>{data?.name}</option>)
                }
            </select>
            <InputFeild
                type="text"
                label="Title"
                name="name"
                placeholder="Enter Title"
                variant={"outline"}
                required
            />
            <InputFeild
                type="text"
                label="Link"
                name="link"
                placeholder="Enter Title"
                variant={"outline"}
                required
            />
            <Textarea
                type="text"
                label="Description"
                name="desc"
                variant={"outline"}
                required
            />
            <Button type='submit'>
                Submit
            </Button>
        </form>
    );
};

export default Form;