import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faClipboardList, faUsers, faWallet } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const HowItWorksSteps = () => {
    const steps = [
        {
            num: "01",
            title: "Create Account",
            desc: "Sign up with your details and verify your account to get started.",
            icon: faUserPlus,
            color: "purple",
            hex: "#5a32fa",
            lightHex: "#e8e4ff"
        },
        {
            num: "02",
            title: "Complete Tasks",
            desc: "Complete simple tasks such as offers, surveys, and promotions.",
            icon: faClipboardList,
            color: "blue",
            hex: "#1b84ff",
            lightHex: "#e0efff"
        },
        {
            num: "03",
            title: "Refer & Earn",
            desc: "Invite your friends and earn commissions from their earnings.",
            icon: faUsers,
            color: "green",
            hex: "#00c853",
            lightHex: "#e0f8e9"
        },
        {
            num: "04",
            title: "Withdraw Money",
            desc: "Request withdrawal and receive your money quickly and securely.",
            icon: faWallet,
            color: "orange",
            hex: "#ff9100",
            lightHex: "#fff0db"
        }
    ];

    return (
        <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10 px-4 md:px-0 mt-8">
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
                        <div className="bg-white rounded-[20px] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 border border-gray-100 w-full flex flex-col items-center text-center relative pt-12 pb-10 px-6 hover:-translate-y-1 transition-all duration-300">
                            
                            {/* Top Number Badge */}
                            <div 
                                className="absolute -top-4 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-white z-20"
                                style={{ color: step.hex, border: `2px solid ${step.lightHex}` }}
                            >
                                {step.num}
                            </div>

                            {/* Icon Circle */}
                            <div 
                                className="w-[64px] h-[64px] rounded-full flex items-center justify-center text-2xl text-white mb-6 transition-transform duration-300 hover:scale-105"
                                style={{ backgroundColor: step.lightHex, color: step.hex }}
                            >
                                <FontAwesomeIcon icon={step.icon} />
                            </div>

                            <h3 className="text-[17px] font-bold mb-3" style={{ color: step.hex }}>{step.title}</h3>
                            <p className="text-[13px] text-gray-500 font-medium leading-[1.6]">
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
                                className="hidden lg:flex absolute top-1/2 -right-8 transform -translate-y-1/2 w-6 items-center z-0"
                            >
                                <svg width="100%" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 12H36" stroke="#5a32fa" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/>
                                    <path d="M30 6L38 12L30 18" stroke="#5a32fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorksSteps;
