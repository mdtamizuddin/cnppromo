import React from 'react';
import { motion } from 'framer-motion';

const HowItWorksHero = () => {
    return (
        <div className="relative bg-white pt-16 pb-20 border-b border-gray-100 mb-16 shadow-sm overflow-hidden">
            <div className="max-w-[1140px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
                
                {/* Left Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 text-center md:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/60 text-[#5a32fa] text-xs font-bold tracking-wide mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#5a32fa] animate-pulse"></span>
                        কিভাবে কাজ করে
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold mb-6 leading-tight tracking-tight text-[#0b0c2a]">
                        কিভাবে <span className="text-[#5a32fa]">CNP-PROMO</span> কাজ করে?
                    </h1>

                    <p className="text-gray-600 leading-relaxed text-[15px] mb-4 max-w-[500px] mx-auto md:mx-0 font-medium">
                        CNP-PROMO একটি নির্ভরযোগ্য প্ল্যাটফর্ম যেখানে আপনি সহজ টাস্ক সম্পন্ন করে, বন্ধুদের রেফার করে এবং আমাদের কমিউনিটির সাথে যুক্ত হয়ে ঘরে বসেই রিয়েল ইনকাম করতে পারবেন।
                    </p>
                    <p className="text-gray-600 leading-relaxed text-[15px] max-w-[500px] mx-auto md:mx-0 font-medium">
                        নিচের সহজ ধাপগুলো অনুসরণ করুন এবং আজই আপনার আয়ের যাত্রা শুরু করুন!
                    </p>
                </motion.div>

                {/* Right Illustration */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 w-full flex justify-center relative"
                >
                    <div className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px]">
                        <div className="absolute inset-0 bg-[#5a32fa] rounded-full opacity-10 blur-xl"></div>
                        <div className="absolute inset-4 bg-indigo-500 rounded-full opacity-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                           <div className="w-40 h-56 bg-[#1a1b41] rounded-3xl border-4 border-[#2d2e5a] shadow-xl relative overflow-hidden z-10 flex flex-col items-center pt-6">
                                <div className="w-16 h-1.5 bg-gray-600 rounded-full absolute top-2.5"></div>
                                <div className="w-24 h-16 bg-green-500/20 rounded-lg mt-3 border border-green-500/30 flex items-center justify-center">
                                    <span className="text-green-400 font-bold text-xl">৳</span>
                                </div>
                                <div className="w-24 h-8 bg-indigo-500/20 rounded-lg mt-3 border border-indigo-500/30"></div>
                           </div>
                           
                           {/* Floating Wallet */}
                           <div className="absolute bottom-10 z-20 w-48 h-32 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-900/30 transform rotate-[-5deg] border border-purple-400/30">
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-10 bg-amber-400 rounded-md shadow-inner flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                </div>
                                <div className="absolute top-2 left-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-md border-2 border-yellow-300 transform -translate-y-6 -translate-x-2">
                                     <span className="text-yellow-700 font-bold text-sm">৳</span>
                                </div>
                                <div className="absolute top-8 left-6 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-md border-2 border-yellow-300 transform -translate-y-6 -translate-x-2">
                                     <span className="text-yellow-700 font-bold text-sm">৳</span>
                                </div>
                           </div>
                           
                           {/* Floating elements */}
                           <div className="absolute top-8 left-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-md shadow-purple-500/30 animate-bounce">
                                <span className="text-white font-bold text-sm">৳</span>
                           </div>
                           <div className="absolute top-0 right-10 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30 animate-pulse">
                                <span className="text-white font-bold text-xs">৳</span>
                           </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HowItWorksHero;
