import React, { useState } from 'react';
import { Card } from '@material-tailwind/react';
import { api } from '../../../util/axios';
import Cookie from 'js-cookie';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { 
    faLock, 
    faEye, 
    faEyeSlash, 
    faRightToBracket, 
    faWallet, 
    faShieldHalved, 
    faChartSimple, 
    faUsers, 
    faHeadset, 
    faUser 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const LockIllustration = () => (
  <div className="relative w-48 h-40 flex items-center justify-center mb-6 mt-2 mx-auto">
    {/* Abstract Background Elements */}
    <div className="absolute right-4 top-2 w-20 h-20 bg-indigo-100/60 rounded-full blur-md"></div>
    <div className="absolute left-8 bottom-6 w-16 h-16 bg-purple-100/60 rounded-full blur-md"></div>
    <div className="absolute w-32 h-24 bg-indigo-50/80 rounded-[40%] blur-sm rotate-12"></div>
    
    {/* Small decorative dots */}
    <div className="absolute top-4 left-6 flex gap-1 flex-wrap w-8 opacity-40">
        {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#5a32fa] rounded-full"></div>)}
    </div>

    {/* The Lock Body */}
    <div className="relative z-10 flex flex-col items-center">
      {/* Shackle */}
      <div className="w-14 h-12 border-8 border-[#5a32fa] rounded-t-3xl border-b-0 relative top-1 z-0"></div>
      {/* Body */}
      <div className="w-24 h-16 bg-[#5a32fa] rounded-t-xl rounded-b-lg relative flex flex-col items-center justify-between overflow-hidden shadow-lg z-10">
        <div className="flex-1 flex flex-col items-center justify-center w-full relative -top-1">
          {/* Keyhole */}
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-1.5 h-3 bg-white rounded-b-sm -mt-0.5"></div>
        </div>
        {/* Bottom edge dots */}
        <div className="w-full h-[18px] bg-gray-100 flex items-center justify-center gap-[7px]">
           <div className="w-1.5 h-1.5 bg-[#5a32fa] rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-[#5a32fa] rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-[#5a32fa] rounded-full"></div>
           <div className="w-1.5 h-1.5 bg-[#5a32fa] rounded-full"></div>
        </div>
      </div>
    </div>
    
    {/* User Badge */}
    <div className="absolute bottom-3 left-7 z-20 w-[42px] h-[42px] bg-[#5a32fa] rounded-full border-[3px] border-white flex items-center justify-center shadow-md">
      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
    </div>
  </div>
);

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch dynamic statistics
    const { data: statsData } = useQuery({
        queryKey: "statistic",
        queryFn: async () => {
            const res = await api.get("/statistic");
            return res.data;
        }
    });

    // Calculate formatted values similar to Home/Statistic.jsx
    const totalUsers = ((statsData?.total || 75490) + 60000).toLocaleString() + "+";
    const totalPayments = ((statsData?.total_withdraw || 734598) + 7000000).toLocaleString() + "+";

    const updateState = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const SubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/user/login', data);
            setError("");
            Cookie.set("token-you", res.data.token, { expires: 30 });
            toast.success("Login Successful");
            window.location.href = "/welcome";
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafc] flex flex-col items-center py-10 px-4 font-sans">
            <div className="w-full max-w-[1050px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-10">
                
                {/* Left Column - Login Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white border border-gray-100">
                    <LockIllustration />
                    
                    <h2 className="text-[28px] font-bold text-center text-gray-900 mb-1.5 tracking-wide">লগ ইন করুন</h2>
                    <p className="text-[15px] text-center text-gray-500 mb-8">আপনার একাউন্ট প্রবেশ করতে আপনার তথ্য দিন</p>
                    
                    <form onSubmit={SubmitHandler} className="space-y-5">
                        {/* Email Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-[15px]" />
                            </div>
                            <input 
                                type="email" 
                                name="email"
                                value={data.email}
                                onChange={updateState}
                                placeholder="ইমেইল অ্যাড্রেস লিখুন" 
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-[14px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50/50" 
                            />
                        </div>
                        
                        {/* Password Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faLock} className="text-gray-400 text-[15px]" />
                            </div>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                name="password"
                                value={data.password}
                                onChange={updateState}
                                placeholder="পাসওয়ার্ড লিখুন" 
                                required
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-[14px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50/50" 
                            />
                            <div 
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-400 hover:text-gray-600 transition-colors text-[14px]" />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        {/* Remember me & Forgot Password */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center text-[14px] text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                                <input type="checkbox" className="mr-2.5 rounded border-gray-300 w-4 h-4 text-[#5a32fa] focus:ring-[#5a32fa]" />
                                আমাকে মনে রাখুন
                            </label>
                            <Link to="/forgot-password" className="text-[14px] text-[#5a32fa] font-medium hover:underline tracking-wide">
                                পাসওয়ার্ড ভুলে গেছেন?
                            </Link>
                        </div>

                        {/* Submit button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#5a32fa] text-white py-3.5 rounded-xl font-medium text-[17px] mt-4 flex items-center justify-center gap-2.5 hover:bg-[#4b26e0] transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-70"
                        >
                            <FontAwesomeIcon icon={faRightToBracket} className="text-lg" /> 
                            {loading ? "অপেক্ষা করুন..." : "লগ ইন করো"}
                        </button>

                        {/* Or Divider */}
                        <div className="relative flex items-center py-5">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-500 text-[14px] font-medium">অথবা</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                        
                        {/* Register Link */}
                        <div className="text-center text-[15px] text-gray-600">
                            এখনো একাউন্ট নেই? <Link to="/register" className="text-[#5a32fa] font-semibold hover:underline tracking-wide ml-1">রেজিস্টার করুন</Link>
                        </div>
                    </form>
                </Card>
                </motion.div>

                {/* Right Column - Features */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="pl-0 lg:pl-10 space-y-8"
                >
                    <h2 className="text-[22px] font-bold text-[#0b0c2a] mb-10 tracking-wide">CNP-PROMO-তে যোগ দিলে আপনি পাবেন</h2>
                    
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-full bg-green-100/70 flex items-center justify-center shrink-0 shadow-sm border border-green-50">
                            <FontAwesomeIcon icon={faWallet} className="text-green-500 text-2xl" />
                        </div>
                        <div className="pt-1">
                            <h3 className="font-bold text-gray-900 text-[17px] tracking-wide">সহজে আয়ের সুযোগ</h3>
                            <p className="text-[14.5px] text-gray-600 mt-1.5">সহজ কাজ করে প্রতিদিন আয় করুন।</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-full bg-blue-100/70 flex items-center justify-center shrink-0 shadow-sm border border-blue-50">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 text-[22px]" />
                        </div>
                        <div className="pt-1">
                            <h3 className="font-bold text-gray-900 text-[17px] tracking-wide">নিরাপদ ও নির্ভরযোগ্য</h3>
                            <p className="text-[14.5px] text-gray-600 mt-1.5">আপনার তথ্য ও আয় সম্পূর্ণ নিরাপদ।</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-full bg-orange-100/70 flex items-center justify-center shrink-0 shadow-sm border border-orange-50">
                            <FontAwesomeIcon icon={faChartSimple} className="text-orange-500 text-[22px]" />
                        </div>
                        <div className="pt-1">
                            <h3 className="font-bold text-gray-900 text-[17px] tracking-wide">রিয়েল টাইম পেমেন্ট</h3>
                            <p className="text-[14.5px] text-gray-600 mt-1.5">দ্রুত পেমেন্ট ও ট্রান্সপারেন্ট সিস্টেম।</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-full bg-pink-100/70 flex items-center justify-center shrink-0 shadow-sm border border-pink-50">
                            <FontAwesomeIcon icon={faUsers} className="text-pink-500 text-[22px]" />
                        </div>
                        <div className="pt-1">
                            <h3 className="font-bold text-gray-900 text-[17px] tracking-wide">রেফার করে বেশি আয়</h3>
                            <p className="text-[14.5px] text-gray-600 mt-1.5">বন্ধুদের রেফার করে বাড়তি ইনকাম করুন।</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Stats Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="w-full max-w-[1050px] bg-[#0b0c2a] rounded-[20px] p-8 lg:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl"
            >
                {/* Stat 1 */}
                <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-400 text-xl" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-[22px] tracking-wider leading-tight">{totalUsers}</div>
                        <div className="text-gray-400 text-[14px] mt-1">মোট ব্যবহারকারী</div>
                    </div>
                </div>
                
                {/* Stat 2 */}
                <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-full bg-green-600/20 flex items-center justify-center shrink-0 border border-green-500/20">
                        <FontAwesomeIcon icon={faWallet} className="text-green-400 text-xl" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-[22px] tracking-wider leading-tight">{totalPayments}</div>
                        <div className="text-gray-400 text-[14px] mt-1">মোট পেমেন্ট</div>
                    </div>
                </div>
                
                {/* Stat 3 */}
                <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-full bg-purple-600/20 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-purple-400 text-xl" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-[22px] tracking-wider leading-tight">100%</div>
                        <div className="text-gray-400 text-[14px] mt-1">নিরাপদ ও নির্ভরযোগ্য</div>
                    </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
                        <FontAwesomeIcon icon={faHeadset} className="text-indigo-400 text-xl" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-[22px] tracking-wider leading-tight">২৪/৭</div>
                        <div className="text-gray-400 text-[14px] mt-1">সাপোর্ট সুবিধা</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

