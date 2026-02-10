import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {
    ChevronRight,
    Inventory2,
    ExpandMore,
    Info,
    CheckCircle,
    Close,
    Lock,
    VerifiedUser
} from '@mui/icons-material';
import { apiFetch } from "@/lib/apiFetch/fetch";
import { CircularProgress } from '@mui/material';

const CancelRequest = ({ order, router, formatDate, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reasons, setReasons] = useState([]);
    const [fetchingReasons, setFetchingReasons] = useState(true);
    const [selectedReason, setSelectedReason] = useState("");
    const [cancelNote, setCancelNote] = useState("");

    useEffect(() => {
        const fetchReasons = async () => {
            try {
                const res = await apiFetch("/api/orders/cancellation-reasons");
                if (res.reasons) {
                    setReasons(res.reasons);
                }
            } catch (err) {
                console.error("Error fetching reasons:", err);
            } finally {
                setFetchingReasons(false);
            }
        };
        fetchReasons();
    }, []);

    const handleCancel = async () => {
        if (!selectedReason) {
            setError("Please select a reason for cancellation.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/orders/${order.order_number}/cancel`, {
                method: "POST",
                body: JSON.stringify({
                    reason_id: parseInt(selectedReason),
                    note: cancelNote
                })
            });

            if (res.message === "Order cancelled successfully") {
                onSuccess();
            } else {
                setError(res.message || "Failed to cancel order. Please try again.");
            }
        } catch (err) {
            console.error("Cancellation error:", err);
            setError("Something went wrong while cancelling your order.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="layout-container flex h-full grow flex-col">
                <main className="flex-1 flex justify-center py-8 px-4">
                    <div className="w-full max-w-[800px] flex flex-col gap-6">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-sm">
                            <Link className="text-text-muted hover:text-primary transition-colors" href="/">Home</Link>
                            <ChevronRight className="text-text-muted !text-sm" />
                            <Link className="text-text-muted hover:text-primary transition-colors" href="/my-profile/orders">My Orders</Link>
                            <ChevronRight className="text-text-muted !text-sm" />
                            <span className="text-text-dark dark:text-white font-semibold">Cancel Order</span>
                        </nav>

                        {/* Title Section */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-text-dark dark:text-white text-3xl font-black leading-tight tracking-tight">
                                Order Cancellation Request
                            </h1>
                            <p className="text-text-muted text-base">Order No: <span className="font-bold text-text-dark dark:text-gray-200">#{order.order_number}</span></p>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <Inventory2 className="text-primary" />
                                    <h3 className="font-bold text-lg text-text-dark dark:text-white">Order Summary</h3>
                                </div>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full capitalize">
                                    {order.status === 'Order Received' ? 'Order Received' :
                                        order.status === 'Preparing' ? 'Preparing' :
                                            order.status === 'Shipped' ? 'In Cargo' : order.status}
                                </span>
                            </div>

                            <div className="flex flex-col gap-4">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="size-20 bg-background-light dark:bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                            <div className="w-full h-full bg-center bg-no-repeat bg-cover"
                                                style={{ backgroundImage: `url("${item.image || 'https://via.placeholder.com/150'}")` }}>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-text-dark dark:text-white font-bold text-lg leading-tight">{item.product_title || item.title}</p>
                                            <p className="text-text-muted text-sm mt-1">Qty: {item.quantity} | <span className="text-primary font-semibold">{parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span></p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
                                    <p className="text-text-dark dark:text-white font-bold text-lg">Total: <span className="text-primary">{parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Form */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col gap-6">
                            <h3 className="font-bold text-lg text-text-dark dark:text-white border-b border-gray-100 dark:border-white/10 pb-4">Cancellation Details</h3>

                            {/* Reason Dropdown */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-dark dark:text-gray-300" htmlFor="reason">Select Cancellation Reason</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 rounded-lg border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 text-text-dark dark:text-white focus:ring-primary focus:border-primary appearance-none px-4"
                                        id="reason"
                                        value={selectedReason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                    >
                                        <option disabled value="">
                                            {fetchingReasons ? "Loading reasons..." : "Please specify a reason..."}
                                        </option>
                                        {reasons.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.reason_text}
                                            </option>
                                        ))}
                                    </select>
                                    <ExpandMore className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
                                </div>
                            </div>

                            {/* Description Area */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-text-dark dark:text-gray-300" htmlFor="desc">Additional Information (Optional)</label>
                                    <span className="text-xs text-text-muted">Max. 250 characters</span>
                                </div>
                                <textarea
                                    className="w-full rounded-lg border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 text-text-dark dark:text-white focus:ring-primary focus:border-primary p-4 placeholder:text-text-muted"
                                    id="desc"
                                    placeholder="Would you like to provide more details?"
                                    rows="4"
                                    value={cancelNote}
                                    onChange={(e) => setCancelNote(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Info Alert */}
                            <div className="flex gap-3 bg-primary/10 border border-primary/20 p-4 rounded-lg">
                                <Info className="text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-text-dark dark:text-white">About Refund</p>
                                    <p className="text-sm text-[#506e5a] dark:text-gray-300">Your refund will be made to your original payment method within 3-5 business days after cancellation approval.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-sm text-red-500 font-medium">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    <>
                                        <CheckCircle />
                                        Confirm Cancellation
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => router.back()}
                                disabled={loading}
                                className="flex-1 bg-accent hover:bg-[#e0a47d] text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <Close />
                                Go Back
                            </button>
                        </div>

                        {/* Safety/Trust Section */}
                        <div className="flex items-center justify-center gap-8 py-6 opacity-60">
                            <div className="flex items-center gap-2 grayscale">
                                <Lock className="!text-sm" />
                                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2 grayscale">
                                <VerifiedUser className="!text-sm" />
                                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">256-bit SSL</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CancelRequest;
