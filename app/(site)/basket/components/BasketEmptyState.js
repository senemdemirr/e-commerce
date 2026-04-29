"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import { ArrowBack } from "@mui/icons-material";

export default function BasketEmptyState() {
    return (
        <Box component="main" className="container py-8 mx-auto">
            <Box className="flex flex-col items-center justify-center gap-6 py-20 text-center">
                <Box component="h2" className="text-2xl font-bold text-text-main dark:text-white">Your Cart is Empty</Box>
                <Box component="p" className="text-text-muted dark:text-gray-400">{"You haven't added any items to your cart yet."}</Box>
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-[1px]"
                >
                    <ArrowBack className="text-lg" />
                    Start Shopping
                </Link>
            </Box>
        </Box>
    );
}
