"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import { CheckCircle, Delete } from "@mui/icons-material";
import BasketQuantityControl from "./BasketQuantityControl";

function getProductHref(item) {
    return `/${item.category_slug}/${item.subcategory_slug}/${item.sku}`;
}

function getItemTotal(item) {
    return Number(item.team_price) || (Number(item.unit_price) * item.quantity);
}

export default function BasketItemCard({ item, onQuantityChange, onRemove }) {
    const productHref = getProductHref(item);

    return (
        <Box
            className="group relative flex flex-col gap-4 rounded-2xl bg-surface-light p-4 shadow-sm transition-all hover:shadow-md dark:bg-surface-dark sm:flex-row sm:items-center sm:p-5 border border-transparent hover:border-primary/10"
        >
            <Box className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 sm:w-32 cursor-pointer">
                <Link href={productHref}>
                    <Box
                        component="img"
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={item.image || "https://placehold.co/400"}
                    />
                </Link>
            </Box>
            <Box className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <Box className="flex flex-col gap-1">
                    <Box className="flex items-center gap-2 cursor-pointer">
                        <Link href={productHref}>
                            <Box component="h3" className="text-lg font-bold text-text-main dark:text-white hover:text-primary transition-colors">
                                {item.title}
                            </Box>
                        </Link>
                    </Box>
                    <Box component="p" className="text-sm text-text-muted dark:text-gray-400">
                        {item.brand ? `Brand: ${item.brand}` : ''}
                    </Box>
                    <Box className="flex flex-wrap gap-4 mt-1">
                        {item.selected_size && (
                            <Box component="p" className="text-sm font-medium text-text-muted dark:text-gray-400 flex items-center gap-1">
                                Size: <Box component="span" className="font-bold text-text-dark dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{item.selected_size}</Box>
                            </Box>
                        )}
                        {item.selected_color && (
                            <Box className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-400">
                                <Box component="span">Color:</Box>
                                <Box className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                                    {item.selected_color_hex && (
                                        <Box
                                            className="w-3 h-3 rounded-full border border-gray-200"
                                            style={{ backgroundColor: item.selected_color_hex }}
                                        />
                                    )}
                                    <Box component="span" className="text-xs font-bold text-text-dark dark:text-white">{item.selected_color}</Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                    <Box component="p" className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="text-sm" fontSize="small" /> In Stock
                    </Box>
                </Box>
                <Box className="flex items-center justify-between gap-6 sm:justify-end">
                    <BasketQuantityControl
                        quantity={item.quantity}
                        onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
                        onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
                    />
                    <Box className="flex flex-col items-end gap-1">
                        <Box component="span" className="text-lg font-bold text-text-main dark:text-white">
                            ₺{getItemTotal(item).toFixed(2)}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box
                component="button"
                type="button"
                onClick={() => onRemove(item.id)}
                className="cursor-pointer absolute top-4 right-4 p-2 text-text-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 sm:static sm:p-0 sm:hover:bg-transparent sm:dark:hover:bg-transparent"
            >
                <Delete />
            </Box>
        </Box>
    );
}
