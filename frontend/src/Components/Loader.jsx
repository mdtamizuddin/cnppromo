import React from 'react';
import { InfinitySpin } from 'react-loader-spinner';
const Loader = () => {
    return (
        <div className='h-full w-full flex justify-center items-center min-h-[300px] z-50'>
            <InfinitySpin
                visible={true}
                width="200"
                color="#fd1d1ddc"
                ariaLabel="infinity-spin-loading"
            />
        </div>
    );
};

export default Loader;