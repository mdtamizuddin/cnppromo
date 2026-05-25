import React from 'react';
import { Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


const AllWorks = () => {
    const [active, setActive] = React.useState(1)
    const naviagate = useNavigate()
    const categoryActive = useSearchParams()[0].get("category");
    useEffect(() => {
        if (categoryActive) {
            category?.map((data, i) => {
                if (data?.path === categoryActive) {
                    setActive(data?.id)
                }
            })
        }
        else {
            setActive(1)
        }
    }, [categoryActive])

    return (
        <div className='py-5  p-5'>
            <h1 className='text-3xl font-semibold text-center text-gray-900'>All Works</h1>
            <h2 className='mt-3 font-semibold text-base'>
                ♻️ধৈর্য, অধ্যাবসায় আর পরিশ্রম, এই তিনটি এক হলে সাফল্যকে আর থামানো যায় না।</h2>
            <div className="flex gap-4 mt-4 flex-wrap items-center">

                <ul className='flex flex-col gap-y-3'>
                    <li>
                        <Link to={'/works/category/all'}>
                            <Button type='primary'>
                                All Works
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/works/category/tiktop'}>
                            <Button type='primary'>
                                1️⃣  Tiktop free site
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/works/category/youtube'}>
                            <Button type='primary'>
                                2️⃣ ইউটিউব ভিডিও ভিউস।(Workercash)
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/works/category/facebook'}>
                            <Button type='primary'>
                                3️⃣ ফেসবুক পোস্ট (অটো জেনারেশন)
                            </Button>
                        </Link>
                    </li>

                    <li>
                        <Link to={'/works/category/likefollow'}>
                            <Button type='primary'>
                                4️⃣ Like follow (Getlike)
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/works/category/Payup-video-views'}>
                            <Button type='primary'>
                                5️⃣ Payup video views
                            </Button>
                        </Link>
                    </li>

                    <li>
                        <Link to={'/works/category/Bux-money'}>
                            <Button type='primary'>
                                6️⃣ Bux money
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/works/category/Vk surfing'}>
                            <Button type='primary'>
                                7️⃣ Vk surfing
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/works/category/IP web/Aviso'}>
                            <Button type='primary'>
                                8️⃣ IP web/Aviso
                            </Button>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AllWorks;

export const category = [
    {
        id: 1,
        name: "All Works",
        path: "",
        desc: "All Works"
    },
    {
        id: 2,
        name: "TikTop",
        path: "tiktop",
        desc: "Tiktop free sites"
    },
    {
        id: 3,
        name: "Youtube",
        path: "youtube",
        desc: "ইউটিউব ভিডিও ভিউস।(Workercash)"
    },
    {
        id: 4,
        name: "Facebook",
        path: "facebook",
        desc: "ফেসবুক পোস্ট (অটো জেনারেশন)"
    },
    {
        id: 5,
        name: "Like follow",
        path: "likefollow",
        desc: "Like follow (Getlike)"
    }, {
        id: 66,
        name: "Payup video views",
        path: "Payup-video-views",
        desc: "Payup video views"
    },
    {
        id: 6,
        name: "Bux money",
        path: "Bux-money",
        desc: "Bux money"
    }, {
        id: 7,
        name: "Vk surfing",
        path: "Vk surfing",
        desc: "Vk surfing"
    }, {
        id: 8,
        name: "IP web/Aviso",
        path: "IP web/Aviso",
        desc: "IP web/Aviso"
    }
]