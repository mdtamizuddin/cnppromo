import React from 'react';
import Form from './Form';
import AllWorks from './AllWorks';
import { useQuery } from 'react-query';
import { api } from '../../../util/axios';
import Loader from '../../../Components/Loader';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

const Works = () => {
    const { user } = useSelector(state => state.user)
  
    return (
        <div className='container mx-auto min-h-[80vh] py-10 home2'>
            {
                user?.role === "admin" && <>
                    <h1 className='text-4xl text-center'>Manage Works</h1>
                    <Form  />
                </>
            }
            <AllWorks  />
        </div>
    );
};

export default Works;