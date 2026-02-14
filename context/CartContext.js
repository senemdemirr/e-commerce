"use client";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createContext, useContext } from "react";
import { useSnackbar } from "notistack";
import { useUser } from "@/context/UserContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { enqueueSnackbar } = useSnackbar();
    const user = useUser();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchCart = async () => {
        try {
            if (!user) {
                setItems([]);
                return;
            }
            const res = await apiFetch("/api/cart");
            if (Array.isArray(res?.items)) {
                setItems(res.items);
            } else {
                setItems([]);
            }
        } catch (error) {
            if (error?.status === 401) {
                setItems([]);
                return;
            }
            console.log(error);
            enqueueSnackbar("Failed to load cart information.", { variant: "error" });
        }
    }

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setItems([]);
        }
    }, [user]);

    const addToCart = async (product, quantity) => {
        const normalizedQuantity = Math.max(1, Number(quantity) || 1);
        setLoading(true);
        try {
            const res = await apiFetch('/api/cart', {
                method: "POST",
                body: JSON.stringify({
                    productSku: product.sku,
                    quantity: normalizedQuantity,
                    selectedSize: product.selectedSize,
                    selectedColor: product.selectedColor,
                    selectedColorHex: product.selectedColorHex
                })
            });
            if (res?.message !== "Successfully") {
                throw new Error(res?.message || "Failed to add product to cart.");
            }

            // Update items locally or fetch
            await fetchCart();
            enqueueSnackbar("Product added to cart.", { variant: "success" });
            await new Promise(resolve => setTimeout(resolve, 2000));
            router.push("/basket");
        } catch (error) {
            console.log(error);
            enqueueSnackbar("Failed to add product to cart.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }

    const updateItemQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            // Optimistic update
            setItems(prevItems => {
                const newItems = prevItems.map(item =>
                    item.id === itemId
                        ? { ...item, quantity: newQuantity, total_price: Number(item.unit_price) * newQuantity }
                        : item
                );
                return newItems;
            });

            const res = await apiFetch('/api/cart', {
                method: 'PUT',
                body: JSON.stringify({ itemId, quantity: newQuantity })
            });
            if (res?.message !== "Updated") {
                throw new Error(res?.message || "Failed to update quantity.");
            }
            // Ideally we re-fetch to ensure consistency but optimistic is faster
            // fetchCart();
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Failed to update product quantity.", { variant: "error" });
            fetchCart(); // Revert on error
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            // Optimistic update
            setItems(prevItems => {
                const newItems = prevItems.filter(item => item.id !== itemId);
                return newItems;
            });

            const res = await apiFetch(`/api/cart?itemId=${itemId}`, {
                method: 'DELETE'
            });
            if (res?.message !== "Deleted") {
                throw new Error(res?.message || "Failed to remove product from cart.");
            }
            fetchCart(); // Synch to be sure
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Failed to remove product from cart.", { variant: "error" });
            fetchCart();
        }
    };

    const quantity = useMemo(
        () => items.reduce((acc, item) => acc + item.quantity, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, addToCart, updateItemQuantity, removeFromCart, quantity, loading, fetchCart }}
        >
            {children}
        </CartContext.Provider>
    );

}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }
    return ctx;
}
