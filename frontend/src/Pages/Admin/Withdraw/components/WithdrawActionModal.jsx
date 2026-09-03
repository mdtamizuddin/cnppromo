import React, { useState } from 'react';
import { Button, Chip } from "@material-tailwind/react";
import { XMarkIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import moment from "moment";
import { api } from "../../../../util/axios";
import { uploadImageToS3 } from "../../../../util/s3Upload";
import logoProvider from "../../Users/_Ui/logoProvider";
import { Image } from "antd"
const WithdrawActionModal = ({ withdraw, onClose, refetch }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const isPending = withdraw.status === "pending";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const actionHandler = async (type, imageUrl) => {
    try {
      if (type === "rejected") {
        setRejectLoading(true);
        const res = await api.put(`/withdraw/reject/${withdraw._id}`);
        toast.success(res.data.message || "Withdrawal rejected");
      } else {
        setLoading(true);
        const res = await api.put(`/withdraw/${withdraw._id}`, {
          status: type,
          image: imageUrl || "",
        });
        toast.success(res.data.message || "Withdrawal approved");
      }
      refetch();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRejectLoading(false);
    }
  };

  const handleApprove = async () => {
    if (image) {
      setLoading(true);
      try {
        const imageUrl = await uploadImageToS3(image);
        await actionHandler("completed", imageUrl);
      } catch (error) {
        toast.error(error?.message || "Image upload failed");
        setLoading(false);
      }
    } else {
      await actionHandler("completed");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-t-[2rem] md:rounded-3xl shadow-2xl border border-gray-200 z-50 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in-up">

        {/* Loader Overlay */}
        {(loading || rejectLoading) && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[inherit]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-10">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Left Section - User Summary */}
        <div className="flex flex-col items-center md:justify-center w-full md:w-1/3 md:border-r border-gray-100 pr-0 md:pr-6 relative">
          <img
            src={withdraw.user?.avatar || "/default-avater.png"}
            alt={withdraw.user?.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-md object-cover mb-3"
          />
          <h2 className="text-lg font-bold text-gray-900 text-center">{withdraw.user?.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">#{withdraw.user?.username}</p>

          <div className="mt-4 w-full px-4 md:px-0 text-center">
            <span className="text-sm font-bold text-gray-600 block mb-1">Requested Amount</span>
            <span className="text-2xl font-black text-blue-600">৳{withdraw.amount}</span>
          </div>

          <div className="mt-4 w-full px-4 md:px-0">
            <div className={`w-full rounded-xl p-2.5 flex items-center justify-center gap-2 border ${withdraw.status === 'completed' ? 'bg-green-50 border-green-100/50' : withdraw.status === 'rejected' ? 'bg-red-50 border-red-100/50' : 'bg-amber-50 border-amber-100/50'}`}>
              <span className={`text-[11px] font-bold tracking-wider uppercase ${withdraw.status === 'completed' ? 'text-green-700' : withdraw.status === 'rejected' ? 'text-red-700' : 'text-amber-700'}`}>
                {withdraw.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Details & Actions */}
        <div className="flex-1 flex flex-col mt-2 md:mt-0">
          <h3 className="text-base font-bold text-gray-900 mb-4 hidden md:block">
            Withdrawal Details
          </h3>

          <div className="grid grid-cols-1 gap-y-3 text-sm animate-fade-in mb-6">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Payment Method</span>
              <div className="flex items-center gap-2">
                <img src={logoProvider(withdraw.method?.toLowerCase())} alt="Method" className="h-5 object-contain" />
                <span className="text-gray-900 font-medium">{withdraw.method}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Account Number</span>
              <span className="text-gray-900 font-medium flex items-center gap-2">
                {withdraw.account}
                <DocumentDuplicateIcon
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(withdraw.account);
                    toast.success("Copied account number");
                  }}
                />
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/80 border border-gray-100/50">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Requested On</span>
              <span className="text-gray-900 font-medium">{moment(withdraw.createdAt).format("MMMM Do YYYY, h:mm:ss a")}</span>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-auto border-t border-gray-100 pt-5">
            {isPending ? (
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Upload Proof (Optional)</label>
                  <label className="flex items-center justify-center w-full h-16 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                    <span className="flex items-center space-x-2">
                      <PhotoIcon className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-gray-600">
                        {image ? image.name : "Click to select image"}
                      </span>
                    </span>
                    <input type="file" name="image" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                  {preview && (
                    <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex flex-row gap-3">
                  <Button
                    variant="filled"
                    color="green"
                    className="flex-1 flex items-center justify-center gap-2 normal-case py-3"
                    onClick={handleApprove}
                    disabled={loading || rejectLoading}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="red"
                    className="flex-1 flex items-center justify-center gap-2 normal-case py-3"
                    onClick={() => actionHandler("rejected")}
                    disabled={loading || rejectLoading}
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full text-center">
                {withdraw.image ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-gray-700 mb-2">Payment Proof</span>
                    <Image src={withdraw.image} alt="Proof" className="w-full max-h-48 object-contain rounded-lg border border-gray-200 cursor-zoom-in" />
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">No payment proof uploaded.</span>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default WithdrawActionModal;
