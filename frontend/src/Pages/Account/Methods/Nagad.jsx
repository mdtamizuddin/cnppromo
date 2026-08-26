import { Button } from '@material-tailwind/react';
import { Input } from '@material-tailwind/react';
import React from 'react';
import toast from 'react-hot-toast';

export default function Nagad({data}) {

    return (
        <div className=''>

            <h4 className='text-sm mt-5'>
                Nagad Personal
            </h4>
            <div className="mt-2">
            <p className='p-2 bg-gray-200 rounded-lg text-sm mb-2'>{data?.accounts?.nagad}</p>
                <button disabled={!data?.accounts?.nagad}
                onClick={()=> {
                    navigator.clipboard.writeText(data?.accounts?.nagad);
                    toast.success("Copied")
                }}
                className='bg-gray-200 hover:bg-gray-300 rounded px-2 text-xs py-2 mt-2 '>
                    Copy Account Number
                </button>
            </div>
        </div>
    );
};
