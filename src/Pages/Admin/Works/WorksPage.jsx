import React from 'react';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { category } from './AllWorks';
import WorkCard from './WorkCard';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import Loader from '../../../Components/Loader';
import { api } from '../../../util/axios';
import { Button } from 'antd';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const WorksPage = () => {

    const { id } = useParams()
    const { data, isLoading, refetch } = useQuery({
        queryFn: async () => {
            const res = await api.get(`/work?category=${id || "all"}`)
            return res.data
        },
        queryKey: ["All Works", id]
    })

    if (isLoading) {
        return <Loader />
    }
    return (
        <div className='container mx-auto min-h-[80vh] py-8 home2 px-4'>
            <Link to={'/works'}>
                <Button>
                    <ArrowLeftIcon className='w-5 h-4' />
                    Back To Work Page
                </Button>
            </Link>
            <h1 className='text-2xl font-semibold text-center text-gray-900 mt-5'>Works - {category.find(data => data?.path === id)?.desc || "All"}</h1>
            <h2 className='mt-3 font-semibold text-base'>
                ♻️ধৈর্য, অধ্যাবসায় আর পরিশ্রম, এই তিনটি এক হলে সাফল্যকে আর থামানো যায় না।</h2>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 mt-5" id='works'>
                {
                    data?.works?.length === 0 && <h2 className='text-xl font-semibold text-center text-primary'>No Works Found</h2>
                }
                {
                    data?.works?.map((data, i) => <WorkCard refetch={refetch} key={i} data={data} />)
                }
            </div>
        </div>
    );
};

export default WorksPage;