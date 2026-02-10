import React from 'react';
import { useRouter } from 'next/navigation';
import {
    AssignmentReturn,
    Schedule,
    ReceiptLong,
    Home,
    SupportAgent,
    VerifiedUser,
    LocalShipping,
    Payments
} from '@mui/icons-material';

const CancelSuccess = ({ order, isReturn = false }) => {
    const router = useRouter();

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 bg-background-light dark:bg-background-dark min-h-[80vh]">
            {/* Success Confirmation Card */}
            <div className="bg-white dark:bg-surface-dark w-full max-w-[600px] rounded-xl shadow-xl overflow-hidden border-t-4 border-accent">
                <div className="p-5 sm:p-8 lg:p-12 flex flex-col items-center text-center">
                    {/* Elegant Cancellation Icon */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 animate-pulse"></div>
                        <div className="relative bg-white dark:bg-surface-dark rounded-full p-6 shadow-inner border border-primary/20">
                            <AssignmentReturn className="text-primary !text-6xl" />
                        </div>
                    </div>

                    {/* Main Message */}
                    <h1 className="text-text-dark dark:text-white text-2xl sm:text-3xl font-extrabold font-display leading-tight mb-4">
                        {isReturn ? "Return Request Created Successfully" : "Order Cancelled Successfully"}
                    </h1>
                    <p className="text-text-muted dark:text-gray-400 text-sm sm:text-base max-w-[420px] mb-8">
                        {isReturn
                            ? "Your return request has been received. The process will start once the products are received by us."
                            : "Your cancellation has been completed successfully. The refund process for your order has been initiated automatically."}
                    </p>

                    {/* Refund Details Section */}
                    <div className="w-full bg-background-light dark:bg-white/5 rounded-xl p-6 mb-8 border border-gray-100 dark:border-white/10">
                        <h3 className="text-text-dark dark:text-white font-bold text-lg mb-4 text-left border-b border-gray-100 dark:border-white/10 pb-2">
                            {isReturn ? "Return Details" : "Refund Information"}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center gap-3">
                                <span className="text-text-muted dark:text-gray-400 text-sm font-medium">Order No</span>
                                <span className="text-text-dark dark:text-white text-sm font-bold break-all">#{order.order_number}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted dark:text-gray-400 text-sm font-medium">
                                    {isReturn ? "Estimated Return Amount" : "Refund Amount"}
                                </span>
                                <span className="text-primary text-xl font-extrabold">
                                    {parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted dark:text-gray-400 text-sm font-medium">Refund Method</span>
                                <span className="text-text-dark dark:text-white text-sm font-medium">Credit Card (Original Payment)</span>
                            </div>
                            <div className="flex justify-between items-center bg-accent/10 p-3 rounded-lg border border-accent/20">
                                <div className="flex items-center gap-2">
                                    <Schedule className="text-accent !text-xl" />
                                    <span className="text-text-dark dark:text-white text-sm font-semibold">Process Time</span>
                                </div>
                                <span className="text-text-dark dark:text-white text-sm font-bold">3-5 Business Days</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-text-muted dark:text-gray-400 text-sm italic mb-10 text-center">
                        *The refund will be automatically reflected on the card you used for payment. The time may vary depending on your bank&apos;s processes.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={() => router.push('/my-profile/orders')}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <ReceiptLong />
                            Back to Orders
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-secondary dark:text-primary font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 border border-secondary/20"
                        >
                            <Home />
                            Go to Home
                        </button>
                    </div>
                </div>

                {/* Footer Support Info */}
                <div className="bg-gray-50 dark:bg-black/20 px-4 sm:px-8 py-4 flex items-center justify-center gap-2">
                    <SupportAgent className="text-text-muted !text-lg" />
                    <p className="text-text-muted dark:text-gray-400 text-xs text-center">
                        Need help? Contact <a className="text-primary font-bold hover:underline" href="#">Live Support</a>.
                    </p>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="mt-12 flex gap-8 text-text-muted dark:text-gray-500 opacity-40">
                <VerifiedUser />
                <LocalShipping />
                <Payments />
            </div>
        </main>
    );
};

export default CancelSuccess;
