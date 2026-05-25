import React from 'react';

const WhyShould = () => {
    return (
        <section className='lg:py-20 py-10 bg-white p-5'>
            <div className='container mx-auto'>
                <h2 className='text-3xl font-bold text-center text-black'>
                Why you should work with us
                </h2>
                <div className="lg:mt-5 mt-5">
                    <div className='grid p-5 lg:p-0 lg:grid-cols-2 lg:gap-10 gap-5'>
                        <div className="mt-5 lg:border-r border-white pr-10 flex flex-col gap-4 pt-5">
                            <h3 className='text-xl text-center  text-black mb-5'>আমরা শুরু থেকে প্রতিদিনের পেমেন্ট প্রতিদিন দিয়ে থাকি।</h3>
                            <Option
                                title={1}
                                desc={"আমরা কাজের শুরু থেকেই প্রতিদিনের টাকা প্রতিদিন দিয়ে থাকি।"}
                            />
                            <Option
                                title={2}
                                desc={"আমাদের এই প্লাটফর্মটি 100% রিয়াল এবং ভেরিফাইড সাইড।"}
                            />
                            <Option
                                title={3}
                                desc={"বাসায় বসে আপনার সুবিধা মতো যেকোনো সময় কাজটি করতে পারবেন।"}
                            />
                            <Option
                                title={4}
                                desc={"আমাদের এখানে কাজটি করলে সবথেকে বেস্ট সুবিধা হোলো,আপনাকে আর কোথাও কাজ খুঁজতে হবে না।"}
                            />
                            <Option
                                title={5}
                                desc={"যারা ফ্রিল্যান্সিং বা ফেসবুক মাৰ্কেটিং এর কাজ গুলো করার স্বপ্ন দেখেন, আমাদের এই প্লাটফর্মে এসে কাজ করলে আপনাদের সেই সেই স্বপ্ন পূরণ হবে ইনশাআআল্লাহ।"}
                            />
                            <Option
                                title={6}
                                desc={"কাজ গুলো আপনি যেকোনো কাজের পাশাপাশি করবে পারবেন, এমনকি ফুলটাইম হিসেবেও করতে পারবেন।"}
                            />
                            <Option
                                title={7}
                                desc={"আমাদের কাজ গুলো পাওয়ার পর খুব দ্রুত কাজটি শিখে ইনকাম শুরু করতে পারবেন।"}
                            />
                            <Option
                                title={8}
                                desc={"যেকোনো বয়সের মানুষ কাজটি করতে পারবেন।"}
                            />
                        </div>
                        <div className="mt-5  flex flex-col gap-4 pt-5">
                            <h3 className='text-xl text-center  text-black mb-5'>
                            আপনি কাজ করলে ইনশাল্লাহ সফল হবেন।
                            </h3>
                            <Option
                                title={1}
                                desc={"আমাদের এখানে কাজ করলে আপনি সর্বনিম্ন ১০০ টাকা হলে বিকাশ/নগদ/রকেটে...উত্তোলন করতে পারবেন।✅"}
                            />
                            <Option
                                title={2}
                                desc={"আপনি রেজিস্ট্রেশন সম্পন্ন করে অ্যাকাউন্ট লগইন করার সাথে সাথে কাজ পাবেন। ✅"}
                            />
                            <Option
                                title={3}
                                desc={"জয়েন হওয়ার প্রথম দিন থেকে আপনি একটু একটু করে ইনকাম করা শুরু করতে পারবেন। ✅"}
                            />
                            <Option
                                title={4}
                                desc={"রেফার না করেও আপনি কাজ করে ইনকাম করতে পারবেন। 😊"}
                            />
                            <Option
                                title={5}
                                desc={" রেফার করলে সবচেয়ে বেশি ইনকাম করতে পারবেন এবং আজীবন ইনকাম করতে পারবেন। অর্থাৎ আজীবন আপনার ইনকামটা সচল থাকবে ✅😊"}
                            />
                            <Option
                                title={6}
                                desc={"  তাই দেরি না করে এখনি আমাদের ওয়েবসাইটে রেজিস্ট্রেশন করে জয়েন হয়ে কাজ শুরু করে দিবেন 😊✅"}
                            />
                        </div>
                    </div>

                </div>
            </div>

        </section>
    );
};

export default WhyShould;

const Option = ({ title, desc }) => {
    return (
        <div className='flex items-center justify-start gap-3'>
            <h3 className='lg:text-2xl text-xl font-bold text-black'>
                {title}
            </h3>
            <p className='lg:text-md text-sm text-primary'>
                {desc}
            </p>
        </div>
    )
}