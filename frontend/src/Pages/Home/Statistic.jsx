import React from "react";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserCheck, faCrown, faWallet } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const Statistic = () => {
    // Fetch dynamic statistics data
    const { data } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const { data } = await api.get("/statistic");
            return data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const items = [
        {
            id: 1,
            title: 'Total Users',
            value: ((data?.total || 75490) + 60000).toLocaleString(),
            icon: faUsers,
            color: 'purple'
        },
        {
            id: 2,
            title: 'Active Users',
            value: ((data?.active || 58562) + 53000).toLocaleString(),
            icon: faUserCheck,
            color: 'blue'
        },
        {
            id: 3,
            title: 'Trainer & Admin',
            value: '10',
            icon: faCrown,
            color: 'indigo'
        },
        {
            id: 4,
            title: 'Complete Withdrawal',
            value: ((data?.total_withdraw || 734598) + 7000000).toLocaleString(),
            icon: faWallet,
            color: 'green'
        }
    ];

    const getColorClasses = (color) => {
        switch(color) {
            case 'purple': return 'bg-purple-100 text-purple-600';
            case 'blue': return 'bg-blue-100 text-blue-600';
            case 'indigo': return 'bg-indigo-100 text-indigo-600';
            case 'green': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="relative -mt-10 max-w-[1140px] mx-auto px-6 z-20">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {items.map((item, index) => (
                    <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                        className={`flex items-center gap-5 ${index !== 0 ? 'pt-6 sm:pt-0 sm:pl-8' : ''}`}
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${getColorClasses(item.color)}`}>
                            <FontAwesomeIcon icon={item.icon} className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#0b0c2a] leading-tight">
                                {item.value}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                {item.title}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Statistic;
