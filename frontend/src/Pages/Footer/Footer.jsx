import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTelegramPlane, faWhatsapp, faYoutube, faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

const Footer = () => {
  const date = new Date();
  const { settings } = useSelector((state) => state.user);
  const path = useLocation();

  if (path.pathname === "/message") {
    return null;
  }

  return (
    <div className="bg-[#0b0c2a] text-gray-300 font-sans border-t border-gray-800/50 mt-auto">
      <div className="max-w-[1140px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Logo and About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[6px] border-[#5a32fa] border-r-transparent rotate-45"></div>
                <div className="w-3.5 h-3.5 bg-[#5a32fa] rounded-full mr-1 mt-1"></div>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold tracking-wide">{settings?.siteName || "CNP-PROMO"}</h2>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">Virtual Money Makers</p>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed max-w-[280px]">
              {settings?.siteName || "CNP-PROMO"} একটি বিশ্বস্ত প্ল্যাটফর্ম যেখানে আপনি সহজ কাজ করে অনলাইনে ইনকাম করতে পারবেন।
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faFacebookF} className="text-white text-sm" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-500 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faTelegramPlane} className="text-white text-sm" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-green-500 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faWhatsapp} className="text-white text-sm" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faYoutube} className="text-white text-sm" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-lg font-medium mb-6">দ্রুত লিঙ্কসমূহ</h3>
            <ul className="space-y-3.5 text-[15px]">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">হোম</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-400 transition-colors">কিভাবে কাজ করে</Link></li>
              <li><Link to="/features" className="hover:text-blue-400 transition-colors">ফিচারসমূহ</Link></li>
              <li><Link to="/payment-proof" className="hover:text-blue-400 transition-colors">পেমেন্ট প্রুফ</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">যোগাযোগ করুন</Link></li>
            </ul>
          </div>

          {/* Column 3: Important Links */}
          <div>
            <h3 className="text-white text-lg font-medium mb-6">গুরুত্বপূর্ণ লিঙ্কসমূহ</h3>
            <ul className="space-y-3.5 text-[15px]">
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors">ব্যবহারকারীর শর্তাবলী</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">গোপনীয়তা নীতি</Link></li>
              <li><Link to="/refund" className="hover:text-blue-400 transition-colors">রিফান্ড নীতি</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">সাপোর্ট</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors">সাধারণ জিজ্ঞাসা (FAQ)</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-white text-lg font-medium mb-6">যোগাযোগ করুন</h3>
            <div className="space-y-6">
              <a href="https://m.me/yourpage" target="_blank" rel="noreferrer" className="flex items-center justify-between w-full max-w-[260px] bg-[#5a32fa] hover:bg-[#4b26e0] text-white px-5 py-3 rounded-md transition-colors text-[15px] font-medium shadow-lg shadow-indigo-500/20">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faFacebookMessenger} className="text-xl" />
                  <span>Messenger এ মেসেজ করুন</span>
                </div>
                <span className="text-lg font-light">&gt;</span>
              </a>
              
              <div className="flex items-center gap-4 mt-6">
                <div className="w-10 flex justify-center">
                  <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-gray-400" />
                </div>
                <a href="mailto:support@cnppromo.com" className="text-[15px] hover:text-blue-400 transition-colors">support@cnppromo.com</a>
              </div>
              
              <div className="flex items-center gap-4 mt-5">
                <div className="w-10 flex justify-center">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-[26px] text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] text-gray-200">লাইভ চ্যাট সাপোর্ট</span>
                  <span className="text-[13px] text-gray-400 mt-0.5">(২৪/৭ উপলব্ধ)</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 py-5">
        <p className="text-center text-[15px] text-gray-400">
          © {date.getFullYear()} {settings?.siteName || "CNP-PROMO"}. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    </div>
  );
};

export default Footer;
