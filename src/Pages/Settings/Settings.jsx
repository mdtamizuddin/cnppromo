import React from 'react';
import InputFeild, { InputSelect } from '../Auth/InputFeild';
import { Option } from '@material-tailwind/react';
import { Button } from '@material-tailwind/react';
import { useEffect } from 'react';
import { api } from '../../util/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Switch } from '@material-tailwind/react';
import Loader from '../../Components/Loader';
import { Textarea } from '@material-tailwind/react';

const Settings = ({ }) => {
    const { user } = useSelector(state => state.user)

    const [settings, setSettings] = React.useState(null)

    useEffect(() => {
        try {
            api.get('/setting')
                .then(res => setSettings(res.data?.setting || {}))
        } catch (error) {
            console.log(error);
        }
    }, [user])
    const [loading, setLoading] = React.useState(false)
    const updateProfile = async (e) => {
        try {
            setLoading(true)
            const res = await api.put('/setting', settings);
            toast.success("Settings Updated")
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    if (!settings || loading) {
        return <Loader />
    }

    return (
        <main className='min-h-[80vh] lg:px-0 px-5 py-10'>
            <h1 className='text-center text-3xl font-semibold py-5'>Site Settings</h1>
            <div className='grid lg:grid-cols-3 grid-cols-1 gap-7 mt-8 container mx-auto '>
                <div className='col-span-1 flex flex-col gap-5'>
                    <h1 className='mb-2'>Basic Info</h1>
                    <Textarea
                        label="Notice"
                        type="text"
                        name="notice"
                        value={settings?.notice}
                        onChange={(e) => setSettings({ ...settings, notice: e.target.value })}
                        variant={"outlined"}
                    /><InputFeild
                        label="Site Name"
                        type="text"
                        name="siteName"
                        value={settings?.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        variant={"outlined"}
                    />
                    <InputFeild 
                        label="Site Logo"
                        type="text"
                        name="siteLogo"
                        value={settings?.siteLogo}
                        variant={"outlined"}
                        onChange={(e) => setSettings({ ...settings, siteLogo: e.target.value })}
                    />
                    <InputFeild
                        label="Active Fee"
                        type="text"
                        value={settings?.acAmm}
                        variant={"outlined"}
                        onChange={(e) => setSettings({ ...settings, acAmm: e.target.value })}
                    />
                    <InputFeild
                        label="Video Link"
                        type="text"
                        name="siteLogo"
                        value={settings?.ht_video}
                        variant={"outlined"}
                        onChange={(e) => setSettings({ ...settings, ht_video: e.target.value })}
                    />
                    <div className="flex gap-3 items-center p-2">
                        <label htmlFor="reg">Register</label>
                        <Switch id='reg' color='green' checked={settings?.register}
                            onChange={(e) => setSettings({ ...settings, register: e.target.checked })}
                        />
                    </div>
                    <div className="flex gap-3 items-center p-2">
                        <label htmlFor="reg">Withdraw</label>
                        <Switch id='reg' color='green' checked={settings?.withdraw}
                            onChange={(e) => setSettings({ ...settings, withdraw: e.target.checked })}
                        />
                    </div>
                    <Button
                        disabled={loading}
                        onClick={updateProfile}
                        type='submit'
                        className='w-full py-2 bg-green-500 text-white rounded-md'>Update Setting</Button>
                </div>
                <div className='col-span-1 flex flex-col gap-5'>
                    <h1 className='mb-2'>Refer Commition</h1>
                    <InputFeild
                        label="Generation 1"
                        type="number"
                        value={settings?.ref_comm.gen1}
                        onChange={(e) => setSettings({ ...settings, ref_comm: { ...settings?.ref_comm, gen1: Number(e.target.value) } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Generation 2"
                        type="number"
                        value={settings?.ref_comm.gen2}
                        onChange={(e) => setSettings({ ...settings, ref_comm: { ...settings?.ref_comm, gen2: Number(e.target.value) } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Generation 3"
                        type="number"
                        value={settings?.ref_comm.gen3}
                        onChange={(e) => setSettings({ ...settings, ref_comm: { ...settings?.ref_comm, gen3: Number(e.target.value) } })}
                        variant={"outlined"}
                    />

                    <InputFeild
                        label="Generation 4"
                        type="number"
                        value={settings?.ref_comm.gen4}
                        onChange={(e) => setSettings({ ...settings, ref_comm: { ...settings?.ref_comm, gen4: Number(e.target.value) } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Generation 5"
                        type="number"
                        value={settings?.ref_comm.gen5}
                        onChange={(e) => setSettings({ ...settings, ref_comm: { ...settings?.ref_comm, gen5: Number(e.target.value) } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Generation 6"
                        type="number"
                        value={settings?.ref_comm.gen6}
                        onChange={(e) => setSettings({ ...settings, ref_comm: { ...settings?.ref_comm, gen6: Number(e.target.value) } })}
                        variant={"outlined"}
                    />
                    <Button
                        onClick={updateProfile}
                        disabled={loading}
                        type='submit'
                        className='w-full py-2 bg-green-500 text-white rounded-md'>Update Setting</Button>
                </div>
                <div className='col-span-1 flex flex-col gap-5'>
                    <h1 className='mb-2'>Account Infomation</h1>
                    <InputFeild
                        label="Phone Number"
                        type="text"
                        value={settings?.accounts?.phone}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, phone: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Email Address"
                        type="email"
                        value={settings?.accounts?.email}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, email: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Bkash Number"
                        type="text"
                        value={settings?.accounts?.bkash}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, bkash: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Nagad"
                        type="text"
                        value={settings?.accounts?.nagad}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, nagad: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Rocket"
                        type="text"
                        value={settings?.accounts?.rocket}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, rocket: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Upay"
                        type="text"
                        value={settings?.accounts?.upay}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, upay: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Payeer"
                        type="text"
                        value={settings?.accounts?.payeer}
                        onChange={(e) => setSettings({ ...settings, accounts: { ...settings?.accounts, payeer: e.target.value } })}
                        variant={"outlined"}
                    />

                    <Button
                        onClick={updateProfile}
                        disabled={loading}
                        type='submit'
                        className='w-full py-2 bg-green-500 text-white rounded-md'>Update Setting</Button>
                </div>
                <div className='col-span-1 flex flex-col gap-5'>
                    <h1 className='mb-2'>Account Infomation</h1>
                    <InputFeild
                        label="Facebook Page"
                        type="text"
                        value={settings?.links?.page}
                        onChange={(e) => setSettings({ ...settings, links: { ...settings?.links, page: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Telegram"
                        type="text"
                        value={settings?.links?.telegram}
                        onChange={(e) => setSettings({ ...settings, links: { ...settings?.links, telegram: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Facebook Group"
                        type="text"
                        value={settings?.links?.facebook}
                        onChange={(e) => setSettings({ ...settings, links: { ...settings?.links, facebook: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Whatsapp Group"
                        type="text"
                        value={settings?.links?.whatsapp}
                        onChange={(e) => setSettings({ ...settings, links: { ...settings?.links, whatsapp: e.target.value } })}
                        variant={"outlined"}
                    />
                    <InputFeild
                        label="Video Link"
                        type="text"
                        value={settings?.links?.video}
                        onChange={(e) => setSettings({ ...settings, links: { ...settings?.links, video: e.target.value } })}
                        variant={"outlined"}
                    />
                    <Button
                        onClick={updateProfile}
                        disabled={loading}
                        type='submit'
                        className='w-full py-2 bg-green-500 text-white rounded-md'>Update Setting</Button>
                </div>
            </div>
        </main>
    );
};

export default Settings;