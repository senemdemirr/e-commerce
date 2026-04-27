'use client';

import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { listFallbackCampaignSliderRecords } from '@/lib/admin/test-data';

export default function CampaignSlider({ campaigns }) {
    const displayCampaigns = useMemo(
        () => (Array.isArray(campaigns) && campaigns.length > 0
            ? campaigns
            : listFallbackCampaignSliderRecords()),
        [campaigns]
    );

    return (
        <div className="mx-auto my-10 w-full max-w-[1400px] px-4 md:px-8">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={displayCampaigns.length > 1}
                className="group/swiper overflow-hidden rounded-3xl bg-gray-900 shadow-2xl"
            >
                {displayCampaigns.map((campaign, index) => {
                    const bgImage = `https://picsum.photos/1600/600?random=${campaign.id || index}`;

                    return (
                        <SwiperSlide key={campaign.id || index}>
                            <div className="group relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center text-white md:min-h-[500px] md:px-20">
                                <div
                                    className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${bgImage}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />

                                <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-t from-black/90 via-black/50 to-black/30 transition-opacity duration-700 group-hover:opacity-90" />

                                <div className="relative z-10 flex w-full max-w-5xl translate-y-4 flex-col items-center transition-transform duration-500 group-hover:translate-y-0">
                                    <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-transparent drop-shadow-2xl bg-clip-text bg-gradient-to-r from-white to-gray-300 sm:text-5xl md:mb-6 md:text-7xl">
                                        {campaign.title}
                                    </h2>
                                    <p className="mb-8 max-w-3xl text-lg font-light leading-relaxed opacity-90 drop-shadow-md sm:text-xl md:mb-12 md:text-2xl">
                                        {campaign.description}
                                    </p>

                                    <div className="group/btn relative inline-flex cursor-pointer items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-60 blur-md transition-opacity duration-300 group-hover/btn:opacity-100" />
                                        <div className="relative flex items-center overflow-hidden rounded-full border border-white/20 bg-white/10 px-8 py-3 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black md:px-12 md:py-4">
                                            <span className="mr-4 text-xs font-semibold uppercase tracking-[0.2em] opacity-70 transition-colors group-hover/btn:text-gray-500 md:text-sm">
                                                CODE:
                                            </span>
                                            <span className="text-lg font-black uppercase tracking-widest md:text-2xl">
                                                {campaign.code}
                                            </span>
                                        </div>
                                    </div>

                                    {campaign.discount_type ? (
                                        <div className="absolute -right-2 -top-10 rounded-2xl border-2 border-yellow-200 bg-gradient-to-tr from-yellow-400 to-yellow-300 px-5 py-2 text-base font-black text-yellow-900 shadow-2xl animate-pulse md:-right-4 md:-top-4 md:px-8 md:py-3 md:text-xl md:rotate-6">
                                            {campaign.discount_type === 'percent'
                                                ? `%${campaign.discount_value}`
                                                : `${campaign.discount_value} TL`}
                                            <div className="text-[10px] uppercase opacity-80 md:text-xs">
                                                Discount
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
