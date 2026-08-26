import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUser, faArrowRight, faWallet } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const DashboardIllustration = () => (
    <div className="relative w-full max-w-[450px] aspect-square lg:aspect-auto lg:h-[500px] mx-auto bg-indigo-50/50 rounded-3xl overflow-hidden flex items-center justify-center p-6 border border-indigo-100 shadow-inner">
        {/* Decorative Blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100 rounded-full blur-2xl"></div>

        {/* Dashboard Card */}
        <div className="relative z-10 w-full bg-white rounded-2xl shadow-xl shadow-indigo-900/5 overflow-hidden flex flex-col border border-gray-100">
            {/* Header/Stats */}
            <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-50">
                <div>
                    <p className="text-[11px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">Total Balance</p>
                    <h4 className="text-xl font-bold text-gray-800">৳15,250.00</h4>
                </div>
                <div className="text-right">
                    <p className="text-[11px] text-gray-400 font-semibold mb-1 uppercase tracking-wider">Available Balance</p>
                    <h4 className="text-xl font-bold text-[#1b84ff]">৳10,250.00</h4>
                </div>
            </div>

            {/* Withdraw Button */}
            <div className="px-6 py-4 flex justify-end">
                <button className="bg-white border-2 border-indigo-100 text-[#5a32fa] text-xs font-bold px-5 py-2 rounded-lg shadow-sm">
                    Withdraw
                </button>
            </div>

            {/* Recent Earnings List */}
            <div className="px-6 pb-6 mt-2">
                <h5 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#5a32fa]"></div>
                    Recent Earning
                </h5>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <div className="w-4 h-2 bg-gray-300 rounded"></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="w-20 h-2 bg-gray-200 rounded"></div>
                                <div className="w-12 h-1.5 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-green-500">+৳200</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <div className="w-4 h-2 bg-gray-300 rounded"></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="w-24 h-2 bg-gray-200 rounded"></div>
                                <div className="w-16 h-1.5 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-green-500">+৳150</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <div className="w-4 h-2 bg-gray-300 rounded"></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="w-16 h-2 bg-gray-200 rounded"></div>
                                <div className="w-10 h-1.5 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-green-500">+৳100</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Abstract Person interacting */}
        <div className="absolute bottom-6 left-6 z-20 w-32 h-32 flex items-end">
            {/* Body */}
            <div className="w-24 h-24 bg-[#0b0c2a] rounded-tr-[40px] rounded-bl-xl rounded-tl-xl relative">
                {/* Head */}
                <div className="absolute -top-8 left-4 w-12 h-12 bg-[#1b84ff] rounded-full border-4 border-indigo-50"></div>
                {/* Arm reaching out */}
                <div className="absolute top-6 left-16 w-20 h-4 bg-[#0b0c2a] rounded-full rotate-[-15deg] origin-left"></div>
            </div>
        </div>
    </div>
);

const AboutUs = () => {
    const features = [
        "সহজ কাজ এবং দ্রুত ইনকাম",
        "দ্রুত পেমেন্ট প্রসেস",
        "100% নিরাপদ ও বিশ্বস্ত প্ল্যাটফর্ম",
        "২৪/৭ লাইভ সাপোর্ট",
        "রেফার করে ইনকাম করার সুযোগ"
    ];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side - Illustration */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="order-2 lg:order-1"
                >
                    <DashboardIllustration />
                </motion.div>

                {/* Right Side - Content */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="order-1 lg:order-2"
                >
                    <span className="text-[#5a32fa] font-bold text-xs tracking-widest uppercase block mb-2">ABOUT US</span>
                    <h2 className="text-2xl lg:text-[32px] font-bold text-[#0b0c2a] leading-tight mb-6">
                        কেন CNP-PROMO সেরা?
                    </h2>

                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 group">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-[#5a32fa] group-hover:text-white text-[#5a32fa] transition-colors duration-300">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-base" />
                                </div>
                                <span className="text-[15px] font-medium text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default AboutUs;
