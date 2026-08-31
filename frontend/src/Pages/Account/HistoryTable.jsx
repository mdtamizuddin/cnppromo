import React, { useState } from "react";
import { Table, Avatar, Tag } from "antd";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import moment from "moment";
import logoProvider from "../Admin/Users/_Ui/logoProvider";
import Loader from "../../Components/Loader";
import { api } from "../../util/axios";
import { Image } from "antd";
import toast from "react-hot-toast";
import {
  DocumentDuplicateIcon,
  CheckBadgeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function HistoryTable({ historyType }) {
  const [option, setOption] = useState({ page: 1, limit: 15 });
  const { user } = useSelector((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: [`history-${historyType}`, user?._id, option],
    queryFn: async () => {
      const res = await api.get(
        `/${historyType === "withdraw" ? "withdraw" : "topup"}?user=${
          user?._id
        }&reverse=true&limit=${option.limit}&page=${option.page}`
      );
      return res.data;
    },
    enabled: !!user?._id,
  });

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("অ্যাকাউন্ট নম্বর কপি করা হয়েছে!");
  };

  const columns = [
    {
      title: "তারিখ ও সময়",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
          {moment(createdAt).format("DD MMM, YYYY hh:mm A")}
        </span>
      ),
    },
    {
      title: "পরিমাণ",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="text-xs font-black text-[#0b0c2a] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
          ৳{amount}
        </span>
      ),
    },
    {
      title: "পেমেন্ট মাধ্যম ও অ্যাকাউন্ট",
      key: "payment",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={36}
            src={logoProvider(record.method?.toLowerCase())}
            className="rounded-xl border border-gray-100 p-0.5 shadow-sm shrink-0 bg-white"
          />
          <div>
            <div className="text-xs font-bold text-[#0b0c2a] flex items-center gap-1">
              <span>{record.method}</span>
              <span className="text-gray-400 font-normal">({record.account})</span>
              <button
                type="button"
                onClick={() => handleCopy(record.account)}
                className="text-gray-400 hover:text-primary transition-colors"
                title="কপি করুন"
              >
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            {record.trx && (
              <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                Trx: {record.trx}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "স্ট্যাটাস",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isCompleted = status === "completed";
        const isPending = status === "pending";
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isCompleted
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : isPending
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {isCompleted && <CheckCircleIcon className="w-3.5 h-3.5" />}
            {isPending && <ClockIcon className="w-3.5 h-3.5" />}
            {!isCompleted && !isPending && <XCircleIcon className="w-3.5 h-3.5" />}
            <span className="capitalize">{status}</span>
          </span>
        );
      },
    },
    {
      title: "পেমেন্ট প্রুফ",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <Image
            height={50}
            src={image}
            className="rounded-xl object-cover shadow-sm border border-gray-100"
          />
        ) : (
          <span className="text-xs text-gray-300">—</span>
        ),
      hidden: historyType !== "withdraw",
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-600">
          মোট রেকর্ড: {data?.count || data?.data?.length || 0} টি
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="_id"
          pagination={{
            current: option.page,
            pageSize: option.limit,
            total: data?.count || 0,
            onChange: (page, pageSize) => {
              setOption({ page, limit: pageSize });
            },
          }}
          scroll={{ x: true }}
          className="ant-custom-table"
        />
      </div>
    </div>
  );
}