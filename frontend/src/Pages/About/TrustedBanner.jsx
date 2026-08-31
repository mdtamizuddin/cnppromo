import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

const TrustedBanner = () => {
    // Array of mock avatar image URLs
    const avatars = [
        "https://i.pravatar.cc/100?img=11",
        "https://i.pravatar.cc/100?img=12",
        "https://i.pravatar.cc/100?img=33",
        "https://i.pravatar.cc/100?img=44",
        "https://i.pravatar.cc/100?img=15"
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-teal-50/70 rounded-[30px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-teal-100"
        >
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-3xl" />
                </div>
                <div>
                    <h3 className="text-[#0b0c2a] font-bold text-xl mb-1">Trusted by Thousands of Users</h3>
                    <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed max-w-[400px]">
                        হাজার হাজার সন্তুষ্ট সদস্যের বিশ্বাস এবং ভালোবাসায় CNP-PROMO আজ একটি নির্ভরযোগ্য নাম। আপনিও যোগ দিন আমাদের এই পরিবারের সাথে।
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white py-3 px-5 rounded-full shadow-sm border border-gray-100 shrink-0">
                <div className="flex -space-x-3">
                    {avatars.map((url, idx) => (
                        <img 
                            key={idx}
                            src={url} 
                            alt={`User ${idx + 1}`} 
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-xs font-bold z-10 relative">
                        10K+
                    </div>
                </div>
                <div className="text-gray-700 font-semibold text-[15px] pl-2">
                    Happy Members
                </div>
            </div>
        </motion.div>
    );
};

export default TrustedBanner;
