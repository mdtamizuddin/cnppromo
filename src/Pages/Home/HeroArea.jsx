import React from 'react';
import Topbar from '../../Components/Navbar/Navbar';
import Statistic from './Statistic';
import { Button } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { api } from '../../util/axios';
import { useSelector } from 'react-redux';

const HeroArea = () => {
    const { data, } = useQuery({
        queryKey: "statistic",
        queryFn: async () => {
            const res = await api.get("/statistic")
            return res.data
        }
    })
    const { settings } = useSelector(state => state.user)
    return (
        <div className="">
            <div className='container px-5 mx-auto lg:py-20 py-10 '>
                <Statistic data={data} />
                <h1 className='lg:text-4xl text-2xl font-bold text-center lg:mt-20 mt-10 text-black '
                >
                    এসো অনলাইন থেকে টাকা আয় করি !!!
                </h1>
                <h2 className='lg:text-base text-sm text-center lg:mt-2 text-black'>
                বর্তমানে বাংলাদেশের লাখ লাখ মানুষ অনলাইন ইনকাম (Online Income) এর মাধ্যমে তাদের জীবিকা নির্বাহ করছে। 
                খুব সহজেই মানুষ ভালো একটা পরিমানের অর্থ অনলাইন থেকে উপার্জন করছে। দেশের লাখ লাখ মানুষ এখন এই অনলাইন ইনকাম (Online Income) এর উপরে নির্ভরশীল।
                </h2>
                <h2 className='lg:text-base text-sm text-center lg:mt-6 mt-5 text-black'>
                
                    বর্তমানে ফ্রিল্যান্সার খুবই জনপ্রিয় হয়ে উঠেছে। এর মাধ্যমে ঘরে বসে মোবাইল ল্যাপটপ কম্পিউটারের সাহায্যে অনলাইন থেকে টাকা ইনকাম করা যায় । অনেক মানুষই অনলাইন থেকে টাকা ইনকাম করে স্বাবলম্বী হচ্ছেন ঠিক তেমনি ভাবে আমরা নিয়ে এসেছি বেকার যুবক স্টুডেন্ট সহ সকল সাধারণ মোবাইল ব্যাবহারকারীর জন্য টাকা ইনকাম করার সাইট এখানে কাজ করলে আপনি হান্ডেট পার্সেন্ট পেমেন্ট পাবেন ।আমাদের সাইটটি অনেক দিন ধরে বিশ্বস্ততার সাথে গ্রাহকদের সেবা দিয়ে আসছে। আমাদের এই সাইটটির গ্রাহকদের কাজ করা ও ইনকাম করে পেমেন্ট নেওয়ার অসংখ্য প্রমাণ আছে। তাই আর দেরি কেন এখনি রেজিস্ট্রেশন করূন আর আজ থেকেই কাজ শুরু করে দিন।
                </h2>
                
                <div className="flex flex-wrap justify-center mt-10 gap-7">
                    <Link to="/register">
                        <Button variant='filled' size='lg' className='bg-primary text-white rounded-3xl px-10'>
                            Join Now
                        </Button></Link>
                    <a href={settings?.links?.page} target='_blank'>
                        <Button variant='filled' size='lg' className='bg-black text-white rounded-3xl px-10'>
                            Follow Us
                        </Button>
                    </a>
                    <a href={settings?.links?.video} target='_blank'>
                        <Button variant='filled' size='lg' className='bg-black text-white rounded-3xl px-10'>
                            Watch Video
                        </Button>
                    </a>

                </div>
            </div>
        </div>

    );
};

export default HeroArea;

