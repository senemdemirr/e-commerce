"use client";
import { useCart } from "@/context/CartContext";
import { ShoppingCartOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BasketButton() {
    const { quantity, isCartReady } = useCart();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const badgeContent = isHydrated && isCartReady ? quantity : 0;

    return (
        <Link
            href="/basket"
            className="inline-flex items-center gap-2 rounded px-4 py-2 text-gray-600 transition-colors hover:bg-transparent"
        >
            <span className="relative inline-flex items-center justify-center">
                <ShoppingCartOutlined />
                {badgeContent > 0 && (
                    <span
                        className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[11px] font-bold leading-none text-white"
                        suppressHydrationWarning
                    >
                        {badgeContent}
                    </span>
                )}
            </span>
            <span>My Basket</span>
        </Link>
    );
}
