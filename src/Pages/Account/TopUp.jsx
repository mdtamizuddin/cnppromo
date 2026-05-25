import { Typography } from '@material-tailwind/react';
import { Radio } from '@material-tailwind/react';
import React from 'react';
import Bkash from './Methods/Bkash';
import Nagad from './Methods/Nagad';
import Rocket from './Methods/Rocket';
import { Input } from '@material-tailwind/react';
import { Button } from '@material-tailwind/react';
import Payeer from './Methods/Payeer';
import HistoryTable from './HistoryTable';
import { api } from '../../util/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const TopUp = () => {
    const paymentMethods = [
        "Bkash",
        "Nagad",
        "Rocket",
        "Payeer",
    ]
    const [selected, setSelected] = React.useState("Bkash");
    const [currency, setCurrency] = React.useState("bdt");
    const { user, settings } = useSelector(state => state.user)
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const amount = e.target.amount.value
            const trx = e.target.trx.value
            const account = e.target.account.value

            const newData = {
                amount,
                trx,
                account,
                method: selected,
                currency,
                user: user?._id
            }
           const res = await api.post('/topup', newData)
            toast.success("Top Up Submit Successfull")
            e.target.reset()
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }

    }
   
    return (
        <div>
            <h4 className='text-sm'>
                Select your payment method
            </h4>
            <form className='mt-4'>
                {
                    paymentMethods.map((method, index) => {
                        return <Radio
                            key={index}
                            label={method}
                            value={method}
                            name="payment"
                            defaultChecked={selected === method}
                            onChange={(e) => setSelected(e.target.value)}
                        />
                    })
                }
            </form>
            <div className="mt-5">
                {
                    selected === "Bkash" && <Bkash data={settings}/>
                }{
                    selected === "Nagad" && <Nagad data={settings}/>
                }{
                    selected === "Rocket" && <Rocket data={settings}/>
                }{
                    selected === "Payeer" && <Payeer setCurrency={setCurrency} currency={currency} data={settings}/>
                }
            </div>
            <form onSubmit={handleSubmit} className='mt-5 flex flex-col gap-4'>
                <Input
                    label="Enter Top Up Amount in BDT"
                    placeholder='Enter Top Up Amount'
                    name='amount'
                    type="number"
                    required
                />
                <Input
                    label="Enter transaction ID"
                    name='trx'
                    type="text"
                    placeholder='Enter transaction ID'
                    required
                    onChange={(e)=> {
                        e.target.value = e.target.value.toUpperCase()
                    }}
                />
                <Input
                    label="Your Phone Number"
                    name='account'
                    type="text"
                    placeholder='Enter Phone Number'
                    required
                />
                <div className="flex justify-start"
                >
                    <Button type='submit'>
                        Submit
                    </Button>
                </div>
            </form>
            <HistoryTable historyType={"topup"} />
        </div>
    );
};

export default TopUp;