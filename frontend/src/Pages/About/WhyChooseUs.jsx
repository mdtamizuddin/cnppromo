import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const WhyChooseUs = () => {
    const reasons = [
        "সহজ কাজ এবং দ্রুত ইনকাম",
        "ফাস্ট পেমেন্ট প্রসেস",
        "স্বচ্ছ ও নিরাপদ প্ল্যাটফর্ম",
        "প্রতিনিয়ত আপডেট এবং নতুন সুযোগ",
        "অভিজ্ঞ সাপোর্ট টিম"
    ];

    return (
        <div className="mb-20">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
                {/* Left Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 w-full"
                >
                    <h3 className="text-[#5a32fa] font-bold text-sm tracking-wider uppercase mb-2">WHY CHOOSE US</h3>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b0c2a] mb-8">আমরা কেন আলাদা?</h2>

                    <div className="space-y-4">
                        {reasons.map((reason, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <FontAwesomeIcon icon={faCircleCheck} className="text-[#5a32fa] text-xl" />
                                <span className="text-[#0b0c2a] font-semibold text-[17px]">{reason}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Image */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex-1 w-full"
                >
                    <div className="relative rounded-[30px] overflow-hidden shadow-2xl group">
                        {/* Image Placeholder - fallback to a gradient if image fails to load */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-[#5a32fa] -z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80" 
                            alt="Team Collaboration" 
                            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default WhyChooseUs;
