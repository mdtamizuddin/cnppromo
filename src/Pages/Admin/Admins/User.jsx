import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../../util/axios';

const User = () => {
    const { id } = useParams()
    const { data, isLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const res = await api.get(`/user/${id}`)
            return res.data
        }
    })
    return (
        <div className='container mx-auto min-h-screen'>

        </div>
    );
};

export default User;