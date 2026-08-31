import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faBullhorn, faWallet } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            num: "01",
            title: "রেজিস্ট্রেশন করুন",
            desc: "সহজেই আমাদের ওয়েবসাইটে রেজিস্ট্রেশন করে একাউন্ট খুলুন।",
            icon: faUserPlus,
            color: "teal",
            hex: "#0D9488",
            lightHex: "#e6f8f5"
        },
        {
            num: "02",
            title: "কাজ সম্পন্ন করুন",
            desc: "দৈনিক কাজ সম্পন্ন করুন এবং আপনার একাউন্ট ব্যালেন্স বাড়তে থাকবে।",
            icon: faBullhorn,
            color: "blue",
            hex: "#0284c7",
            lightHex: "#e0efff"
        },
        {
            num: "03",
            title: "টাকা উত্তোলন করুন",
            desc: "আপনার ইনকামকৃত টাকা সহজে বিকাশ, নগদ বা অন্য মাধ্যমে উত্তোলন করুন।",
            icon: faWallet,
            color: "amber",
            hex: "#f59e0b",
            lightHex: "#fef3c7"
        }
    ];

    return (
        <section className="py-16 bg-[#f9fafe] relative">
            <div className="max-w-[1140px] mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold text-[13px] tracking-widest uppercase block mb-3">HOW IT WORKS</span>
                    <h2 className="text-2xl md:text-[32px] font-bold text-[#0b0c2a]">কিভাবে কাজ করবেন?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 relative z-10 px-4 md:px-0">
                    {steps.map((step, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                            className="relative flex flex-col items-center"
                        >
                            
                            {/* Card */}
                            <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 w-full flex flex-col items-center text-center relative pt-12 pb-10 px-6 hover:-translate-y-1 transition-transform duration-300">
                                
                                {/* Top Number Badge */}
                                <div 
                                    className="absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-white z-20"
                                    style={{ color: step.hex, border: `2px solid ${step.lightHex}` }}
                                >
                                    {step.num}
                                </div>

                                {/* Icon Circle */}
                                <div 
                                    className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl text-white mb-6 transition-transform duration-300 hover:scale-105"
                                    style={{ backgroundColor: step.hex, boxShadow: `0 8px 24px ${step.hex}40` }}
                                >
                                    <FontAwesomeIcon icon={step.icon} />
                                </div>

                                <h3 className="text-[19px] font-bold text-[#0b0c2a] mb-3">{step.title}</h3>
                                <p className="text-[14px] text-gray-500 font-medium leading-[1.6]">
                                    {step.desc}
                                </p>
                            </div>
                            
                            {/* Dotted Arrow pointing to next card (Hidden on mobile) */}
                            {index !== steps.length - 1 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.6 + (index * 0.2) }}
                                    className="hidden md:flex absolute top-1/2 -right-8 lg:-right-10 transform -translate-y-1/2 w-6 lg:w-8 items-center z-0"
                                >
                                    <svg width="100%" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 12H36" stroke="#0D9488" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/>
                                        <path d="M30 6L38 12L30 18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </motion.div>
                            )}

                            {/* Mobile Arrow (Hidden on desktop) */}
                            {index !== steps.length - 1 && (
                                <div className="md:hidden flex justify-center my-6">
                                    <svg width="24" height="40" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 0V36" stroke="#0D9488" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/>
                                        <path d="M6 30L12 38L18 30" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
