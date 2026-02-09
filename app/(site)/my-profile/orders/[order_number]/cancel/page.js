"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import CancelRequest from "@/components/Order/CancelRequest";
import ReturnRequest from "@/components/Order/ReturnRequest";

export default function CancelOrderPage({ params }) {
    const { order_number } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await apiFetch(`/api/orders/${order_number}`);
                if (res.order) {
                    setOrder(res.order);
                } else {
                    setError(res.message || "Order not found");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [order_number]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <CircularProgress className="!text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-12 text-center">
                <h6 className="text-red-500 font-bold text-xl">{error || "Sipariş bulunamadı."}</h6>
                <button onClick={() => router.push('/my-profile/orders')} className="mt-4 text-primary font-bold hover:underline">
                    Back to Orders
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const isDelivered = order.status === 'Delivered';

    if (!isDelivered) {
        return <CancelRequest order={order} router={router} formatDate={formatDate} />;
    }

    return <ReturnRequest order={order} router={router} formatDate={formatDate} />;
}
