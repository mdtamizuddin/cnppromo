import React, { useState } from 'react';
import { Button, Chip, Textarea } from "@material-tailwind/react";
import { XMarkIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import moment from "moment";
import { api } from "../../../../util/axios";
import logoProvider from "../../Users/_Ui/logoProvider";

const ExternalWithdrawActionModal = ({ withdraw, onClose, refetch }) => {
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const isPending = withdraw.status === "pending";

  const handleApprove = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/external-withdraw/${withdraw._id}`, { status: "completed" });
      toast.success(res.data.message || "Withdrawal approved successfully");
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to approve request");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      setRejectLoading(true);
      const res = await api.put(`/external-withdraw/${withdraw._id}`, { 
        status: "rejected",
        reason: reason
      });
      toast.success(res.data.message || "Withdrawal rejected");
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to reject request");
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-t-[2rem] md:rounded-3xl shadow-2xl border border-gray-200 z-50 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in-up">
        
        {/* Loader Overlay */}
        {(loading || rejectLoading) && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[inherit]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-10">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Left Section - User Summary & Proof Display */}
        <div className="flex flex-col items-center md:justify-center w-full md:w-5/12 md:border-r border-gray-100 pr-0 md:pr-6 relative">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={withdraw.user?.avatar || "/default-avater.png"}
              alt={withdraw.user?.name}
              className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{withdraw.user?.name}</h2>
              <p className="text-sm text-gray-500">#{withdraw.user?.username}</p>
            </div>
          </div>
          
          <div className="w-full text-left mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">User Submitted Proof</span>
            <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center min-h-[200px]">
              {withdraw?.video ? (
                <video src={withdraw.video} controls className="w-full h-full object-contain max-h-[300px]" />
              ) : withdraw?.image ? (
                <img src={withdraw.image} alt="Proof" className="w-full h-full object-contain max-h-[300px]" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                  <XMarkIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-sm">No document provided</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 w-full">
            <div className={`w-full rounded-xl p-2.5 flex items-center justify-center gap-2 border ${withdraw.status === 'completed' ? 'bg-green-50 border-green-100/50' : withdraw.status === 'rejected' ? 'bg-red-50 border-red-100/50' : 'bg-amber-50 border-amber-100/50'}`}>
              <span className={`text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 ${withdraw.status === 'completed' ? 'text-green-700' : withdraw.status === 'rejected' ? 'text-red-700' : 'text-amber-700'}`}>
                {withdraw.status === "completed" ? <CheckCircleIcon className="w-4 h-4" /> : withdraw.status === "rejected" ? <XCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                {withdraw.status}
              </span>
            </div>
            {withdraw.status === "rejected" && withdraw.reason && (
               <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 text-center">
                 <span className="font-semibold block mb-1">Rejection Reason:</span>
                 {withdraw.reason}
               </div>
            )}
          </div>
        </div>

        {/* Right Section - Details & Actions */}
        <div className="flex-1 flex flex-col mt-2 md:mt-0">
          <h3 className="text-base font-bold text-gray-900 mb-4 hidden md:block">
            External Withdrawal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm animate-fade-in mb-6">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Method</span>
              <span className="text-gray-900 font-medium capitalize flex items-center gap-2">
                 <img src={logoProvider(withdraw.method?.toLowerCase())} alt={withdraw.method} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                 {withdraw.method}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Account</span>
              <span className="text-gray-900 font-medium flex items-center gap-2 truncate">
                {withdraw.account}
                <DocumentDuplicateIcon
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(withdraw.account);
                    toast.success("Copied account");
                  }}
                />
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50 sm:col-span-2">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Requested On</span>
              <span className="text-gray-900 font-medium">{moment(withdraw.createdAt).format("MMMM Do YYYY, h:mm:ss a")}</span>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-auto border-t border-gray-100 pt-5">
            {isPending ? (
              <div className="flex flex-col gap-4">
                
                {showRejectInput ? (
                  <div className="animate-fade-in">
                    <Textarea 
                       label="Reason for rejection"
                       value={reason}
                       onChange={(e) => setReason(e.target.value)}
                       color="red"
                       rows={3}
                       autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                       <Button color="gray" variant="outlined" className="flex-1 py-2 normal-case" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                       <Button color="red" className="flex-1 py-2 normal-case" onClick={handleReject} disabled={rejectLoading}>Confirm Reject</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row gap-3">
                    <Button
                      variant="filled"
                      color="green"
                      className="flex-1 flex items-center justify-center gap-2 normal-case py-3"
                      onClick={handleApprove}
                      disabled={loading}
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outlined"
                      color="red"
                      className="flex-1 flex items-center justify-center gap-2 normal-case py-3"
                      onClick={() => setShowRejectInput(true)}
                      disabled={loading}
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full text-center py-4 bg-gray-50 rounded-xl">
                 <span className="text-sm text-gray-500 italic">This request has already been {withdraw.status}.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default ExternalWithdrawActionModal;
