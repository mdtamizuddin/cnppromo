import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@material-tailwind/react';
import { api } from '../../../util/axios';
import Cookie from 'js-cookie';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser } from '@fortawesome/free-regular-svg-icons';
import { 
    faLock, 
    faEye, 
    faEyeSlash,

    faPhone,
    faIdCard,
    faWallet, 
    faShieldHalved, 
    faChartSimple, 
    faUsers, 
    faHeadset,
    faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ClipboardIllustration = () => (
  <div className="relative w-64 h-64 flex items-center justify-center mb-12 mx-auto">
     <div className="absolute inset-0 bg-purple-100/60 rounded-full scale-110 blur-xl"></div>
     
     {/* Decorative shapes */}
     <div className="absolute -top-4 right-4 w-16 h-16 bg-pink-100/80 rounded-full blur-md"></div>
     <div className="absolute bottom-4 left-0 w-20 h-20 bg-blue-100/60 rounded-full blur-md"></div>
     
     {/* Abstract leaves/blobs */}
     <div className="absolute top-0 right-10 w-8 h-16 bg-[#ffb5a7] rounded-full rotate-45 opacity-80 blur-[2px]"></div>
     <div className="absolute top-6 right-2 w-10 h-10 bg-[#ffd166] rounded-full opacity-60 blur-[2px]"></div>
     <div className="absolute bottom-10 -left-2 w-12 h-16 bg-[#a2d2ff] rounded-full -rotate-12 opacity-80 blur-[2px]"></div>

     {/* Clipboard */}
     <div className="relative z-10 w-44 h-56 bg-white rounded-xl shadow-xl shadow-teal-500/10 border-2 border-primary flex flex-col items-center">
        {/* Clip */}
        <div className="absolute -top-3 w-16 h-6 bg-primary rounded-full border-[3px] border-white z-20"></div>
        <div className="absolute -top-1 w-10 h-2 bg-teal-300 rounded-full z-30"></div>
        
        {/* Content Lines */}
        <div className="mt-10 px-5 w-full flex flex-col gap-5">
           {/* Header row with avatar */}
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-primary shrink-0">
                 <FontAwesomeIcon icon={faUser} className="text-lg" />
              </div>
              <div className="flex-1 space-y-2">
                 <div className="w-full h-2.5 bg-teal-100 rounded-full"></div>
                 <div className="w-2/3 h-2.5 bg-teal-100 rounded-full"></div>
              </div>
           </div>
           {/* Lines */}
           <div className="space-y-3 mt-2">
              <div className="w-full h-2.5 bg-teal-50 rounded-full"></div>
              <div className="w-full h-2.5 bg-teal-50 rounded-full"></div>
              <div className="w-3/4 h-2.5 bg-teal-50 rounded-full"></div>
           </div>
        </div>
     </div>

     {/* Pencil */}
     <div className="absolute z-20 top-20 right-6 w-6 h-36 bg-[#ffca3a] rotate-[20deg] rounded-t-md shadow-lg">
        {/* Eraser */}
        <div className="w-full h-4 bg-pink-300 rounded-t-md border-b-2 border-gray-300"></div>
        {/* Pencil Tip */}
        <div className="absolute -bottom-5 left-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#f4a261]">
            <div className="absolute -top-[20px] -left-[3px] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-gray-800"></div>
        </div>
     </div>

     {/* Plus Button Badge */}
     <div className="absolute z-30 -bottom-4 right-8 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-light shadow-xl border-[4px] border-white hover:scale-105 transition-transform cursor-pointer">
        +
     </div>
  </div>
);

const FormInput = ({ label, icon, ...props }) => (
    <div>
        <label className="block text-gray-800 text-[14px] font-bold mb-1.5">
            {label} <span className="text-red-500">*</span>
            {props.availability !== undefined && (
                <span className={`ml-2 text-[11px] font-normal ${props.availability ? 'text-green-500' : 'text-red-500'}`}>
                    ({props.availability ? 'Available' : 'Not Available'})
                </span>
            )}
        </label>
        <div className="flex">
            <div className="w-[44px] shrink-0 border border-r-0 border-gray-200 rounded-l-xl flex items-center justify-center text-primary bg-teal-50/40">
                <FontAwesomeIcon icon={icon} className="text-[15px]" />
            </div>
            <div className="relative w-full">
               <input 
                   {...props}
                   className={`w-full border ${props.error ? 'border-red-400' : 'border-gray-200'} rounded-r-xl py-2.5 px-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-[14px]`} 
               />
            </div>
        </div>
    </div>
);

const PasswordInput = ({ label, icon, value, name, onChange, placeholder, error }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-gray-800 text-[14px] font-bold mb-1.5">{label} <span className="text-red-500">*</span></label>
            <div className="flex">
                <div className="w-[44px] shrink-0 border border-r-0 border-gray-200 rounded-l-xl flex items-center justify-center text-primary bg-teal-50/40">
                    <FontAwesomeIcon icon={icon} className="text-[15px]" />
                </div>
                <div className="relative w-full">
                   <input 
                       type={show ? 'text' : 'password'}
                       name={name}
                       value={value}
                       onChange={onChange}
                       placeholder={placeholder}
                       required
                       className={`w-full border ${error ? 'border-red-400' : 'border-gray-200'} rounded-r-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-teal-500/30 transition-colors text-[14px]`} 
                   />
                   <div 
                       className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                       onClick={() => setShow(!show)}
                   >
                       <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="text-[14px]" />
                   </div>
                </div>
            </div>
        </div>
    )
};

const Register = () => {
    function generateRandomText(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomText = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            randomText += charset[randomIndex];
        }
        return randomText;
    }

    const randomText = generateRandomText(10);
    const [searchParams] = useSearchParams();
    const queryParamValue = searchParams.get('ref');

    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'moderator') {
                window.location.href = "/admin";
            } else {
                window.location.href = "/user/home";
            }
        }
    }, [user]);

    const [data, setData] = useState({
        username: "",
        name: "",
        gender: "Male",
        education: "HSC",
        email: "",
        phone: "",
        password: "",
        confirm: "",
        paymentMethod: "",
        account: "",
        trx: randomText,
        time: new Date(),
        reffer: "",
        fbId: "N/A", // Defaulted as per design omission
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(true);
    const [referer, setReferer] = useState(true);
    const [agree, setAgree] = useState(false);

    // Fetch dynamic statistics for the bottom bar
    const { data: statsData } = useQuery({
        queryKey: "statistic",
        queryFn: async () => {
            const res = await api.get("/statistic");
            return res.data;
        }
    });

    const totalUsers = ((statsData?.total || 75490) + 60000).toLocaleString() + "+";
    const totalPayments = ((statsData?.total_withdraw || 734598) + 7000000).toLocaleString() + "+";

    useEffect(() => {
        if (queryParamValue) {
            api.get(`/user/search/${queryParamValue}`).then((res) => {
                setReferer(res.data.success);
            });
            setData({ ...data, reffer: queryParamValue });
        }
    }, [queryParamValue]);

    const updateState = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const getMissingValues = (obj, requiredFields) => {
        const missing = [];
        for (const field of requiredFields) {
            if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
                missing.push(field);
            }
        }
        return missing;
    };

    const validateUsernameClient = (raw) => {
        if (!raw) return { valid: false, message: "" };
        const uname = raw.trim().toLowerCase();
        if (uname.length < 4 || uname.length > 20) {
            return { valid: false, message: "ইউজারনেম ৪ থেকে ২০ অক্ষরের মধ্যে হতে হবে" };
        }
        if (uname.includes(" ")) {
            return { valid: false, message: "ইউজারনেমে কোনো স্পেস থাকা যাবে না" };
        }
        if (uname.includes("@")) {
            return { valid: false, message: "ইউজারনেমে '@' বা ইমেইল দেওয়া যাবে না" };
        }
        if (!/^[a-z0-9]/.test(uname)) {
            return { valid: false, message: "ইউজারনেম অক্ষর বা সংখ্যা দিয়ে শুরু হতে হবে" };
        }
        if (!/[a-z0-9]$/.test(uname)) {
            return { valid: false, message: "ইউজারনেম অক্ষর বা সংখ্যা দিয়ে শেষ হতে হবে" };
        }
        if (uname.includes("__") || uname.includes("--") || uname.includes("-_") || uname.includes("_-")) {
            return { valid: false, message: "একসাথে একাধিক স্পেশাল ক্যারেক্টার দেওয়া যাবে না" };
        }
        if (!/^[a-z0-9_-]+$/.test(uname)) {
            return { valid: false, message: "শুধুমাত্র অক্ষর, সংখ্যা, _ এবং - ব্যবহার করা যাবে" };
        }
        return { valid: true, username: uname };
    };

    const checkUser = async (e) => {
        e.preventDefault();
        const clientVal = validateUsernameClient(data.username);
        if (!clientVal.valid) {
            if (data.username) {
                setMessage(false);
                setError(clientVal.message);
            }
            return;
        }
        try {
            const res = await api.get(`/user/check/${clientVal.username}`);
            setMessage(res.data.status);
            if (!res.data.status) {
                setError(res.data.message || "Username Not Available");
            } else {
                setError("");
            }
        } catch (error) {
            setError(error?.response?.data?.message || error?.message || "Something went wrong");
        }
    };

    const SubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!agree) {
            return toast.error("Please agree to the terms and privacy policy");
        }
        if (!data.reffer) {
            return toast.error("Reference ID is required!");
        }
        if (!referer && data.reffer) {
            return toast.error("Please enter a valid reference ID");
        }
        const clientVal = validateUsernameClient(data.username);
        if (!clientVal.valid) {
            return toast.error(clientVal.message || "একটি সঠিক ইউজারনেম দিন");
        }
        if (!message) {
            return toast.error("Enter a valid unique username");
        }

        try {
            setLoading(true);
            const missing = getMissingValues(data, ["username", "name", "email", "phone", "password", "confirm", "reffer"]);
            if (missing.length > 0) {
                setError("Please fill in all required fields.");
                setLoading(false);
                return;
            }
            if (data.password !== data.confirm) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }
            
            setError("");
            const submitData = { ...data, username: data.username.toLowerCase() };
            const res = await api.post('/user', submitData);
            Cookie.set("token-you", res.data.token, { expires: 30 });
            toast.success("Registration Successful");
            const tokenPayload = JSON.parse(atob(res.data.token.split('.')[1]));
            if (tokenPayload.role === 'admin' || tokenPayload.role === 'moderator') {
                window.location.href = "/admin";
            } else {
                window.location.href = "/user/welcome";
            }
            
        } catch (error) {
            setError(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafc] flex flex-col items-center py-10 px-4 font-sans">
            <div className="w-full max-w-[1050px] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-start mb-10">
                
                {/* Left Column - Register Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white border border-gray-100">
                    <h2 className="text-[28px] font-bold text-gray-900 mb-1.5 tracking-wide text-[#0b0c2a]">রেজিস্ট্রেশন করুন</h2>
                    <p className="text-[15px] text-gray-500 mb-8 font-medium">CNP-PROMO-তে একাউন্ট খুলে আয়ের সূচনা করুন</p>
                    
                    <form onSubmit={SubmitHandler} className="space-y-5">
                        
                        <FormInput
                            label="আপনার নাম লিখুন"
                            icon={faUser}
                            type="text"
                            name="name"
                            placeholder="আপনার নাম লিখুন"
                            value={data.name}
                            onChange={updateState}
                            required
                        />

                        <FormInput
                            label="ইউজার নেম (৪-২০ অক্ষর, ইমেইল নয়)"
                            icon={faUser}
                            type="text"
                            name="username"
                            placeholder="যেমন: shuvo_123"
                            value={data.username}
                            onChange={(e) => {
                                updateState(e);
                                const check = validateUsernameClient(e.target.value);
                                if (!check.valid && e.target.value.length > 0) {
                                    setMessage(false);
                                }
                            }}
                            onBlur={checkUser}
                            required
                            error={!validateUsernameClient(data.username).valid && data.username.length > 0}
                            availability={data.username ? (validateUsernameClient(data.username).valid ? message : false) : undefined}
                        />

                        <FormInput
                            label="ইমেইল অ্যাড্রেস লিখুন"
                            icon={faEnvelope}
                            type="email"
                            name="email"
                            placeholder="ইমেইল অ্যাড্রেস লিখুন"
                            value={data.email}
                            onChange={updateState}
                            required
                        />

                        <PasswordInput
                            label="পাসওয়ার্ড দিন"
                            icon={faLock}
                            name="password"
                            placeholder="পাসওয়ার্ড দিন"
                            value={data.password}
                            onChange={updateState}
                        />

                        <PasswordInput
                            label="পুনরায় পাসওয়ার্ড দিন"
                            icon={faLock}
                            name="confirm"
                            placeholder="পুনরায় পাসওয়ার্ড দিন"
                            value={data.confirm}
                            onChange={updateState}
                            error={data.confirm && data.password !== data.confirm}
                        />

                        <FormInput
                            label="মোবাইল নাম্বার লিখুন"
                            icon={faPhone}
                            type="text"
                            name="phone"
                            placeholder="মোবাইল নাম্বার লিখুন"
                            value={data.phone}
                            onChange={updateState}
                            required
                        />

                        <FormInput
                            label="রেফারেন্স আইডি দিন"
                            icon={faIdCard}
                            type="text"
                            name="reffer"
                            placeholder="রেফারেন্স আইডি দিন"
                            value={data.reffer}
                            onChange={updateState}
                            required
                            error={queryParamValue && !referer}
                        />

                        <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/80 py-3.5 px-4 rounded-xl mt-6 shadow-sm">
                            <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-500 text-lg shrink-0" />
                            <span className="text-amber-700/90 font-semibold text-[13.5px]">অবশ্যই রেফারেন্স আইডি লিখতে হবে, নাহলে অ্যাকাউন্ট হবে না।</span>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl mt-2">
                                {error}
                            </p>
                        )}

                        <div className="flex items-center gap-3 mt-6 ml-1">
                            <input 
                                type="checkbox" 
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                            />
                            <span className="text-gray-700 font-medium text-[14px]">আমি শর্তাবলী ও গোপনীয়তা নীতিমালা পড়েছি এবং এতে সম্মত।</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !agree}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-[17px] mt-6 flex items-center justify-center gap-2.5 hover:bg-primary-hover transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "অপেক্ষা করুন..." : "রেজিস্ট্রেশন করুন"}
                        </button>

                        {/* Or Divider */}
                        <div className="relative flex items-center py-5">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-500 text-[14px] font-medium">অথবা</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                        
                        {/* Login Link */}
                        <div className="text-center text-[15px] text-gray-600 pb-2">
                            ইতিমধ্যেই একাউন্ট আছে? <Link to="/login" className="text-primary font-semibold hover:underline tracking-wide ml-1">লগ ইন করুন</Link>
                        </div>
                    </form>
                    </Card>
                </motion.div>

                {/* Right Column - Illustration & Features */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="space-y-8 mt-4"
                >
                    
                    <ClipboardIllustration />

                    <h2 className="text-[22px] font-bold text-[#0b0c2a] mb-8 tracking-wide">CNP-PROMO-তে যোগ দিলে আপনি পাবেন</h2>
                    
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
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
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

export default Register;
