"use client";

import { Box } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export default function AddToCartButton({
    loading = false,
    disabled = false,
    isInStock = true,
    onClick,
}) {
    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:cursor-not-allowed disabled:bg-primary/40 disabled:shadow-none"
        >
            <ShoppingBagIcon sx={{ fontSize: 20 }} />
            {loading ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
        </Box>
    );
}
