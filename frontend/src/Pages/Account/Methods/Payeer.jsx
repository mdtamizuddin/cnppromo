import { Button } from "@material-tailwind/react";
import { Radio } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Payeer({ data, setCurrency }) {
  const paymentMethods = ["usd", "rub"];
  const [selected, setSelected] = React.useState("usd");

  return (
    <div className="">
      <h4 className="text-sm mt-5">Payeer Account Personal</h4>
      <div className="mt-2">
        <p className="p-2 bg-gray-200 rounded-lg text-sm mb-2">
          {data?.accounts?.payeer}
        </p>

        <button
          disabled={!data?.accounts?.payeer}
          onClick={() => {
            navigator.clipboard.writeText(data?.accounts?.payeer);
            toast.success("Copied");
          }}
          className="bg-gray-200 hover:bg-gray-300 rounded px-2 text-xs py-2 mt-2 "
        >
          Copy Account Number
        </button>
      </div>
      <form className="mt-4">
        {paymentMethods.map((method, index) => {
          return (
            <Radio
              key={index}
              label={method.toUpperCase()}
              value={method}
              name="payment"
              defaultChecked={selected === method}
              onChange={(e) => {
                setSelected(e.target.value);
                setCurrency(e.target.value);
              }}
            />
          );
        })}
      </form>
    </div>
  );
}
