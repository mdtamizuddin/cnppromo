import { Card } from '@material-tailwind/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const Account = () => {
    const navigation = [
        {
            label: "Top Up Balance",
            path: "/account"
        },
        {
            label: "Withdraw",
            path: "/account/withdraw"
        }
    ]
    const path = useLocation()
    const { user } = useSelector(state => state.user)
    return (
        <div className='container mx-auto lg:py-20 py-10 px-2'>
            <div className="flex text-3xl justify-center items-center gap-1">
                <Cash />
                <h1 className='text-center '>
                    Balance
                </h1>
            </div>

            <div className="mt-5 border-[1.5px] border-red-800 rounded-md grid lg:grid-cols-1 grid-cols-1 overflow-hidden gap-2 p-2 bg-white">
                <BalanceCard
                    amount={user.balance}
                    title={"In your total balance"}
                />
                {/* <BalanceCard
                    amount={user.balance}
                    title={"In your referral balance"}
                />
                <BalanceCard
                    amount={user.balance}
                    title={"In your others balance"}
                /> */}
            </div>
            <Card className='border-t-[3px] mt-7 border-[#E51047] bg-white rounded-none pb-10'>
                <h2 className='text-center text-sm py-3'>
                    Balance transactions
                </h2>
                <hr />
                <div className='pt-2 px-5 border-b flex items-center gap-3'>
                    {
                        navigation.map((item) => {
                            return <Link key={item.label} to={item.path} className={`${path.pathname === item.path && "border-b-2"} border-[#E51047] text-sm pb-1`}>
                                {item.label}
                            </Link>
                        })
                    }
                </div>
                <div className="p-5">
                    <Outlet />
                </div>
            </Card>
        </div>
    );
};

export default Account;

const TakaCard = () => {
    return <div className='border-2 border-[#E51047] p-1 w-[60px] h-[60px] flex justify-center items-center rounded-full'>
        <div className='bg-[#E51047] w-full h-full flex justify-center items-center text-sm text-white rounded-full '>
            Taka
        </div>
    </div>
}

const BalanceCard = ({ amount, title }) => {
    return <div className='px-5 py-2 bg-red-50 flex items-center gap-5 rounded '>
        <TakaCard amount={10} />
        <div>
            <h3 className='font-semibold'>
                {amount}
            </h3>
            <h4 className='mt-1 text-sm text-[#E51047]'>
                {title}
            </h4>
        </div>
    </div>
}

const Cash = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 7.5.415-.207a.75.75 0 0 1 1.085.67V10.5m0 0h6m-6 0h-1.5m1.5 0v5.438c0 .354.161.697.473.865a3.751 3.751 0 0 0 5.452-2.553c.083-.409-.263-.75-.68-.75h-.745M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
}