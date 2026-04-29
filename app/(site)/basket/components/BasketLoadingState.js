"use client";

import { Box } from "@mui/material";

export default function BasketLoadingState() {
    return (
        <Box component="main" className="container py-8 mx-auto">
            <Box className="flex items-center justify-center min-h-[50vh]">
                <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </Box>
        </Box>
    );
}
