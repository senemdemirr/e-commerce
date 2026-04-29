"use client";

import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function QuantitySelector({ value, onChange }) {
    const quantity = Math.max(1, Number(value) || 1);

    return (
        <Box className="flex items-center border border-[#e5e7eb] dark:border-[#2a362f] rounded-lg bg-white dark:bg-[#1e2823] px-2">
            <Box
                component="button"
                type="button"
                aria-label="Decrease quantity"
                onClick={() => onChange(Math.max(1, quantity - 1))}
                className="w-8 h-full text-[#6d7e73] hover:text-primary transition-colors flex items-center justify-center p-0"
            >
                <RemoveIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box
                component="input"
                className="w-10 text-center border-none focus:ring-0 p-0 text-text-dark dark:text-white font-medium bg-transparent"
                readOnly
                type="text"
                value={quantity}
            />
            <Box
                component="button"
                type="button"
                aria-label="Increase quantity"
                onClick={() => onChange(quantity + 1)}
                className="w-8 h-full text-[#6d7e73] hover:text-primary transition-colors flex items-center justify-center p-0"
            >
                <AddIcon sx={{ fontSize: 18 }} />
            </Box>
        </Box>
    );
}
