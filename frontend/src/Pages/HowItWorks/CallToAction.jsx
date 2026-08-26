import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const CallToAction = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#0b0c2a] via-[#1a1b41] to-[#2d2e5a] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-900/20 border border-[#3e3f70]"
        >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                
                {/* Gift Box CSS Illustration */}
                <div className="w-24 h-24 shrink-0 relative flex items-center justify-center group">
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl opacity-20 filter blur-xl group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative w-20 h-20">
                        {/* Box Lid */}
                        <div className="absolute top-0 left-1 right-1 h-6 bg-[#5a32fa] rounded-sm z-20 border border-indigo-400/30 shadow-md"></div>
                        {/* Box Body */}
                        <div className="absolute top-6 left-2 right-2 bottom-0 bg-[#4b26e0] rounded-b-md z-10 border border-indigo-500/30 shadow-inner"></div>
                        {/* Ribbon Vertical */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-amber-400 z-30 shadow-sm"></div>
                        {/* Ribbon Horizontal */}
                        <div className="absolute top-10 left-2 right-2 h-3 bg-amber-400 z-30 shadow-sm"></div>
                        {/* Bow */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex z-40">
                            <div className="w-5 h-5 rounded-full border-4 border-amber-400 mr-[-6px]"></div>
                            <div className="w-5 h-5 rounded-full border-4 border-amber-400 ml-[-6px]"></div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">Start Your Earning Journey Today!</h2>
                    <p className="text-gray-400 text-[15px] max-w-[450px]">
                        Join thousands of smart earners and make money online with CNP-PROMO.
                    </p>
                </div>
            </div>

            <Link 
                to="/register" 
                className="bg-white text-[#0b0c2a] hover:text-[#5a32fa] font-bold text-[17px] py-3.5 px-8 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md shrink-0"
            >
                Join Now
                <FontAwesomeIcon icon={faArrowRight} />
            </Link>
        </motion.div>
    );
};

export default CallToAction;
