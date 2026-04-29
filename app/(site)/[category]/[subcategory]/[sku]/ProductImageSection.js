"use client";

import { Box } from '@mui/material';

export default function ProductImageSection({ image, title }) {
    return (
        <Box
            component="section"
            className="w-full aspect-[3/4] md:aspect-[4/3] lg:aspect-[1/1] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative group"
        >
            <Box
                role="img"
                aria-label={title}
                className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: image ? `url("${image}")` : 'none' }}
            />
            <Box className="absolute top-4 left-4">
                <Box
                    component="span"
                    className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                >
                    New Season
                </Box>
            </Box>
        </Box>
    );
}
