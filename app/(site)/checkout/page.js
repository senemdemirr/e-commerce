"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch/fetch";

export default function CheckoutPage() {
    const [checkoutFormContent, setCheckoutFormContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initPayment = async () => {
            try {
                const res = await apiFetch("/api/payment", { method: "POST" });
                if (res.status === "success" && res.checkoutFormContent) {
                    setCheckoutFormContent(res.checkoutFormContent);
                } else {
                    console.error("Payment init failed", res);
                    setError(res.errorMessage || "Failed to initialize payment.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while initializing payment.");
            } finally {
                setLoading(false);
            }
        };
        initPayment();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] flex-col gap-4">
                <p className="text-red-500 font-bold">Error: {error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">Retry</button>
            </div>
        )
    }

    return (
        <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Breadcrumb / Progress Bar */}
            <div className="mb-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold tracking-tight text-text-main dark:text-white md:text-4xl">
                            Checkout
                        </h1>
                    </div>
                    <div className="mt-4 flex w-full flex-col gap-2">
                        <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className="absolute left-0 top-0 h-full w-2/3 rounded-full bg-primary shadow-sm shadow-primary/50"></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-text-muted dark:text-gray-500">
                            <span className="text-primary">Cart</span>
                            <span className="text-primary">Delivery &amp; Payment</span>
                            <span>Completed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="w-full max-w-4xl" id="iyzipay-checkout-form" dangerouslySetInnerHTML={{ __html: checkoutFormContent }}></div>
            </div>
        </main>
    );
}
