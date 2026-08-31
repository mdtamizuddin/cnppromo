import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const ReferralLevels = () => {
    const { settings } = useSelector(state => state.user);

    const levels = [
        {
            gen: "১",
            taka: settings?.ref_comm?.gen1 || 30,
            label: "সর্বোচ্চ আয়ের লেভেল",
            color: "text-green-500",
            borderColor: "border-green-500",
            lightBg: "bg-green-50"
        },
        {
            gen: "২",
            taka: settings?.ref_comm?.gen2 || 8,
            label: "দ্বিতীয় লেভেল কমিশন",
            color: "text-blue-500",
            borderColor: "border-blue-500",
            lightBg: "bg-blue-50"
        },
        {
            gen: "৩",
            taka: settings?.ref_comm?.gen3 || 6,
            label: "তৃতীয় লেভেল কমিশন",
            color: "text-pink-500",
            borderColor: "border-pink-500",
            lightBg: "bg-pink-50"
        },
        {
            gen: "৪",
            taka: settings?.ref_comm?.gen4 || 5,
            label: "চতুর্থ লেভেল কমিশন",
            color: "text-yellow-500",
            borderColor: "border-yellow-500",
            lightBg: "bg-yellow-50"
        },
        {
            gen: "৫",
            taka: settings?.ref_comm?.gen5 || 2,
            label: "পঞ্চম লেভেল কমিশন",
            color: "text-purple-500",
            borderColor: "border-purple-500",
            lightBg: "bg-purple-50"
        },
        {
            gen: "৬",
            taka: settings?.ref_comm?.gen6 || 0,
            label: "ষষ্ঠ লেভেল কমিশন",
            color: "text-red-500",
            borderColor: "border-red-500",
            lightBg: "bg-red-50"
        }
    ];

    return (
        <section className="mb-20">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-teal-200/60 text-primary text-xs font-bold tracking-wide mb-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    আপনার রেফারেল জেনারেশনসমূহ
                </div>
                <h2 className="text-3xl font-extrabold text-[#0b0c2a] mb-4">
                    জেনারেশনভিত্তিক রেফারেল কমিশন
                </h2>
                <p className="text-gray-500 font-medium text-[15px] max-w-[600px] mx-auto leading-relaxed">
                    আপনি আপনার রেফারেল নেটওয়ার্কের একাধিক লেভেল থেকে কমিশন লাভ করবেন। আপনার নেটওয়ার্ক যত গভীর হবে, প্রতিটি জেনারেশন থেকে আপনার আয় তত বাড়বে।
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {levels.map((level, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className={`flex items-center gap-2 mb-6 ${level.color}`}>
                            <FontAwesomeIcon icon={faUsers} />
                            <span className="font-bold text-[17px] text-[#0b0c2a]">জেনারেশন {level.gen}</span>
                        </div>

                        {/* Circular Progress Design */}
                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                            {/* Background circle */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                                <circle 
                                    cx="50" cy="50" r="45" 
                                    fill="none" 
                                    className={`stroke-current ${level.color}`} 
                                    strokeWidth="4" 
                                    strokeDasharray="283" 
                                    strokeDashoffset={283 - (283 * (1 - (idx * 0.15)))} 
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-black text-[#0b0c2a] leading-none">৳{level.taka}</span>
                                <span className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-widest">টাকা</span>
                            </div>
                        </div>

                        <div className={`w-full py-2.5 rounded-xl text-center text-sm font-bold ${level.lightBg} ${level.color}`}>
                            {level.label}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ReferralLevels;
