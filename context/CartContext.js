"use client";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createContext, useContext } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchCart = async () => {
        try {
            const res = await apiFetch("/api/cart");
            if (res?.items) {
                setItems(res.items);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchCart();
    }, []);

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

            // Update items locally or fetch
            await fetchCart();
            await new Promise(resolve => setTimeout(resolve, 2000));
            router.push("/basket");
        } catch (error) {
            console.log(error);
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

            await apiFetch('/api/cart', {
                method: 'PUT',
                body: JSON.stringify({ itemId, quantity: newQuantity })
            });
            // Ideally we re-fetch to ensure consistency but optimistic is faster
            // fetchCart();
        } catch (error) {
            console.error(error);
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

            await apiFetch(`/api/cart?itemId=${itemId}`, {
                method: 'DELETE'
            });
            fetchCart(); // Synch to be sure
        } catch (error) {
            console.error(error);
            fetchCart();
        }
    };

    const quantity = useMemo(
        () => items.reduce((acc, item) => acc + item.quantity, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, addToCart, updateItemQuantity, removeFromCart, quantity, loading }}
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
