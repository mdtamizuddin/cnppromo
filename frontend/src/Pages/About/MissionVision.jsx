import React from 'react';
import { motion } from 'framer-motion';

const MissionVision = () => {
    return (
        <div className="mb-20">
            <div className="text-center mb-10">
                <h3 className="text-[#5a32fa] font-bold text-sm tracking-wider uppercase mb-2">OUR MISSION & VISION</h3>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b0c2a]">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Mission Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-indigo-50/50 rounded-[30px] p-8 md:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-indigo-100/50 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300"
                >
                    <div className="w-24 h-24 shrink-0 bg-white rounded-full flex items-center justify-center shadow-md">
                        {/* Target Icon CSS Illustration */}
                        <div className="relative w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full border-4 border-indigo-400 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
                            </div>
                            <div className="absolute top-0 right-0 w-8 h-1 bg-indigo-600 transform rotate-45 -translate-y-2 translate-x-2"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-600 transform rotate-45 -translate-y-4 translate-x-4"></div>
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="text-[#5a32fa] text-xl font-bold mb-3">Our Mission</h4>
                        <p className="text-gray-600 leading-relaxed text-[15px]">
                            আমাদের লক্ষ্য হলো এমন একটি প্ল্যাটফর্ম তৈরি করা যেখানে প্রত্যেকেই ঘরে বসে সহজ কাজ করে সম্মানজনক উপায়ে ইনকাম করতে পারে। আমরা চাই আর্থিক স্বাধীনতা সবার জন্য সহজলভ্য।
                        </p>
                    </div>
                </motion.div>

                {/* Vision Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-blue-50/50 rounded-[30px] p-8 md:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-blue-100/50 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300"
                >
                    <div className="w-24 h-24 shrink-0 bg-white rounded-full flex items-center justify-center shadow-md">
                        {/* Eye Icon CSS Illustration */}
                        <div className="relative w-16 h-10 rounded-[50%] border-[3px] border-blue-500 flex items-center justify-center bg-blue-50">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white relative -top-1 -right-1"></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="text-blue-600 text-xl font-bold mb-3">Our Vision</h4>
                        <p className="text-gray-600 leading-relaxed text-[15px]">
                            আমরা এমন একটি ভবিষ্যৎ গড়তে চাই যেখানে প্রযুক্তির মাধ্যমে সবাই নিজের দক্ষতা কাজে লাগিয়ে স্বাবলম্বী হতে পারে এবং আর্থিকভাবে সফল জীবন যাপন করতে পারে।
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MissionVision;
