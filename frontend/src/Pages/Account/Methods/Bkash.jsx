import { Button } from '@material-tailwind/react';
import { Input } from '@material-tailwind/react';
import React from 'react';
import toast from 'react-hot-toast';

const Bkash = ({data}) => {
    const copy = () => {
        navigator.clipboard.writeText(data?.accounts?.bkash);
        toast.success("Copied")
    }
    return (
        <div className=''>
            <h4 className='text-sm mt-5'>
                Bkash Personal
            </h4>
            <div className="mt-2">
                <p className='p-2 bg-gray-200 rounded-lg text-sm mb-2'>{data?.accounts?.bkash}</p>
                <button onClick={copy} disabled={!data?.accounts?.bkash} className='bg-gray-200 hover:bg-gray-300 rounded px-2 text-xs py-2 mt-2 '>
                    Copy Account Number
                </button>
            </div>
            {/* <h4 className='text-sm mt-5'>
                Bkash Marcent
            </h4>
            <div className="mt-2">
                <Input label="Account Marchant"
                    value={"000000000000000"}
                    disabled
                />
                <button className='bg-gray-200 hover:bg-gray-300 rounded px-2 text-xs py-2 mt-2 '>
                    Copy Account Number
                </button>
            </div> */}

        </div>
    );
};

export default Bkash;