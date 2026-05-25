
import React from 'react';
import ReactPlayer from 'react-player';
import LinkifyText from '../../../util/linkify';

const WorkDetails = ({ data }) => {

    return (
        <div className='min-h-[80vh] container mx-auto lg:px-4'>
            <ReactPlayer url={data?.link} width={"100%"} style={{
                borderRadius: "10px",
                marginTop: "10px",
                maxHeight: "500px"
            }}
            />
            <h1 className='mt-4 text-xl'>
                <LinkifyText text={data?.name} />
            </h1>
            <p className='mt-3 text-sm mb-2'

            >
                <LinkifyText text={data?.desc} />
            </p>
        </div>
    );
};

export default WorkDetails;