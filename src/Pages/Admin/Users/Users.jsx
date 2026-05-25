import { Card } from '@material-tailwind/react';
import React from 'react';
import Table from './_Ui/Table';

const Users = () => {

    return (
        <div className='min-h-screen container mx-auto '>
            <Card className='w-full overflow-x-auto'>
                <Table />
            </Card>
        </div>
    );
};

export default Users;