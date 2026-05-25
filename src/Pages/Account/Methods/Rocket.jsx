
import React from "react";
import toast from "react-hot-toast";

export default function Rocket({ data }) {
  const copy = () => {
    navigator.clipboard.writeText(data?.accounts?.rocket);
    toast.success("Copied");
  };
  return (
    <div className="">
      <h4 className="text-sm mt-5">Rocket Personal</h4>
      <div className="mt-2">
        <p className="p-2 bg-gray-200 rounded-lg text-sm mb-2">
          {data?.accounts?.rocket}
        </p>
        <button
          disabled={!data?.accounts?.rocket}
          onClick={copy}
          className="bg-gray-200 hover:bg-gray-300 rounded px-2 text-xs py-2 mt-2 "
        >
          Copy Account Number
        </button>
      </div>
    </div>
  );
}
