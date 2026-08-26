import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faLock, faHeadset, faWallet } from '@fortawesome/free-solid-svg-icons';

const AboutHero = () => {
    return (
        <div className="relative bg-[#0b0c2a] pt-16 pb-32 overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#5a32fa] rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-30"></div>

            <div className="max-w-[1140px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
                {/* Left Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 text-center md:text-left text-white"
                >
                    <h3 className="text-[#5a32fa] font-bold text-sm tracking-wider uppercase mb-2">ABOUT US</h3>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-white">
                        About <span className="text-[#724ff7]">CNP-PROMO</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-gray-200 mb-6">
                        বিশ্বাস, স্বচ্ছতা এবং আপনার সফলতাই আমাদের লক্ষ্য
                    </p>
                    <p className="text-gray-400 leading-relaxed text-[15px] mb-10 max-w-[550px] mx-auto md:mx-0">
                        CNP-PROMO একটি বাংলাদেশী অনলাইন ইনকাম প্ল্যাটফর্ম যেখানে আমরা আপনাদের জন্য নিয়ে এসেছি সহজ উপায়ে ইনকাম করার সুযোগ। আমাদের লক্ষ্য হলো প্রত্যেক সদস্যকে একটি নিরাপদ, স্বচ্ছ এবং নির্ভরযোগ্য পরিবেশে কাজ করার সুযোগ করে দেওয়া।
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                        {/* Badges */}
                        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-blue-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">100% Trusted</div>
                                <div className="text-xs text-gray-400">আপনার বিশ্বস্ততায় আমরা অঙ্গীকারবদ্ধ</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faLock} className="text-green-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">Secure & Safe</div>
                                <div className="text-xs text-gray-400">নিরাপদ লেনদেনে আমাদের প্রতিশ্রুতি</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex justify-center md:justify-start">
                        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/5 inline-flex">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faHeadset} className="text-purple-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">24/7 Support</div>
                                <div className="text-xs text-gray-400">সেবা দিতে আমরা সবসময় প্রস্তুত</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Illustration */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 w-full flex justify-center relative"
                >
                    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                        {/* 3D styling elements instead of image */}
                        <div className="absolute inset-0 bg-[#5a32fa] rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute inset-4 bg-indigo-500 rounded-full opacity-30"></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                           <div className="w-48 h-64 bg-[#1a1b41] rounded-[2rem] border-4 border-[#2d2e5a] shadow-2xl relative overflow-hidden z-10 flex flex-col items-center pt-8">
                                <div className="w-20 h-2 bg-gray-600 rounded-full absolute top-3"></div>
                                <div className="w-32 h-20 bg-green-500/20 rounded-xl mt-4 border border-green-500/30 flex items-center justify-center">
                                    <span className="text-green-400 font-bold text-2xl">৳</span>
                                </div>
                                <div className="w-32 h-10 bg-indigo-500/20 rounded-xl mt-4 border border-indigo-500/30"></div>
                           </div>
                           
                           {/* Floating Wallet */}
                           <div className="absolute bottom-12 z-20 w-56 h-36 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-900/50 transform rotate-[-5deg] border border-purple-400/30">
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-12 bg-amber-400 rounded-lg shadow-inner flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                                </div>
                                <div className="absolute top-4 left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300 transform -translate-y-8 -translate-x-4">
                                     <span className="text-yellow-700 font-bold">৳</span>
                                </div>
                                <div className="absolute top-12 left-8 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300 transform -translate-y-8 -translate-x-4">
                                     <span className="text-yellow-700 font-bold">৳</span>
                                </div>
                           </div>
                           
                           {/* Floating elements */}
                           <div className="absolute top-12 left-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce">
                                <span className="text-white font-bold">৳</span>
                           </div>
                           <div className="absolute top-0 right-12 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                                <span className="text-white font-bold">৳</span>
                           </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutHero;
