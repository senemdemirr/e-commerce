"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CelebrationIcon from '@mui/icons-material/Celebration';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const orderNumber = searchParams.get("orderNumber") || "#000000";
    const total = searchParams.get("total") || "0.00";
    const subtotal = searchParams.get("subtotal") || "0.00";
    const shipping = searchParams.get("shipping") || "0.00";

    // Format estimate date (3-5 days from now)
    const [estimateDate, setEstimateDate] = useState("");

    useEffect(() => {
        const start = new Date();
        start.setDate(start.getDate() + 3);
        const end = new Date();
        end.setDate(end.getDate() + 5);

        const options = { day: 'numeric', month: 'long' };
        setEstimateDate(`${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`);
    }, []);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <main className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            {/* Success Animation Placeholder / Icon */}
                            <div className="mb-8 relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <div className="relative flex items-center justify-center w-24 h-24 bg-primary text-white rounded-full shadow-lg shadow-primary/40 mb-4 mx-auto">
                                    <CheckCircleIcon sx={{ fontSize: 48 }} />
                                </div>
                            </div>

                            {/* HeadlineText */}
                            <div className="max-w-[720px] mx-auto">
                                <h1 className="text-text-dark dark:text-white tracking-tight text-[28px] sm:text-[32px] md:text-[40px] font-black leading-tight pb-3 pt-2">
                                    Thank You For Your Order!
                                </h1>
                                <p className="text-text-muted dark:text-gray-400 text-base sm:text-lg font-normal leading-normal pb-8">
                                    Your order has been successfully received and is being carefully prepared by our team.
                                </p>
                            </div>

                            {/* Card (Order Summary) */}
                            <div className="w-full max-w-[640px] px-4">
                                <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white dark:bg-surface-dark overflow-hidden border border-[#f1f3f2] dark:border-gray-800">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-[21/9] bg-cover flex items-center justify-center"
                                        style={{ backgroundImage: `linear-gradient(135deg, #8dc8a1 0%, #A0C8A0 100%)` }}
                                    >
                                        <LocalShippingIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.9)' }} />
                                    </div>
                                    <div className="flex w-full grow flex-col items-stretch justify-center gap-4 p-6 md:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-4 gap-3">
                                            <div className="text-left">
                                                <p className="text-text-dark dark:text-white text-xl font-bold leading-tight tracking-tight">
                                                    Order Summary
                                                </p>
                                                <p className="text-primary font-bold text-sm mt-1">{orderNumber}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                    Estimated Delivery
                                                </p>
                                                <div className="flex items-center gap-2 text-accent font-bold">
                                                    <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                                    <span>{estimateDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-muted dark:text-gray-400">Products</span>
                                                <span className="font-semibold text-text-dark dark:text-white">₺{parseFloat(subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-muted dark:text-gray-400">Shipping</span>
                                                <span className={`font-semibold ${parseFloat(shipping) === 0 ? 'text-primary' : 'text-text-dark dark:text-white'}`}>
                                                    {parseFloat(shipping) === 0 ? 'Free' : `₺${parseFloat(shipping).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                                <span className="text-text-dark dark:text-white">Total</span>
                                                <span className="text-text-dark dark:text-white text-2xl">₺{parseFloat(total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ButtonGroup */}
                            <div className="flex justify-center mt-12 w-full">
                                <div className="flex flex-col sm:flex-row flex-1 gap-4 px-0 sm:px-4 py-3 max-w-[540px] justify-center">
                                    <button
                                        onClick={() => router.push('/')}
                                        className="flex sm:min-w-[140px] w-full sm:w-auto cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-8 bg-primary text-white text-base font-bold leading-normal tracking-wide grow shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                                    >
                                        <HomeIcon />
                                        <span className="truncate">Return to Home</span>
                                    </button>
                                    <button
                                        onClick={() => router.push(`/my-profile/orders/${orderNumber.replace('#', '')}`)}
                                        className="flex sm:min-w-[140px] w-full sm:w-auto cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-8 bg-[#f1f3f2] dark:bg-surface-dark text-text-dark dark:text-white text-base font-bold leading-normal tracking-wide grow hover:bg-gray-200 dark:hover:bg-gray-800 transition-all active:scale-95 border border-transparent dark:border-gray-700"
                                    >
                                        <ReceiptLongIcon />
                                        <span className="truncate">Order Details</span>
                                    </button>
                                </div>
                            </div>
                        </main>

                        {/* Extra Decorative Floating Element */}
                        <div className="fixed bottom-10 right-10 hidden lg:block opacity-20 pointer-events-none">
                            <CelebrationIcon sx={{ fontSize: 120, color: 'var(--accent, #F0B48C)' }} className="rotate-12" />
                        </div>
                        <div className="fixed top-24 left-10 hidden lg:block opacity-10 pointer-events-none">
                            <AutoAwesomeIcon sx={{ fontSize: 80, color: 'var(--primary, #8dc8a1)' }} className="-rotate-12" />
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .confetti-bg {
                    background-image: radial-gradient(#8dc8a1 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
