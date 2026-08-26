import React from 'react';
import { Flat, } from '@alptugidin/react-circular-progress-bar'
import { Card } from '@material-tailwind/react';
import { useSelector } from 'react-redux';
const ReferralInfo = () => {
    const { settings } = useSelector(state => state.user)
    return (
        <section className='pb-20 pt-20 gradiant-bg'>
            <div className='container mx-auto'>
                <h2 className='text-3xl font-bold text-center text-primary'>
                    Referral Informations
                </h2>
                <div className="grid lg:grid-cols-6 grid-cols-2 p-5 mt-10 gap-10">
                    <ProgessCircle
                        index={1}
                        number={settings?.ref_comm?.gen1}
                        color={'green'}
                    />
                    <ProgessCircle
                        index={2}
                        number={settings?.ref_comm?.gen2}
                        color={'blue'}
                    />
                    <ProgessCircle
                        index={3}
                        number={settings?.ref_comm?.gen3}
                        color={'magenta'}
                    />
                    <ProgessCircle
                        index={4}
                        number={settings?.ref_comm?.gen4}
                        color={'yellow'}
                    />
                    <ProgessCircle
                        index={5}
                        number={settings?.ref_comm?.gen5}
                        color={'black'}
                    />
                    <ProgessCircle
                        index={6}
                        number={settings?.ref_comm?.gen6}
                        color={'red'}
                    />
                </div>
            </div>


        </section>
    );
};

export default ReferralInfo;

const ProgessCircle = ({ number, color, index }) => {
    return <Card className='p-5'>
        <h3 className='text-sm  text-center text-black mb-2'>
            Generation {index}
        </h3>
        <Flat
            progress={number}
            range={{ from: 0, to: 25 }}
            sign={{ value: '', position: 'end' }}
            text={'Taka'}
            showMiniCircle={true}
            showValue={true}
            sx={{
                strokeColor: color,
                barWidth: 5,
                bgStrokeColor: '#ffffff',
                bgColor: { value: '#000000', transparency: '10' },
                shape: 'full',
                strokeLinecap: 'round',
                valueSize: 11,
                valueWeight: 'semibold',
                valueColor: '#000000',
                valueFamily: 'Trebuchet MS',
                textSize: 10,
                textWeight: 'normal',
                textColor: '#000000',
                loadingTime: 1000,
                miniCircleColor: color,
                miniCircleSize: 5,
                valueAnimation: true,
                intersectionEnabled: true
            }}
        />
    </Card>
}