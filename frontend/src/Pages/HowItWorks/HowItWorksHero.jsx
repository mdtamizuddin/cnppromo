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
                    <h3 className="text-[#5a32fa] font-bold text-sm tracking-wider uppercase mb-2">HOW IT WORKS</h3>
                    <h1 className="text-4xl md:text-[44px] font-extrabold mb-6 leading-tight tracking-tight text-[#0b0c2a]">
                        How Does <span className="text-[#5a32fa]">CNP-PROMO</span> Work?
                    </h1>
                    <p className="text-gray-600 leading-relaxed text-[15px] mb-4 max-w-[500px] mx-auto md:mx-0 font-medium">
                        CNP-PROMO is a trusted platform where you can earn real money online by completing simple tasks, referring others and growing with our community.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-[15px] max-w-[500px] mx-auto md:mx-0 font-medium">
                        Follow the simple steps below and start your earning journey today!
                    </p>
                </motion.div>

                {/* Right Illustration (Reusing CSS from About page but scaled appropriately) */}
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
