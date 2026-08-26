import { Button } from '@material-tailwind/react';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';

import { Autoplay, Pagination } from 'swiper/modules';
import { Image } from 'antd';

const reviews = Array.from({ length: 13 }, (_, i) => `/reviews-images/image-${i + 1}.jpeg`);

const Reviews = () => {
    return (
        <div className='text-black py-20'>
            <h2 className='text-3xl font-bold text-center text-black'>
                Reviews
            </h2>
            <p className='text-center text-black mt-1'>
                Some reviews from our workers
            </p>
            <div className="container mx-auto p-5 lg:p-0">
                <Swiper
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    slidesPerView={2}
                    breakpoints={{
                        320: { slidesPerView: 2 },
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 4 },
                        1280: { slidesPerView: 5 },
                    }}
                    spaceBetween={20}
                    pagination={{ clickable: true }}
                    modules={[Autoplay, Pagination]}
                    className="mt-10"
                    lazyPreloadPrevNext={1}
                >
                    {reviews.map((image, index) => (
                        <SwiperSlide key={index}>
                            <Image src={image} alt={`review-${index}`} className="w-full max-h-[450px] object-cover" loading="lazy" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default Reviews;
