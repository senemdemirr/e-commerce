"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import { ArrowBack } from "@mui/icons-material";
import BasketItemCard from "./BasketItemCard";

export default function BasketItemList({ items, onQuantityChange, onRemove }) {
    return (
        <Box className="flex-1 flex flex-col gap-6">
            {items.map((item) => (
                <BasketItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={onQuantityChange}
                    onRemove={onRemove}
                />
            ))}

            <Link
                href="/"
                className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
                <ArrowBack className="text-lg" />
                Continue Shopping
            </Link>
        </Box>
    );
}
