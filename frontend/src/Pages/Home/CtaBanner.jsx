import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const CtaBanner = () => {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-[1140px] mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative bg-gradient-to-r from-[#0b0c2a] via-[#3a1b9e] to-[#5a32fa] rounded-3xl p-6 lg:p-10 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 z-10"
                >
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#5a32fa] rounded-full blur-3xl opacity-50 -z-10"></div>
                    
                    {/* Dashed curve line abstract */}
                    <svg className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none -z-10" xmlns="http://www.w3.org/2000/svg">
                        <path d="M-100 150 Q 200 300 500 100 T 1000 150" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10" />
                    </svg>

                    {/* Content */}
                    <div className="flex items-start md:items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <FontAwesomeIcon icon={faGift} className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-[26px] font-bold text-white mb-2 leading-tight">
                                আজই জয়েন করুন এবং ঘরে বসে <br className="hidden md:block" /> উপার্জন শুরু করুন!
                            </h2>
                            <p className="text-indigo-200 text-[14px] font-medium">
                                আপনার সফলতার যাত্রা শুরু হোক আমাদের সাথে!
                            </p>
                        </div>
                    </div>

                    {/* Button */}
                    <Link to="/register" className="shrink-0 w-full md:w-auto">
                        <button className="w-full bg-white text-[#5a32fa] hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-[16px] transition-all flex items-center justify-center gap-3 shadow-lg">
                            Join Now <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CtaBanner;
