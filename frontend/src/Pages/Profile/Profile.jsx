import React from 'react';
import { useSelector } from 'react-redux';
import Badge from './Badge';
import toast from 'react-hot-toast';
import ProfileContent from './ProfileContent';
import LevelInfo from './_Ui/LevelInfo';
import { Button } from '@material-tailwind/react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user , statistic} = useSelector(state => state.user)
    return (
        <div className='container  mx-auto mt-20 min-h-[77vh]'>
            <div className="flex flex-col lg:flex-row items-start">
                <div className='lg:w-[300px] w-full flex flex-col items-center'>
                    <div className={`w-[180px] h-[180px] bg-gray-300 rounded-full relative bg-cover bg-center bg-no-repeat ${user?.role === "admin" && "border-[4px] border-green-600"} mb-2`}
                        style={{
                            backgroundImage: `url(/avater.avif)`,
                        }}
                    >
                        <div className='absolute top-[20px] right-[20px]'>
                            <Badge number={user?.level} />
                        </div>
                    </div>

                    <h3 className='text-sm'>
                        {user?.name}
                    </h3>
                    <h3 className='text-sm mt-1'>
                        {user?.email}
                    </h3>
                    <div>
                        <h3 className='text-sm mt-1'>
                            User Id: {user?.username}
                            <button className='bg-gray-200 rounded px-2 text-xs py-1 ml-2'
                                onClick={() => {
                                    navigator.clipboard.writeText(user?.username)
                                    toast.success("Copied")
                                }
                                }
                            >
                                Copy
                            </button>
                        </h3>
                    </div>
                </div>
                <ProfileContent user={user} />
            </div>
            {/* <LevelInfo /> */}
       <section className='py-20 container mx-auto'>
                <div className='px-10 py-7 rounded-lg gradiant-bg flex items-center justify-between'>
                    <h2>
                        রেফার এর কাজ শুরু করার জন্য পাশে "Refer Work" লিখাতে কিলিক করুন
                    </h2>
                    <Link to="/refer">
                        <Button className='bg-white text-black px-10 py-4 rounded-3xl'>
                            Refer Work
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Profile;

