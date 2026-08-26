import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '@material-tailwind/react';
import React from 'react';

const Advantage = () => {
    return (
        <div className='container mx-auto mt-8 pb-20 p-5'>
            <h2 className='text-3xl font-bold text-center text-black'>
                Our advantages
            </h2>
            <FontAwesomeIcon icon={faArrowDown} />
            <div className="grid lg:grid-cols-4 mt-10 gap-5">
                <AdvantageCard
                    title={"কাজ করতে যা যা প্রয়োজন"}
                    desc={
                        <p>
                            ১)ধৈর্য... দীর্ঘদিন কাজ করার ধৈর্য থাকতে হবে। <br />
                            ২) মোবাইল ইন্টারনেট অথবা ওয়াইফাই যেকোনো একটি থাকলেই হবে।
                            <br />
                            ৩) সততা... নিয়ে কাজ করলে ১০০% সফল হবেন।
                            <br />
                            ৪) পরিশ্রম... কঠোর পরিশ্রমই হয়ে কাজ করলে তাড়াতাড়ি সফল হবেন।
                        </p>
                    }
                />
                <AdvantageCard
                    title={"ওয়েবসাইটে ২০ থেকে ২৫টি সাইটের কাজ শেখানো হবে ধাপে ধাপে।"}
                    desc={"কাজগুলো করে বেশিরভাগ মানুষ নরমালি ৫০০ থেকে ৬০০ টাকা ইনকাম করে। বেশি অভিজ্ঞতা ব্যক্তিরা দিনে ১০০০ থেকে ১৫০০ টাকা ইনকাম করে। কাজ শুরু করার প্রথম দিন থেকে ইনকাম শুরু হবে ইনশাআল্লাহ।"}
                />
                <AdvantageCard
                    title={"প্রতিদিনের কাজের সময়"}
                    desc={"আপনি ২৪ ঘন্টার মধ্যে সকাল বিকাল রাত যে কোন সময় কাজ করতে পারেন। তবে অবশ্যই ৩ থেকে ৪ ঘন্টা সময় দিতে হবে। কাজের কোন নির্দিষ্ট টাইম নাই😊আপনার সুবিধা অনুযায়ী আপনি কাজ করতে পারবেন। কাজ করতে প্রয়োজন মোবাইল ইন্টারনেট অথবা ওয়াইফাই এবং আপনার হাতের ফোন এবং ল্যাপটপ। ✅"}
                />
                <AdvantageCard
                    title={"দ্রুত ইনকাম"}
                    desc={"দ্রুত ইনকাম করার জন্য এডমিন অহনা/প্রমিতি আপনাদেরকে কাজের যে লিস্ট দিয়েছে সে লিস্ট অনুযায়ী আপনারা কাজ করলে অনেক টাকা ইনকাম করতে পারবেন। এডমিনদের সাজেশন নিয়ে কাজ করলে তাড়াতাড়ি সফল হতে পারবেন। তাই দ্রুত ইনকাম করার জন্য অবশ্যই এডমিনের সহযোগিতা নিবেন। ধন্যবাদ।"}
                />
                <AdvantageCard
                    title={"ট্রেনিং"}
                    desc={"ট্রেনিংয়ের জন্য আমাদের 2জন এডমিন নিয়োগ দেওয়া আছে। তারা প্রতিদিন 4 ঘন্টা করে টোটাল ৮ ঘন্টা ট্রেনিং দেন মেম্বারদেরকে। এই ৮ ঘন্টার ভিতরে যে যে কাজগুলো পারবে না তাকে সে কাজগুলো ভালোমতো শিখিয়ে দেওয়া হবে 😊 সততা নিয়ে কাজ করলে আপনি নিজেও একসময় এডমিন হিসেবে কাজ করতে পারবেন আমাদের কোম্পানিতে 😊✅"}
                />
            </div>
        </div>
    );
};

export default Advantage;

const AdvantageCard = ({ title, desc }) => {
    return (
        <Card className='px-5 py-7 border-2 text-black shadow-primary/10'>
            <h3 className='text-xl font-bold text-center text-black'>
                {title}
            </h3>
            <FontAwesomeIcon
                icon={faArrowDown}
                className='text-2xl mt-5 text-black'
            />
            <p className='text-center text-sm mt-5 text-black'>
                {desc}
            </p>
        </Card>
    )
}

