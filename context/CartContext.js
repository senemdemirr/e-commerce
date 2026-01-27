"use client";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchCart = async () => {
        try {
            const res = await apiFetch("/api/cart");
            if (res?.totalQuantity !== undefined) {
                setQuantity(res.totalQuantity);
            }
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

    const addToCart = async (product, quantity = 1) => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/cart', {
                method: "POST",
                body: JSON.stringify({
                    productSku: product.sku,
                    quantity,
                    selectedSize: product.selectedSize,
                    selectedColor: product.selectedColor,
                    selectedColorHex: product.selectedColorHex
                })
            });

            if (res.totalQuantity !== undefined) {
                setQuantity(res.totalQuantity);
            }
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
                // Update total quantity based on all items
                const newTotal = newItems.reduce((acc, item) => acc + item.quantity, 0);
                setQuantity(newTotal);
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
                const newTotal = newItems.reduce((acc, item) => acc + item.quantity, 0);
                setQuantity(newTotal);
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
