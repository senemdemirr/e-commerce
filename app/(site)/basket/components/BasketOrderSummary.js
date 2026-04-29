"use client";

import { Box } from "@mui/material";
import { ArrowForward, History, Lock, SupportAgent } from "@mui/icons-material";

function TrustSignal({ icon, label }) {
    return (
        <Box className="flex flex-col items-center gap-1">
            {icon}
            <Box component="span" className="text-[10px] font-medium">{label}</Box>
        </Box>
    );
}

function TrustDivider() {
    return <Box className="h-8 w-px bg-gray-200 dark:bg-gray-700" />;
}

export default function BasketOrderSummary({ subtotal, shipping, total, onCheckout }) {
    return (
        <Box className="w-full lg:w-[380px] xl:w-[420px]">
            <Box className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/50 dark:bg-surface-dark dark:shadow-black/20 border border-gray-100 dark:border-white/5">
                <Box component="h2" className="text-xl font-bold text-text-main dark:text-white mb-6">
                    Order Summary
                </Box>
                <Box className="mb-6 flex flex-col gap-3 border-b border-dashed border-gray-200 pb-6 dark:border-gray-700">
                    <Box className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                        <Box component="span">Subtotal</Box>
                        <Box component="span" className="font-medium text-text-main dark:text-white">
                            ₺{subtotal.toFixed(2)}
                        </Box>
                    </Box>
                    <Box className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                        <Box component="span">Shipping</Box>
                        <Box component="span" className={`font-medium ${shipping === 0 ? "text-green-500" : "text-primary"}`}>
                            {shipping === 0 ? "Free" : `₺${shipping.toFixed(2)}`}
                        </Box>
                    </Box>
                </Box>
                <Box className="mb-8 flex items-end justify-between">
                    <Box component="span" className="text-lg font-bold text-text-main dark:text-white">
                        Total
                    </Box>
                    <Box component="span" className="text-2xl font-black text-text-main dark:text-white tracking-tight">
                        ₺{total.toFixed(2)}
                    </Box>
                </Box>
                <Box className="flex flex-col gap-3">
                    <Box
                        component="button"
                        type="button"
                        onClick={onCheckout}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-[1px]"
                    >
                        Checkout
                        <ArrowForward className="transition-transform group-hover:translate-x-1" />
                    </Box>
                </Box>
                <Box className="mt-8 flex justify-center gap-4 text-gray-400 dark:text-gray-600">
                    <TrustSignal icon={<Lock className="text-xl" />} label="Secure Payment" />
                    <TrustDivider />
                    <TrustSignal icon={<History className="text-xl" />} label="30 Day Return" />
                    <TrustDivider />
                    <TrustSignal icon={<SupportAgent className="text-xl" />} label="24/7 Support" />
                </Box>
            </Box>
        </Box>
    );
}
