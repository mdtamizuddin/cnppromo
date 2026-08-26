import React from 'react';
import { useSelector } from 'react-redux';

const RequierActive = () => {
    const {user} = useSelector(state => state.user)
    return (
        <div className='flex flex-col min-h-[80vh] justify-center items-center'>
            <h1>Hi, {user?.name}</h1>
            <h1 className='text-red-500 mt-2'>আপনার অ্যাকাউন্ট অ্যাকটিভ নয় অ্যাকটিভ করতে অ্যাডমিনের সাথে যোগাযোগ করুন অথবা অনুগ্রহপূর্বক অপেক্ষা করুন</h1>
        </div>
    );
};

export default RequierActive;