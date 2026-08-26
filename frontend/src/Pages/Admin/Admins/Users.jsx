import { Card } from '@material-tailwind/react';
import React from 'react';
import Table from './_Ui/Table';

const Admins = ({ moderator}) => {

    return (
        <div className='min-h-screen container mx-auto '>
            <Card className='w-full overflow-x-auto'>
                <Table moderator={moderator} />
            </Card>
        </div>
    );
};

export default Admins;