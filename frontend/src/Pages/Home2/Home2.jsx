import { Card } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
const Home2 = () => {
    return (
        <div className='home2'>
            <div className='min-h-screen container mx-auto py-20 px-4 '>
                <h1 className='lg:text-4xl text-2xl text-T2 text-center mt-2 '>
                    ♻️ টাকা থাকলে পৃথিবী কেনা যায়,,, আর টাকা না থাকলে পৃথিবী চেনা যায়।
                </h1>
                <h2 className='lg:text-base text-sm text-center mt-5 text-black'>
                    ♻️ অতিরিক্ত টাকা একজন ব্যক্তিকে স্বার্থপর এবং অহংকারী করে তোলে। তাই CNP-Promo এর সাথে থেকে সৎভাবে ইনকাম করুন এবং অল্পতে সন্তুষ্ট থাকুন।
                </h2>
                <h2 className='lg:text-base text-sm text-center lg:mt-6 mt-5 text-black'>
                    ♻️ প্রয়োজনের অতিরিক্ত অর্থ, কোনো মানুষের মঙ্গল আনতে পারে না।
                </h2>

                <p className='text-sm mt-5'>
                    ➡️ ভালো ইনকাম করার জন্য আমরা  আপনাকে যে কাজগুলো সাজেস্ট করবো আপনি যদি সে কাজগুলো করেন তাহলে আমাদের CNP-Promo  virtual money makers থেকে অনেক পেমেন্ট পাবেন।🥰
                </p>
                <h5 className='mt-4 text-sm'>
                    ⁠  ⁠➡️ তাই আর দেরি না করে এখনই নিচের কাজের অপশনে ক্লিক করে আমাদের দেখানো কাজগুলোর মধ্যে যেকোনো একটা কাজ পছন্দ করে  সিলেক্ট করে কাজ শুরু করে দিন।
                </h5>
               
                <Card className='p-4 mt-5'>
                <h4 className='my-5'>কাজগুলো হলো ⬇️⬇️⬇️⬇️⬇️ </h4>
                    <ul className='flex flex-col gap-y-2'>
                        <li>
                            <Link to={'/works/category/tiktop'}>
                                1️⃣  Tiktop free site
                            </Link>
                        </li>
                        <li>
                            <Link to={'/works/category/youtube'}>
                                2️⃣ ইউটিউব ভিডিও ভিউস।(Workercash)
                            </Link>
                        </li>
                        <li>
                            <Link to={'/works/category/facebook'}>
                                3️⃣ ফেসবুক পোস্ট (অটো জেনারেশন)
                            </Link>
                        </li>

                        <li>
                            <Link to={'/works/category/likefollow'}>
                                4️⃣ Like follow (Getlike)
                            </Link>
                        </li>
                        <li>
                            <Link to={'/works/category/Payup-video-views'}>
                                5️⃣ Payup video views
                            </Link>
                        </li>

                        <li>
                            <Link to={'/works/category/Bux-money'}>
                                6️⃣ Bux money
                            </Link>
                        </li>
                        <li>
                            <Link to={'/works/category/Vk surfing'}>
                                7️⃣ Vk surfing
                            </Link>
                        </li>
                        <li>
                            <Link to={'/works/category/IP web/Aviso'}>
                                8️⃣ IP web/Aviso
                            </Link>
                        </li>
                    </ul>
                </Card>
                <Card className='p-4 lg:text-lg mt-2 text-gray-700'>
                    ♻️ প্রথম ৩টা সাইড গুলোতে কাজ অবশ্যই করবেন। <br />
                    ♻️ প্রথম ৩টাতে সবচেয়ে বেশি ইনকাম করা যায়।  <br />
                    ♻️ প্রথম ৩টা কাজ করার পরে আপনারা নিচের যে কোন কাজ পছন্দ করে ওগুলো ও করতে পারেন ♻️
                </Card>
                <h4 className='my-5'>
                    ⚠️ কেন আমরা আপনাকে এই কাজগুলো সাজেস্ট করলাম⁉️
                </h4>
                <Card className='p-4'>
                    <ol className='text-sm list-decimal pl-4'>
                        <li> এই কাজটা খুবই সহজ এবং ইনকাম বেশি।
                        </li>
                        <li>
                            অধিকাংশ পুরাতন মেম্বাররা এই কাজটা করে লাভবান হচ্ছে।
                        </li>
                        <li>
                            আমাদের এখানে লিড জেনারেশনের মাধ্যমে কাজ না করেও আজীবন ইনকাম করতে পারবেন।
                        </li>
                        <li>
                            আমাদের দেখানো ট্রিকস মেনে কাজ করলে আপনি ৩০০-৫০০ টাকা ইনকাম করতে পারবেন।
                        </li>
                    </ol>
                </Card>
            </div>

        </div>

    );
};

export default Home2;