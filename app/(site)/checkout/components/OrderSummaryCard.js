"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function OrderSummaryCard({
    cartItems,
    cartSummary,
    agreedToTerms,
    setAgreedToTerms,
    processing,
    onSubmitOrder,
}) {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
            <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                Order Summary
            </h3>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({cartItems.length} Items)</span>
                    <span className="font-semibold">{cartSummary.subtotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-bold ${cartSummary.shipping === 0 ? "text-primary" : ""}`}>
                        {cartSummary.shipping === 0
                            ? "Free"
                            : `${cartSummary.shipping.toFixed(2)} TL`}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-8">
                <div className="flex justify-between items-end">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-primary">
                        {cartSummary.total.toFixed(2)} TL
                    </span>
                </div>
            </div>

            <button
                onClick={onSubmitOrder}
                disabled={processing || !agreedToTerms}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        Complete Order
                        <ArrowForwardIcon className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-[11px] text-gray-400">
                    <input
                        className="checkbox-transparent-primary !w-6 !h-5"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(event) => setAgreedToTerms(event.target.checked)}
                    />
                    <span>
                        <a
                            className="underline"
                            href="/pre-information-conditions"
                            target="_blank"
                        >
                            Pre-Information Conditions
                        </a>{" "}
                        and{" "}
                        <a
                            className="underline"
                            href="/distance-sales-agreement"
                            target="_blank"
                        >
                            Distance Sales Agreement
                        </a>
                        , I have read and approve.
                    </span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Items in Cart
                </p>
                <div className="space-y-4">
                    {cartItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex gap-3">
                            <div
                                className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg bg-cover bg-center"
                                style={{ backgroundImage: `url('${item.image}')` }}
                            />
                            <div className="flex-1">
                                <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                                <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
