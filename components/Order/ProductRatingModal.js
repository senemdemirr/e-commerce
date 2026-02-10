import React, { useState } from 'react';
import { Close, Star } from '@mui/icons-material';
import { apiFetch } from "@/lib/apiFetch/fetch";
import { CircularProgress } from '@mui/material';

const ProductRatingModal = ({ isOpen, onClose, product, orderId, orderDate, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/api/products/reviews", {
                method: "POST",
                body: JSON.stringify({
                    product_id: product.product_id,
                    order_id: orderId,
                    rating,
                    comment
                })
            });

            if (res && res.message === "Review submitted successfully") {
                setSuccess(true);
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setRating(0);
                    setComment("");
                }, 2000);
            } else {
                setError(res?.message || "Failed to submit review.");
            }
        } catch (err) {
            console.error("Review submission error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-xl font-bold text-text-dark dark:text-white">Rate Product</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-dark dark:hover:text-white transition-colors">
                        <Close />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-bounce">
                            <Star sx={{ fontSize: 40 }} />
                        </div>
                        <h4 className="text-xl font-bold text-text-dark dark:text-white">Thank You!</h4>
                        <p className="text-text-muted">Your review has been submitted successfully.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 flex flex-col gap-6">
                            {/* Product Info */}
                            <div className="flex items-center gap-4 p-3 bg-background-light dark:bg-white/5 rounded-xl">
                                <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/10">
                                    <img
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                        src={product.image || 'https://via.placeholder.com/150'}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-text-dark dark:text-white font-bold text-sm leading-tight truncate">{product.title}</h4>
                                    <p className="text-text-muted text-xs mt-1">Order Date: {orderDate}</p>
                                </div>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex flex-col items-center gap-3 py-2">
                                <p className="text-sm font-semibold text-text-dark dark:text-white">Rate this product</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                sx={{
                                                    fontSize: 40,
                                                    color: (hover || rating) >= star ? '#8dc8a1' : 'rgba(156, 163, 175, 0.2)'
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Area */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-dark dark:text-white">Share your experience</label>
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-text-dark dark:text-white transition-all"
                                    placeholder="What do you think about the quality, usage and shipping process of the product?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            {error && (
                                <p className="text-xs text-red-500 font-medium">{error}</p>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-text-dark dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[2] bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <CircularProgress size={20} color="inherit" /> : "Send Review"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductRatingModal;
