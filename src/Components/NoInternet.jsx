import { Button } from '@material-tailwind/react';
import React from 'react';

const NoInternet = () => {
    return (
        <div className='gradiant-bg-2 h-screen w-full flex items-center justify-center flex-col gap-y-5'>
            <h1 className='capitalize text-2xl font-semibold'>
                Server is Not Running
            </h1>
            <Button>
                Please Contact With Developer
            </Button>
        </div>
    );
};

export default NoInternet;