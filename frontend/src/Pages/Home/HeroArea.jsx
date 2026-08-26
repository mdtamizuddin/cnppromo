import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faPlayCircle, faShieldHalved, faBolt, faHeadset, faBangladeshiTakaSign } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const HeroIllustration = () => (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[#5a32fa]/10 rounded-full blur-3xl scale-90"></div>
        <div className="absolute bottom-10 -left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
        <div className="absolute top-10 -right-4 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
        
        {/* Base Platform */}
        <div className="absolute bottom-12 w-[80%] h-[40px] bg-indigo-900/10 rounded-[100%] shadow-[0_20px_40px_rgba(90,50,250,0.2)]"></div>
        <div className="absolute bottom-14 w-[75%] h-[35px] bg-[#5a32fa] rounded-[100%] border-4 border-[#6e48ff] z-10"></div>
        
        {/* 3D Phone Mockup */}
        <div className="absolute z-20 w-[180px] h-[360px] bg-[#0b0c2a] rounded-[30px] border-8 border-gray-800 shadow-2xl rotate-[5deg] right-12 bottom-20 flex flex-col items-center pt-3 pb-6 px-2 overflow-hidden">
            {/* Notch */}
            <div className="w-20 h-5 bg-gray-800 rounded-b-xl absolute top-0 z-30"></div>
            {/* Screen */}
            <div className="w-full h-full bg-gradient-to-b from-[#5a32fa] to-[#9881ff] rounded-[18px] relative overflow-hidden">
                <div className="absolute top-10 left-4 right-4 h-16 bg-white/20 rounded-xl backdrop-blur-sm"></div>
                <div className="absolute top-32 left-4 right-4 h-10 bg-white/20 rounded-xl backdrop-blur-sm"></div>
                <div className="absolute top-48 left-4 right-4 h-10 bg-white/20 rounded-xl backdrop-blur-sm"></div>
            </div>
        </div>

        {/* Wallet Mockup */}
        <div className="absolute z-30 w-[220px] h-[160px] bg-[#5a32fa] rounded-2xl shadow-2xl shadow-indigo-500/40 left-8 bottom-24 overflow-hidden border-b-[8px] border-[#4b26e0]">
            <div className="absolute top-0 w-full h-[60px] bg-[#6e48ff] rounded-t-2xl shadow-inner flex items-center justify-center border-b-2 border-[#8161ff]">
                <div className="w-16 h-4 bg-[#8161ff] rounded-full"></div>
            </div>
            
            {/* Money sticking out */}
            <div className="absolute -top-10 left-4 w-16 h-24 bg-green-400 rounded-md rotate-[-15deg] shadow-lg border-2 border-green-300 flex items-center justify-center opacity-90 z-0">
                <FontAwesomeIcon icon={faBangladeshiTakaSign} className="text-green-700/50 text-3xl" />
            </div>
            <div className="absolute -top-16 left-20 w-20 h-28 bg-green-500 rounded-md rotate-[5deg] shadow-lg border-2 border-green-300 flex items-center justify-center z-10">
                <div className="w-10 h-10 rounded-full border-2 border-green-300 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBangladeshiTakaSign} className="text-green-200 text-xl" />
                </div>
            </div>
            <div className="absolute -top-6 right-6 w-16 h-20 bg-green-400 rounded-md rotate-[20deg] shadow-lg border-2 border-green-300 flex items-center justify-center z-0 opacity-90">
                <FontAwesomeIcon icon={faBangladeshiTakaSign} className="text-green-700/50 text-2xl" />
            </div>
            
            {/* Wallet Flap Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#5a32fa] to-[#4b26e0] mt-[45px] z-20 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                {/* Button/Lock */}
                <div className="w-12 h-12 bg-[#3617b0] rounded-full shadow-inner flex items-center justify-center mb-8 border-2 border-[#4b26e0]">
                    <div className="w-4 h-4 bg-gray-200 rounded-full shadow-sm"></div>
                </div>
            </div>
        </div>
        
        {/* Coins */}
        <div className="absolute z-40 w-14 h-14 bg-yellow-400 rounded-full left-12 bottom-20 shadow-lg border-b-4 border-yellow-600 flex items-center justify-center text-yellow-600 font-bold text-xl">৳</div>
        <div className="absolute z-40 w-12 h-12 bg-yellow-400 rounded-full left-24 bottom-14 shadow-lg border-b-4 border-yellow-600 flex items-center justify-center text-yellow-600 font-bold text-lg">৳</div>
        
        {/* Floating Badges */}
        <div className="absolute z-40 w-16 h-16 bg-[#5a32fa] rounded-full left-4 top-20 shadow-lg shadow-indigo-500/40 border-4 border-[#f8f9ff] flex items-center justify-center text-white text-2xl animate-bounce" style={{animationDuration: '3s'}}>
            ৳
        </div>
        <div className="absolute z-40 w-12 h-12 bg-[#0b0c2a] rounded-full right-16 top-10 shadow-lg border-2 border-[#f8f9ff] flex items-center justify-center text-white text-xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
            ৳
        </div>
    </div>
);

const HeroArea = () => {
    return (
        <div className="bg-[#f8f9ff] overflow-hidden pt-8 pb-12">
            <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[60vh]">
                
                {/* Left Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col gap-6 z-10"
                >
                    <div className="space-y-4">
                        <h1 className="text-3xl lg:text-[42px] font-bold leading-[1.2] tracking-tight text-[#0b0c2a]">
                            <span className="text-[#5a32fa] block mb-2">CNP-PROMO</span>
                            থেকে টাকা আয় করুন !!!
                        </h1>
                        <p className="text-[15px] text-gray-600 leading-relaxed max-w-[500px] font-medium">
                            বাংলাদেশের সেরা অনলাইন ইনকাম প্ল্যাটফর্ম। ঘরে বসে সহজ কাজ করে প্রতিদিন ইনকাম করুন এবং নিজের ভবিষ্যৎকে আরও সমৃদ্ধ করুন।
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 mt-2">
                        <Link to="/register">
                            <button className="bg-[#5a32fa] hover:bg-[#4b26e0] text-white px-8 py-3.5 rounded-full font-bold text-[16px] transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-3">
                                Join Now <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </Link>
                        <Link to="/how-it-works">
                            <button className="bg-white border-2 border-gray-200 hover:border-[#5a32fa] text-gray-700 hover:text-[#5a32fa] px-8 py-3.5 rounded-full font-bold text-[16px] transition-all flex items-center gap-3">
                                Learn More <FontAwesomeIcon icon={faPlayCircle} className="text-lg" />
                            </button>
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-4 pt-6 border-t border-gray-200/60">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                            </div>
                            <span className="text-[15px] font-semibold text-gray-700">100% Trusted</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                <FontAwesomeIcon icon={faBolt} className="text-sm" />
                            </div>
                            <span className="text-[15px] font-semibold text-gray-700">Fast Payment</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                <FontAwesomeIcon icon={faHeadset} className="text-sm" />
                            </div>
                            <span className="text-[15px] font-semibold text-gray-700">24/7 Support</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Illustration */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="relative flex justify-center lg:justify-end"
                >
                    <HeroIllustration />
                </motion.div>
                
            </div>
        </div>
    );
};

export default HeroArea;

