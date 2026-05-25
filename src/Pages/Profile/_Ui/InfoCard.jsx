import { Card } from '@material-tailwind/react';
import React from 'react';
import Badge from '../Badge';

const InfoCard = ({ level, option, option2 }) => {
    return (
        <Card className='px-5 py-8 lavel-card w-full lg:w-auto'>
            <div className="mx-auto">
                <Badge number={level} />
            </div>
            <h3 className='text-center text-gray-800 text-sm mt-2'>
                <strong>প্রয়োজন:</strong> {option}
            </h3>
            <h3 className='text-center text-gray-800 text-sm mt-2'>
                <strong>প্রদান: </strong> {option2}
            </h3>
        </Card>
    );
};

export default InfoCard;