import React from 'react';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { useSelector } from 'react-redux';
const WhatUNeed = ({ open, setOpen }) => {
    const { settings } = useSelector(state => state.user)
    const handleOpen = () => setOpen(!open);
    return (
        <Dialog open={open} handler={handleOpen}>
            <DialogHeader>
                <h1 className='text-center text-red-500'>
                    Note
                </h1>
            </DialogHeader>
            <DialogBody className='text-black'>
                <h3>
                    নিচের দেওয়া নাম্বারে <b>{settings?.acAmm}
                        </b> টাকা রেজিস্ট্রেশন ফি সেন্ড মানি করতে হবে।
                </h3>
                <h5 className='text-red-500'>
                    নিচের নম্বরগুলো ব্যতীত অন্য কোন নাম্বারে সেন্ড মানি করলে এডমিন কর্তৃপক্ষ কোন ভাবে দায়ী থাকবে না।
                </h5>
                <h2 className='text-md text-primary font-semibold'>
                    Send Money
                </h2>
                <h5 className='font-semibold mt-2'>
                    বিকাশ পার্সোনাল
                </h5>
                <ol className='text-sm list-decimal pl-5'>
                    <li> {settings?.accounts?.bkash}</li>
                </ol>
                <h5 className='font-semibold mt-2'>
                    রকেট পার্সোনাল
                </h5>
                <ol className='text-sm list-decimal pl-5'>
                    <li>{settings?.accounts?.rocket}</li>
                </ol>
                <h5 className='font-semibold mt-2'>
                    নগদ পার্সোনাল
                </h5>
                <ol className='text-sm list-decimal pl-5'>
                    <li>{settings?.accounts?.nagad}</li>
                </ol>
                <h5 className='font-semibold mt-2'>
                    উপায় পার্সোনাল
                </h5>
                <ol className='text-sm list-decimal pl-5'>
                    <li>{settings?.accounts?.upay}</li>
                </ol>
                <p className='text-center text-red-600'>
                    বিঃদ্রঃ
                </p>
                <p className='text-center text-sm'>
                    (১) টাকা পাঠানোর পর অবশ্যই স্ক্রিনশট এবং সম্পূর্ণ নাম্বারটি রাখবেন। স্ক্রিনশট সম্ভব না হলে টাকা পাঠানোর সময় এবং তারিখ মনে রাখবেন।
                </p>
                <p className='text-center text-sm'>
                    (২) মোবাইল রিচার্জ গ্ৰহণযোগ্য হবে না। যদি আপনি ভুলে মোবাইল রিচার্জ করে থাকেন সেক্ষেত্রে আপনাকে দ্বিতীয়বার আবার সেন্ড মানি করতে হবে।
                </p>
                <p className='text-center text-sm'>
                    (৩) যদি দোকান থেকে টাকা পাঠিয়ে থাকেন তাহলে অবশ্যই আপনার মোবাইল ফোন দিয়ে পিক তুলে দিবেন অথবা স্ক্রিনশট দিবেন।
                </p>
            </DialogBody>
            <DialogFooter>
                <Button variant="gradient" color="green" onClick={handleOpen}>
                    <span>Okay</span>
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default WhatUNeed;