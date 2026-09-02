import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser } from '@fortawesome/free-regular-svg-icons';
import {
    faLock,
    faPhone,
    faIdCard,
    faXmark,
    faCircleCheck,
    faPenToSquare,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const PreviewRow = ({ icon, label, value, highlight }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center justify-center text-primary">
            <FontAwesomeIcon icon={icon} className="text-[13px]" />
        </div>
        <div className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-semibold text-gray-500">{label}</span>
            <span className={`block text-[14.5px] font-bold break-words ${highlight ? 'text-primary' : 'text-gray-900'}`}>
                {value || '—'}
            </span>
        </div>
    </div>
);

const RegisterPreviewModal = ({ isOpen, onClose, onConfirm, data, referer, loading = false }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, loading, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50"
                        onClick={() => !loading && onClose?.()}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]"
                        >
                            <div className="flex items-center justify-between px-6 pt-5">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-primary border border-teal-100">
                                    Preview
                                </span>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={onClose}
                                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-[16px]" />
                                </button>
                            </div>

                            <div className="px-6 pt-3 pb-1 text-center">
                                <h3 className="text-[19px] font-bold text-[#0b0c2a] tracking-wide">তথ্যগুলো যাচাই করুন</h3>
                                <p className="text-[12.5px] text-gray-500 mt-1.5 leading-relaxed">
                                    একাউন্ট তৈরির আগে নিচের তথ্যগুলো ভালোভাবে দেখে নিন।
                                </p>
                            </div>

                            <div className="px-6 py-2 overflow-y-auto">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 px-4">
                                    <PreviewRow icon={faUser} label="আপনার নাম" value={data?.name} />
                                    <PreviewRow icon={faUser} label="ইউজার নেম" value={data?.username} highlight />
                                    <PreviewRow icon={faEnvelope} label="ইমেইল অ্যাড্রেস" value={data?.email} />
                                    <PreviewRow icon={faPhone} label="মোবাইল নাম্বার" value={data?.phone} />
                                    <PreviewRow
                                        icon={faIdCard}
                                        label="রেফারেন্স আইডি"
                                        value={referer?.name ? `${data?.reffer} (${referer.name})` : data?.reffer}
                                    />
                                    <PreviewRow
                                        icon={faLock}
                                        label="পাসওয়ার্ড"
                                        value={data?.password}
                                    />
                                </div>
                            </div>

                            <div className="px-6 pt-3">
                                <div className="flex items-center gap-2.5 bg-amber-50/80 border border-amber-200/80 py-2.5 px-3.5 rounded-xl">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-amber-500 text-[15px] shrink-0" />
                                    <span className="text-amber-700/90 font-semibold text-[12px]">
                                        নিশ্চিত করার পর ইউজার নেম আর পরিবর্তন করা যাবে না।
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={onClose}
                                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} className="text-[13px]" />
                                    <span>Edit</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={onConfirm}
                                    className="flex-1 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="text-[13px] animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-[13px]" />
                                            <span>Confirm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RegisterPreviewModal;
