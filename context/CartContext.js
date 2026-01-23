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

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await apiFetch("/api/cart");
                if (res?.totalQuantity) {
                    setQuantity(res.totalQuantity);
                }
                if(res?.items){
                    setItems(res.items);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchCart();
    }, []);

    const addToCart = async (product, quantity = 1) => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/cart', {
                method: "POST",
                body: JSON.stringify({ productSku: product.sku, quantity })
            });

            if (res.totalQuantity) {
                setQuantity(res.totalQuantity);
            }
        } catch (error) {
            console.log(error);
        }
        finally {
            setTimeout(() => {
                setLoading(false);
                router.push("/basket");
            }, 2000);
        }
    }


    return (
        <CartContext.Provider
            value={{items, addToCart, quantity, loading }}
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