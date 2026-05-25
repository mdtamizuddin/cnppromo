import React from 'react';
import InfoCard from './InfoCard';
import { useSelector } from 'react-redux';

const LevelInfo = () => {
    const {settings} = useSelector(state=> state.user)
    return (
        <div className='mt-16'>
            <div className='container mx-auto'>
                <h2 className='text-3xl font-bold text-center'>
                    Level Info
                </h2>
                <div className="text-center mt-2"><span className="text-red-600 mr-1 text-xs font-semibold  ">অভিনন্দন!</span><span className="text-neutral-800 text-xs font-semibold  "> আপনি জয়েন হওয়ার শুরুতে দুইটি কাজ পেয়েছেন। পরবর্তীতে যে কাজগুলো আছে?</span></div>
            </div>
            <div className="grid lg:grid-cols-3 mt-7 gap-5 p-5 justify-items-center">
                <InfoCard
                    level={1}
                    option={"0 জন রেফার"}
                    option2={`প্রতি রেফারে পাবেন ৩০ টাকা কমিশন`}
                />
                <InfoCard level={2} option={"৮০ জন রেফার"}
                    option2={`প্রতি রেফারে পাবেন ৩৫ টাকা কমিশন`}
                />
                <InfoCard level={3} option={"১৬০ জন রেফার"}
                    option2={`প্রতি রেফারে পাবেন ৪০ টাকা কমিশন`}
                />
            </div>
        </div>
    );
};

export default LevelInfo;