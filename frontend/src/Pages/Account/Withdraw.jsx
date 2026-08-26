import React, { useState } from "react";
import { Input } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import { Radio } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { api } from "../../util/axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { refreshUser } from "../../redux/features/user/userSlice";
import HistoryTable from "./HistoryTable";
import Loader from "../../Components/Loader";

const Withdraw = () => {
  const paymentMethods = ["Bkash", "Nagad", "Rocket", "Mobile Recharge"];
  const [selected, setSelected] = React.useState("Bkash");
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const amount = e.target.amount.value;
    const account = e.target.account.value;
    const newData = {
      amount,
      account,
      user: user?._id,
      method: selected,
    };
    try {
      const res = await api.post("/withdraw", newData);
      toast.success(
        "Thank you for withdrawing. You will receive your payment within 2 days."
      );
      dispatch(refreshUser(res.data._id));
      setLoading(false);
    } catch (error) {
      if (
        error?.response?.data?.message ===
        "Error: You can't withdraw again today. Your Dayly withdraw limit is exceeded"
      ) {
        toast.error(
          "You can't withdraw again today. Your Dayly withdraw limit is exceeded"
        );
        setLoading(false);
        return;
      }
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <h4 className="text-sm">Select your payment method</h4>
        <div className="">
          {paymentMethods.map((method, index) => {
            return (
              <Radio
                key={index}
                label={method}
                value={method}
                name="payment"
                defaultChecked={selected === method}
                onChange={(e) => setSelected(e.target.value)}
              />
            );
          })}
        </div>
        <Input
          size="md"
          label={`Enter Amount  ${selected === "Mobile Recharge"
              ? "(Min 60Tk)"
              : "Min 60Tk max 6000Tk"
            }`}
          placeholder="Enter Withdraw Amount"
          name="amount"
          type="number"
          min={60}
          max={6000}
          required
          disabled={
            user?.balance < 60
          }
        />
        <Input
          label="Enter Account Number"
          name="account"
          type="text"
          placeholder="Enter Phone Number"
          required
        />
        <div className="flex justify-start">
          <Button
            type="submit"
            disabled={
              selected === "Mobile Recharge"
                ? user?.balance < 60
                : user?.balance < 200
            }
          >
            Submit
          </Button>
        </div>
      </form>
      <HistoryTable historyType={"withdraw"} />
    </div>
  );
};

export default Withdraw;
