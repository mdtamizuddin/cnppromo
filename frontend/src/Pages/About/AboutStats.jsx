import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { api } from '../../util/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserCheck, faCrown, faWallet, faChartLine } from '@fortawesome/free-solid-svg-icons';

const AboutStats = () => {
    const { data: statsData } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await api.get("/statistic");
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const stats = [
        {
            icon: faUsers,
            value: (statsData?.total || 0) + 60000,
            label: "Total Users",
            color: "text-purple-500",
            bg: "bg-purple-100"
        },
        {
            icon: faUserCheck,
            value: (statsData?.active || 0) + 10000,
            label: "Active Users",
            color: "text-blue-500",
            bg: "bg-blue-100"
        },
        {
            icon: faCrown,
            value: "20 +",
            label: "Trainer & Admin",
            color: "text-indigo-500",
            bg: "bg-indigo-100"
        },
        {
            icon: faWallet,
            value: ((statsData?.withdraw || 0) + 500000).toLocaleString(),
            label: "Complete Withdrawal",
            color: "text-green-500",
            bg: "bg-green-100"
        },
        {
            icon: faChartLine,
            value: "100%",
            label: "User Satisfaction",
            color: "text-orange-500",
            bg: "bg-orange-100"
        }
    ];

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 -mt-16 relative z-20 py-8 px-6 mb-16 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex flex-col items-center justify-center text-center group"
                    >
                        <div className={`w-14 h-14 ${stat.bg} rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:shadow-md duration-300`}>
                            <FontAwesomeIcon icon={stat.icon} className={`${stat.color} text-xl`} />
                        </div>
                        <h4 className="text-[#0b0c2a] text-2xl font-black mb-1">{stat.value.toLocaleString()}</h4>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>

                        {/* Custom divider except for last item on desktop */}
                        {idx !== stats.length - 1 && (
                            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gray-100 transform translate-x-[-50%]" style={{ right: `calc(${100 - ((idx + 1) * 20)}% - 15px)` }}></div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AboutStats;
