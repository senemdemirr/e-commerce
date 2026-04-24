"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const fallbackCampaigns = [
    {
        id: 'demo-1',
        title: 'Özel İndirim Günleri!',
        description: 'Tüm seçili ürünlerde sepette ekstra %20 indirim fırsatını kaçırmayın.',
        code: 'INDIRIM20',
        discount_type: 'percent',
        discount_value: 20
    },
    {
        id: 'demo-2',
        title: 'Bahar Fırsatları',
        description: 'Giyiminize bahar havası katın. Sepette anında 50 TL indirim.',
        code: 'BAHAR50',
        discount_type: 'fixed',
        discount_value: 50
    }
];

export default function CampaignSlider({ campaigns }) {
    // If no campaigns from API, use fallback campaigns so the slider is always visible
    const displayCampaigns = campaigns && campaigns.length > 0 ? campaigns : fallbackCampaigns;

    return (
        <div className="w-full max-w-[1400px] mx-auto my-10 px-4 md:px-8">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={displayCampaigns.length > 1}
                className="rounded-3xl overflow-hidden shadow-2xl bg-gray-900 group/swiper"
            >
                {displayCampaigns.map((campaign, index) => {
                    // Generate a random image using picsum for each slide
                    const bgImage = `https://picsum.photos/1600/600?random=${campaign.id || index}`;
                    
                    return (
                        <SwiperSlide key={campaign.id || index}>
                            <div 
                                className="relative py-16 px-6 md:px-20 text-white min-h-[380px] md:min-h-[500px] flex flex-col justify-center items-center text-center overflow-hidden group"
                            >
                                {/* Background Image */}
                                <div 
                                    className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${bgImage}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                                
                                {/* Dark Gradient Overlay to ensure text pops */}
                                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 w-full h-full transition-opacity duration-700 group-hover:opacity-90"></div>
                                
                                {/* Content Wrap */}
                                <div className="relative z-10 flex flex-col items-center max-w-5xl w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-2xl tracking-tight leading-tight">
                                        {campaign.title}
                                    </h2>
                                    <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 font-light leading-relaxed max-w-3xl opacity-90 drop-shadow-md">
                                        {campaign.description}
                                    </p>
                                    
                                    <div className="relative inline-flex items-center justify-center group/btn cursor-pointer">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-md opacity-60 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                                        <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 md:py-4 px-8 md:px-12 rounded-full overflow-hidden transition-all duration-300 hover:bg-white hover:text-black">
                                            <span className="uppercase tracking-[0.2em] text-xs md:text-sm font-semibold opacity-70 mr-4 group-hover/btn:text-gray-500 transition-colors">KODU KULLAN:</span>
                                            <span className="uppercase tracking-widest text-lg md:text-2xl font-black">{campaign.code}</span>
                                        </div>
                                    </div>

                                    {/* Discount Badge */}
                                    {campaign.discount_type && (
                                        <div className="absolute -top-10 md:-top-4 -right-2 md:right-4 bg-gradient-to-tr from-yellow-400 to-yellow-300 text-yellow-900 font-black py-2 md:py-3 px-5 md:px-8 rounded-2xl text-base md:text-xl transform md:rotate-6 shadow-2xl border-2 border-yellow-200 animate-pulse">
                                            {campaign.discount_type === 'percent' 
                                                ? `%${campaign.discount_value}` 
                                                : `${campaign.discount_value} TL`}
                                            <div className="text-[10px] md:text-xs uppercase opacity-80 -mt-1">İndirim</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
