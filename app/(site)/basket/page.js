"use client";

import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import BasketEmptyState from "./components/BasketEmptyState";
import BasketHeader from "./components/BasketHeader";
import BasketItemList from "./components/BasketItemList";
import BasketLoadingState from "./components/BasketLoadingState";
import BasketOrderSummary from "./components/BasketOrderSummary";

function calculateSubtotal(items) {
    return items.reduce(
        (acc, item) => acc + (Number(item.total_price) || (Number(item.unit_price) * item.quantity)),
        0
    );
}

function calculateItemCount(items) {
    return items.reduce((acc, item) => acc + item.quantity, 0);
}

export default function BasketPage() {
    const { items, updateItemQuantity, removeFromCart, isCartReady } = useCart();
    const router = useRouter();

    const subtotal = calculateSubtotal(items);
    const shipping = subtotal >= 1000 ? 0 : 49.90;
    const total = subtotal + shipping;

    const handleCheckout = () => {
        router.push("/checkout");
    };

    if (!isCartReady) {
        return <BasketLoadingState />;
    }

    if (items.length === 0) {
        return <BasketEmptyState />;
    }

    return (
        <Box component="main" className="container py-8 mx-auto">
            <BasketHeader itemCount={calculateItemCount(items)} />

            <Box className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                <BasketItemList
                    items={items}
                    onQuantityChange={updateItemQuantity}
                    onRemove={removeFromCart}
                />

                <BasketOrderSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    total={total}
                    onCheckout={handleCheckout}
                />
            </Box>
        </Box>
    );
}
