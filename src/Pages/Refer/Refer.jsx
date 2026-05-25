import { Button } from '@material-tailwind/react';
import { Card } from '@material-tailwind/react';
import React from 'react';
import ReferHistory from './ReferHistory';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Refer = () => {
    const { user } = useSelector(state => state.user)
    const [refLink, setRefLink] = React.useState("")
    useEffect(() => {
        setRefLink(`${window.location.origin}/register?ref=${user.username}`)
    }, [user])
    return (
        <div className='container mx-auto py-20 px-5'>
            <Card className='rounded'>
                <div className="bg-primary px-7 py-2">
                    <h2 className='font-semibold text-center text-white'>
                        Referrer/Upline Info
                    </h2>
                </div>
                <div className='px-5 py-8 '>
                    <h3 className='text-sm'>
                        Your referrer name : <strong>
                            {user?.reffer?.name || "N/A"}
                        </strong>
                    </h3>
                    <h3 className='text-sm mt-2'>
                        Your referrer whatsapp : {
                            user?.reffer?.whatsapp ?
                                <a
                                    className='text-blue-700'
                                    href={`https://wa.me/${user?.reffer?.phone}`} target='_blank'>
                                    {user?.reffer?.phone}
                                </a>
                                :
                                "N/A"
                        }
                    </h3>
                </div>
            </Card>

            <Card className='rounded mt-7'>
                <div className="bg-primary px-7 py-2">
                    <h2 className='font-semibold text-white text-center'>
                        Referral link
                    </h2>
                </div>
                <div className='px-10 py-8 flex lg:flex-row flex-col gap-3 justify-between items-center'>
                    <h4 className='text-sm'>
                        Your referral link is
                    </h4>
                    <a href={refLink}>
                        {refLink}
                    </a>
                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(refLink)
                            toast.success("Copied!")
                        }}
                    >
                        Copy Link
                    </Button>
                </div>
            </Card>
            <ReferHistory />
        </div>
    );
};

export default Refer;