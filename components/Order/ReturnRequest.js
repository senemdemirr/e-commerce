import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Info, Check, ArrowBack, ArrowForward } from '@mui/icons-material';
import { apiFetch } from "@/lib/apiFetch/fetch";
import { CircularProgress } from '@mui/material';
import ReturnReasonStep from './ReturnReasonStep';
import { useSnackbar } from "notistack";

const ReturnRequest = ({ order, router, formatDate, onSuccess }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reasons, setReasons] = useState([]);
    const [selectedItems, setSelectedItems] = useState({}); // { order_item_id: boolean }
    const [itemDetails, setItemDetails] = useState({}); // { order_item_id: { reason_id, note } }
    const [policyAccepted, setPolicyAccepted] = useState(false);

    useEffect(() => {
        const fetchReasons = async () => {
            try {
                const res = await apiFetch("/api/orders/return-reasons");
                if (res.reasons) {
                    setReasons(res.reasons);
                    // Initialize itemDetails with first reason for each item if not already set
                    const details = { ...itemDetails };
                    order.items?.forEach(item => {
                        if (!details[item.id]) {
                            details[item.id] = { reason_id: res.reasons[0].id, note: "" };
                        }
                    });
                    setItemDetails(details);
                }
            } catch (err) {
                console.error("Error fetching return reasons:", err);
            }
        };
        fetchReasons();
    }, [order.items]);

    const handleItemToggle = (itemId) => {
        setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const handleDetailChange = (itemId, field, value) => {
        setItemDetails(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value }
        }));
    };

    const handleNextStep = () => {
        const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
        if (selectedIds.length === 0) {
            enqueueSnackbar("Please select at least one product to return.", { variant: "warning" });
            return;
        }
        setStep(2);
    };

    const handleReturn = async () => {
        if (!policyAccepted) {
            enqueueSnackbar("You must accept the return terms to continue.", { variant: "warning" });
            return;
        }

        setLoading(true);
        try {
            const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
            const returnsData = selectedIds.map(id => ({
                order_item_id: parseInt(id),
                reason_id: itemDetails[id].reason_id,
                note: itemDetails[id].note
            }));

            const res = await apiFetch(`/api/orders/${order.order_number}/return`, {
                method: "POST",
                body: JSON.stringify({ returns: returnsData })
            });

            if (res.message === "Return request created successfully") {
                enqueueSnackbar("Your return request has been created successfully.", { variant: "success" });
                onSuccess();
            } else {
                enqueueSnackbar(res.message || "Failed to process your return. Please try again.", { variant: "error" });
            }
        } catch (err) {
            console.error("Return error:", err);
            enqueueSnackbar("An error occurred while processing your return.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const selectedProductsCount = Object.values(selectedItems).filter(Boolean).length;
    const selectedTotalAmount = order.items
        ?.filter(item => selectedItems[item.id])
        ?.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0) || 0;

    return (
        <main className="flex-1 flex flex-col items-center bg-white dark:bg-surface-dark transition-colors duration-200">
            <div className="layout-content-container flex flex-col max-w-[960px] w-full px-4 md:px-10 py-5">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 py-4">
                    <Link className="text-text-muted text-base font-medium leading-normal hover:text-primary transition-colors" href="/">Home</Link>
                    <span className="text-text-muted text-base font-medium leading-normal">/</span>
                    <Link className="text-text-muted text-base font-medium leading-normal hover:text-primary transition-colors" href="/my-profile/orders">My Orders</Link>
                    <span className="text-text-muted text-base font-medium leading-normal">/</span>
                    <span className="text-text-dark dark:text-white text-base font-medium leading-normal">Return Request</span>
                </div>

                {/* Page Heading */}
                <div className="flex flex-wrap justify-between gap-3 py-6">
                    <div className="flex min-w-0 flex-col gap-3">
                        <h1 className="text-text-dark dark:text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.02em] lg:tracking-[-0.033em]">
                            Return Request - {step === 1 ? "Select Products" : "Return Reason"}
                        </h1>
                        <p className="text-text-muted text-base font-normal leading-normal">
                            {step === 1 ? "Please select the products you wish to return to proceed." : "Please specify the reasons for the products you selected."}
                        </p>
                    </div>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between w-full mb-10 px-0 sm:px-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-primary text-white' : 'bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 text-text-muted'}`}>
                            {step > 1 ? <Check sx={{ fontSize: 20 }} /> : "1"}
                        </div>
                        <span className={`hidden sm:block text-xs font-bold text-center ${step >= 1 ? 'text-primary' : 'text-text-muted'}`}>Product Selection</span>
                    </div>
                    <div className={`h-[2px] grow mx-4 transition-all ${step >= 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-primary text-white' : 'bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 text-text-muted'}`}>
                            {step > 2 ? <Check sx={{ fontSize: 20 }} /> : "2"}
                        </div>
                        <span className={`hidden sm:block text-xs font-bold text-center ${step >= 2 ? 'text-primary' : 'text-text-muted'}`}>Return Reason</span>
                    </div>
                    <div className={`h-[2px] grow mx-4 transition-all ${step >= 3 ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 3 ? 'bg-primary text-white' : 'bg-background-light dark:bg-surface-dark border-2 border-gray-300 dark:border-white/10 text-text-muted'}`}>3</div>
                        <span className={`hidden sm:block text-xs font-bold text-center ${step >= 3 ? 'text-primary' : 'text-text-muted'}`}>Confirmation</span>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-[#f1f3f2] dark:border-white/10 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-text-dark dark:text-white text-lg font-bold leading-tight">Order No: #{order.order_number}</p>
                            <p className="text-text-muted text-sm font-normal leading-normal">Order Date: {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <p className="text-text-muted text-sm font-normal">{step === 1 ? "Order Total" : "Refund Amount"}</p>
                            <p className="text-primary text-xl font-black">
                                {(step === 1 ? parseFloat(order.total_amount) : selectedTotalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL
                            </p>
                        </div>
                    </div>
                </div>

                {step === 1 ? (
                    <>
                        <h2 className="text-secondary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-4 border-b border-[#f1f3f2] dark:border-white/10 mb-6">
                            Select Products to Return
                        </h2>
                        <div className="space-y-4 mb-8">
                            {order.items?.map((item) => (
                                <div key={item.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${selectedItems[item.id] ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-white/5 border-[#f1f3f2] dark:border-white/10'}`}>
                                    <div className="pt-2">
                                        <input
                                            className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-surface-dark cursor-pointer"
                                            type="checkbox"
                                            checked={!!selectedItems[item.id]}
                                            onChange={() => handleItemToggle(item.id)}
                                        />
                                    </div>
                                    <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 bg-gray-100 dark:bg-white/10"
                                        style={{ backgroundImage: `url("${item.image || 'https://via.placeholder.com/150'}")` }}>
                                    </div>
                                    <div className="flex flex-col justify-center flex-1 h-24">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                            <h3 className="text-text-dark dark:text-white font-bold text-base">{item.title}</h3>
                                            <span className="font-black text-primary">{parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })} TL</span>
                                        </div>
                                        <p className="text-xs text-text-muted">SKU: {item.sku} | Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <ReturnReasonStep
                        order={order}
                        selectedItems={selectedItems}
                        itemDetails={itemDetails}
                        reasons={reasons}
                        handleDetailChange={handleDetailChange}
                    />
                )}

                {/* Policy Warning */}
                <div className="p-5 bg-accent-champagne/10 border-l-4 border-accent-champagne rounded-r-xl mb-10 flex gap-4 items-start">
                    <span className="text-accent-champagne">
                        <Info fontSize="large" />
                    </span>
                    <div className="flex flex-col gap-1">
                        <p className="text-text-dark dark:text-white font-bold text-sm">Return Policy Reminder</p>
                        <p className="text-text-muted text-xs leading-relaxed">
                            Due to hygiene rules, personal care products and underwear category items with opened packaging or used cannot be returned. Returned products must be sent with their original box and a copy of the invoice. Once the return is approved, the amount will be transferred to your account within 3-5 business days.
                        </p>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-[#f1f3f2] dark:border-white/10 pt-8 mb-20">
                    {step === 1 ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-text-muted">
                                {selectedProductsCount} products selected for return
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <input
                                className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 dark:bg-surface-dark cursor-pointer"
                                id="policy"
                                type="checkbox"
                                checked={policyAccepted}
                                onChange={(e) => setPolicyAccepted(e.target.checked)}
                            />
                            <label className="text-sm font-medium text-text-muted cursor-pointer" htmlFor="policy">
                                I agree to the <Link className="underline hover:text-primary" href="#">return terms</Link>.
                            </label>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto">
                        {step === 1 ? (
                            <>
                                <button onClick={() => router.back()} className="flex-1 md:flex-none px-6 sm:px-8 py-3 rounded-xl font-bold text-text-muted border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 md:flex-none px-6 sm:px-12 py-3 rounded-xl bg-accent-champagne hover:bg-accent text-white font-black shadow-lg shadow-accent-champagne/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    Continue
                                    <ArrowForward sx={{ fontSize: 20 }} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-text-muted hover:text-primary font-bold transition-colors"
                                >
                                    <ArrowBack sx={{ fontSize: 20 }} />
                                    Back to Selection
                                </button>
                                <button
                                    onClick={handleReturn}
                                    disabled={loading}
                                    className="w-full sm:w-auto flex-1 md:flex-none px-6 sm:px-12 py-3 rounded-xl bg-accent-champagne hover:bg-accent text-white font-black shadow-lg shadow-accent-champagne/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center sm:min-w-[160px] gap-2"
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : (
                                        <>
                                            Complete Return
                                            <ArrowForward sx={{ fontSize: 20 }} />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ReturnRequest;
