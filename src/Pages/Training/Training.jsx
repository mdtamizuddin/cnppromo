import { Avatar } from '@material-tailwind/react';
import React from 'react';
import whatsapp from './wp.png';
import tg from './telegram.png';
import fb from './fb.png';
import { Card } from '@material-tailwind/react';
import { useSelector } from 'react-redux';
import member1 from './members/1.jpeg'
import member2 from './members/2.jpeg'
import member3 from './members/3.jpeg'
import { Button } from 'antd';

const Training = () => {
    const { settings } = useSelector(state => state.user)
    const supports = [
        {
            name: "Promity Remeen",
            title: "CNP Promo Trainer & Admin",
            image: member1,
            time: <span>(4:00 PM to 6:00 PM and <br /> 9:00 PM to 11:00 PM)</span>,
            whatsapp: "https://wa.me/+8801772271543",
        }, {
            name: "Fariya",
            title: "CNP Promo Trainer & Admin",
            image: member2,
            time: <span>(8:00 PM to 10:00 PM and <br /> 6:00 PM to 18:00 PM)</span>,
            whatsapp: "https://wa.me/+8801879081165",
        } ,{
            name: "Ohona moni priya",
            title: "Main Admin",
            image: member3,
            time: <span>(6:00 PM to 9:00 PM)</span>,
            whatsapp: "https://wa.me/+8801731686679",
        }
    ]
    return (
        <div className='bg-gradient-to-tl from-[#e2e6f0] to-[#c1cbef] lg:p-0 p-4'>
            <div className='container mx-auto min-h-[80vh] py-10 '>
            <div className='flex flex-wrap justify-center gap-5'>
                {
                    supports.map((item, index) => (
                        <Card key={index} className='px-5 py-8 lg:w-[300px] md:w-[45%] w-full flex flex-col justify-center items-center bg-gradient-to-bl from-primary to-[#c1cbef] text-white'>
                            <Avatar
                                variant="circular"
                                size="xxl"
                                className='bg-white'
                        alt='AVATAR'
                        src='https://static.vecteezy.com/system/resources/thumbnails/035/270/738/small_2x/ai-generated-female-customer-service-agent-on-transparent-background-ai-generated-png.png'
                            />
                            <p className='text-center text-lg mt-3 '>{item.name}</p>
                            <p className='text-sm text-center h-[60px] mt-2'>{item.title}</p>
                            <p className='text-sm text-center h-[60px]'>
                            Training time: <br /> {item.time}
                            </p>
                         <a href={item.whatsapp}
                         target='_blank' className='mt-3'>
                         <Button>
                                <img loading="lazy" src={whatsapp} className="h-6 w-6" alt="" />
                                WhatsApp
                            </Button>
                         </a>
                        </Card>
                    ))
                }
                {/* <CardG
                    name={"Whatsapp Group"}
                    logo={whatsapp}
                    link={settings?.links?.whatsapp}
                />
                <CardG
                    name={"Telegram Group"}
                    logo={tg}
                    link={settings?.links?.telegram}
                />
                <CardG
                    name={"Facebook Group"}
                    logo={fb}
                    link={settings?.links?.facebook}
                /> */}
            </div>

        </div>
        </div>
    );
};

export default Training;

const CardG = ({ name, logo, link }) => {
    return (
        <Card className='px-5 py-8 max-w-[250px] flex flex-col justify-center items-center'>
            <a href={link} target="_blank" rel="noreferrer">
                <Avatar
                    variant="circular"
                    size="xxl"
                    src={logo}
                />
            </a>
            {<a href={link} target="_blank" rel="noreferrer" className='text-center text-lg mt-3'>{name}</a>}
        </Card>
    )
}   