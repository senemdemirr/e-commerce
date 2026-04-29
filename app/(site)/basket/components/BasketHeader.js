"use client";

import { Box } from "@mui/material";

export default function BasketHeader({ itemCount }) {
    return (
        <Box className="mb-10">
            <Box className="flex flex-col gap-4">
                <Box className="flex items-center justify-between">
                    <Box component="h1" className="text-3xl font-extrabold tracking-tight text-text-main dark:text-white md:text-4xl">
                        My Cart
                    </Box>
                    <Box component="span" className="text-sm font-medium text-text-muted dark:text-gray-400">
                        {itemCount} Items Added
                    </Box>
                </Box>
                <Box className="mt-4 flex w-full flex-col gap-2">
                    <Box className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <Box className="absolute left-0 top-0 h-full w-1/3 rounded-full bg-primary shadow-sm shadow-primary/50" />
                    </Box>
                    <Box className="flex justify-between text-xs font-medium text-text-muted dark:text-gray-500">
                        <Box component="span" className="text-primary">Cart</Box>
                        <Box component="span">Delivery &amp; Payment</Box>
                        <Box component="span">Completed</Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
