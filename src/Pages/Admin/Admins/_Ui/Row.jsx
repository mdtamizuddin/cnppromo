import { Button, Typography } from '@material-tailwind/react';
import React from 'react';

const Row = ({ user }) => {
    return (
        <tr className="even:bg-blue-gray-50/50">
            <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal">
                    11/12/2024
                </Typography>
            </td>
            <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal">
                    Kashem
                </Typography>
            </td>
            <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal">
                    kashem@gmail.com
                </Typography>
            </td>
            <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal">
                    +8801219389439
                </Typography>
            </td>
            <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal">
                    refferer
                </Typography>
                <Typography variant="small" color="blue-gray" className="font-normal">
                    ref@gmail.com
                </Typography>
            </td>
            <td>
                <ButtonProvider status={"pending"} />
            </td>
            <td>
               <div className='flex flex-col gap-y-1 '>
               {/* <Button size='sm' color='red'>
                    Lock Profile
                </Button> */}
                <Button size='sm' color='green'>
                    Unlock Profile
                </Button>
               </div>
            </td>
        </tr>
    );
};

export default Row;

const ButtonProvider = ({ status, user }) => {
    return (
        <Button size='sm' variant='filled' color={status === "pending" ? "amber" : status === "active" ? "green" : "red"}>
            {
                status === "pending" ? "Pending" : status === "active" ? "Active" : "Rejected"
            }
        </Button>
    )
}