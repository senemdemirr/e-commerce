"use client";

import { Box } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export default function BasketQuantityControl({ quantity, onDecrease, onIncrease }) {
    return (
        <Box className="flex h-10 items-center rounded-xl bg-background-light p-1 dark:bg-white/5">
            <Box
                component="button"
                type="button"
                onClick={onDecrease}
                disabled={quantity <= 1}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg bg-white text-text-main shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:bg-surface-dark dark:text-white transition-colors"
            >
                <Remove className="text-base" fontSize="small" />
            </Box>
            <Box
                component="input"
                className="w-12 border-none bg-transparent p-0 text-center text-sm font-bold text-text-main focus:ring-0 dark:text-white outline-none"
                readOnly
                type="number"
                value={quantity}
            />
            <Box
                component="button"
                type="button"
                onClick={onIncrease}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg bg-white text-text-main shadow-sm hover:bg-gray-50 dark:bg-surface-dark dark:text-white transition-colors"
            >
                <Add className="text-base" fontSize="small" />
            </Box>
        </Box>
    );
}
