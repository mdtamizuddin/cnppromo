import { Card, Option } from '@material-tailwind/react';
import React from 'react';
import InputFeild, { InputSelect } from '../InputFeild';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { Button } from '@material-tailwind/react';
import { api } from '../../../util/axios';
import Cookie from 'js-cookie';
import WhatUNeed from '../Dialog/WhatUNeed';
import HowTo from '../Dialog/HowTo';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
const Register = () => {
    function generateRandomText(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomText = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomText += charset[randomIndex];
  }
  return randomText;
}

const randomText = generateRandomText(10);

    const [data, setData] = React.useState({
        username: "",
        name: "",
        gender: "Male",
        education: "HSC",
        email: "",
        phone: "",
        password: "",
        confirm: "",
        paymentMethod: "",
        account: "",
        trx: randomText,
        time: new Date(),
        reffer:"",
        fbId: "",
    });
    const updateState = (e, e2) => {
        if (!e2) {
            setData({ ...data, [e.target.name]: e.target.value });
        }
        else {
            setData({ ...data, [e2]: e });
        }
    }

    const getMissingValues = (obj, requiredFields) => {
        const missing = [];
        for (const field of requiredFields) {
            if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
                missing.push(field);
            }
        }
        return missing;
    };
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState(true);
    const [referer, setReferer] = React.useState(true);
    const SubmitHandler = async (e) => {
        e.preventDefault();
        if (!referer) {
            return toast.error("Please enter a valid referer")
        }
        if (!message) {
            return toast.error("Enter an unique username")
        }
        try {
            const missing = getMissingValues(data, ["username", "name",  "email", "phone", "password", "confirm",  "fbId"]);
            if (missing.length > 0) {
                setError("Please fill in all required fields: " + missing.join(", ").toUpperCase())
                return;
            }
            else if (data.password !== data.confirm) {
                setError("Passwords do not match")
                return;
            }
            else {
                setError("")
                data.username = data.username.toLowerCase()
                const res = await api.post('/user', data);
                Cookie.set("token-you", res.data.token, { expires: 30 });
                toast.success("Registration Successful");
                window.location.href = "/";
            }

        } catch (error) {
            setError(error?.response?.data?.message || "Something went wrong")
        }
    }
    const checkUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`/user/check/${data.username.toLowerCase()}`);
            setMessage(res.data.status)
        } catch (error) {
            setError(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    const [open, setOpen] = React.useState(false)
    const [open2, setOpen2] = React.useState(false)
    const [searchParams, setSearchParams] = useSearchParams();


    // Accessing search parameters
    const queryParamValue = searchParams.get('ref');
    useEffect(() => {
        if (queryParamValue) {
            api.get(`/user/search/${queryParamValue}`).then((res) => {
                setReferer(res.data.success)
            })
            setData({ ...data, reffer: queryParamValue })
        }
    }, [queryParamValue])

    return (
        <div className='container mx-auto lg:mt-20 mt-10 min-h-[80vh]'>
            <WhatUNeed open={open} setOpen={setOpen} />
            <HowTo open={open2} setOpen={setOpen2} />
            <Card className='p-10 max-w-[800px] mx-auto' >
                <h1 className='text-2xl font-semibold'>Register in to our site</h1>
                <div className="grid lg:grid-cols-2 grid-cols-1 mt-7 gap-x-5 gap-y-8">
                    <Button color='orange' className='w-full'
                        onClick={() => setOpen(true)}
                    >
                        রেজিস্ট্রেশন করতে কি কি প্রয়োজন ?
                    </Button>
                    <Button color='blue-gray' className='w-full'
                        onClick={() => setOpen2(true)}
                    >
                        কিভাবে রেজিস্ট্রেশন করবেন ?
                    </Button>
                </div>
                <form onSubmit={(e) => SubmitHandler(e)} className="lg:grid flex flex-col lg:grid-cols-2 grid-cols-1 mt-10 gap-x-5 lg:gap-y-8 gap-y-5">
                    <InputFeild
                        label={`Username (${!message ? "Not Available" : "Available"})`}
                        type="text"
                        name="username"
                        placeholder="Enter Your Name"
                        value={data.username}
                        onChange={(e) => {
                            updateState(e);
                        }}
                        onBlur={(e) => checkUser(e)}
                        required
                        error={!message}
                    />
                    <InputFeild
                        label="Full Name"
                        type="text"
                        name="name"
                        placeholder="Enter Your Name"
                        value={data.name}
                        onChange={(e) => updateState(e)}
                        required
                    />
                    <InputFeild
                        label="Email"
                        type="text"
                        name="email"
                        placeholder="Enter Your Email"
                        value={data.email}
                        onChange={(e) => updateState(e)}
                        required
                    />

                    {/* <PhoneInput
                        international
                        countryCallingCodeEditable={false}
                        defaultCountry="BD"
                        value={data.phone}
                        onChange={(e) => updateState(e, "phone")}
                        className='w-full'
                        required
                    /> */}
                    <InputFeild
                        label="Whatsapp Number"
                        type="text"
                        name="phone"
                        placeholder="Enter your whatsapp number"
                        value={data.phone}
                        onChange={(e) => updateState(e)}
                        required
                    />
                    {/* <InputSelect
                        required
                        label="Gender"
                        name="gender"
                        value={data.gender}
                        onChange={(e) => updateState(e, "gender")}
                    >
                        <Option value="">Select Gender</Option>
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                    </InputSelect> */}
                    {/* <InputSelect

                        label="Education Level"
                        name="education"
                        value={data.education}
                        onChange={(e) => updateState(e, "education")}
                    >
                        <Option value="">Select Education</Option>
                        <Option value="JSC">JSC</Option>
                        <Option value="SSC">SSC</Option>
                        <Option value="HSC">HSC</Option>
                        <Option value="Diploma">Diploma</Option>
                        <Option value="Masters">Masters</Option>
                        <Option value="BSC">BSC</Option>
                        <Option value="Masters">Masters</Option>
                    </InputSelect> */}
                    <InputFeild
                        required
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Enter Your Password"
                        value={data.password}
                        onChange={(e) => updateState(e)}
                    />
                    <InputFeild
                        required
                        label="Confirm Password"
                        type="password"
                        name="confirm"
                        placeholder="Enter Confirm Password"
                        value={data.confirm}
                        onChange={(e) => updateState(e)}
                        error={data.password !== data.confirm}
                    />
                    {/* <InputSelect
                        label="Payment Method"
                        name="paymentMethod"
                        value={data.paymentMethod}
                        onChange={(e) => updateState(e, "paymentMethod")}
                    >
                        <Option value="">Select Payment Method</Option>
                        <Option value="Bkash">Bkash</Option>
                        <Option value="Rocket">Rocket</Option>
                        <Option value="Nagad">Nagad</Option>
                        <Option value="Upay">Upay</Option>
                        <Option value="Bank Transfer">Bank Transfer</Option>
                    </InputSelect> */}
                    {/* <InputFeild
                        required
                        label="Account Number"
                        type="number"
                        name="account"
                        placeholder="Enter Your Account Number"
                        value={data.account}
                        onChange={(e) => updateState(e)}
                    /> */}
                    {/* <InputFeild
                        required
                        label="Payment Time"
                        type="datetime-local"
                        name="time"
                        placeholder="Enter Payment Time"
                        value={data.time}
                        onChange={(e) => updateState(e)}
                    /> */}
                    {/* <InputFeild
                        required
                        label="Transaction Id"
                        type="text"
                        name="trx"
                        placeholder="Enter Your Transaction Id"
                        value={data.trx}
                        onChange={(e) => updateState(e)}
                    /> */}
                    <InputFeild
                        label={`(${!referer ? "Invalid Referer" : "Reference Id" })`}
                        type="text"
                        name="reffer"
                        placeholder="Enter Your Reference Id"
                        value={data.reffer}
                        error={queryParamValue && !referer}
                        onChange={(e) => updateState(e)}
                    />
                    <InputFeild
                        required
                        label="Facebook Id"
                        type="text"
                        name="fbId"
                        placeholder="Enter Your Facebook Id"

                        value={data.fbId}
                        onChange={(e) => updateState(e)}
                    />

                    <p className='text-red-500 text-xs col-span-2'>
                        {error}
                    </p>
                    <div className="col-span-2 flex justify-center mt-5">
                        <Button type='filled' color='green'
                            className='px-10'
                        >
                            Register
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Register;

