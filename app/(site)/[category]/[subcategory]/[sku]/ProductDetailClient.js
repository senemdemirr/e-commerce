"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useSnackbar } from "notistack";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { Tabs, Tab, Box } from '@mui/material';

// MUI Icons
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import IronIcon from '@mui/icons-material/Iron';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

function normalizeColorItem(color) {
    if (color && typeof color === 'object' && !Array.isArray(color)) {
        return {
            name: String(color.name || '').trim(),
            hex: String(color.hex || '').trim(),
        };
    }

    const label = String(color || '').trim();
    return {
        name: label,
        hex: '',
    };
}

function normalizeColorOptions(colors = []) {
    return Array.isArray(colors)
        ? colors
            .map((color) => normalizeColorItem(color))
            .filter((color) => color.name)
        : [];
}

function normalizeVariants(variants = [], fallbackPrice = 0) {
    return Array.isArray(variants)
        ? variants
            .map((variant) => {
                if (!variant || typeof variant !== 'object' || Array.isArray(variant)) {
                    return null;
                }

                return {
                    id: Number(variant.id || 0),
                    sku: String(variant.sku || '').trim(),
                    price: Number(variant.price ?? fallbackPrice ?? 0),
                    stock: Number(variant.stock || 0),
                    is_default: Boolean(variant.is_default),
                    color_name: String(variant.color_name || '').trim(),
                    color_hex: String(variant.color_hex || '').trim(),
                    size_label: String(variant.size_label || '').trim(),
                };
            })
            .filter((variant) => variant && variant.sku)
        : [];
}

function findDefaultVariant(variants = []) {
    return variants.find((variant) => variant.is_default) || variants[0] || null;
}

function uniqueColorsFromVariants(variants = []) {
    const seen = new Set();
    const items = [];

    variants.forEach((variant) => {
        if (!variant.color_name) {
            return;
        }

        const key = `${variant.color_name}::${variant.color_hex}`;

        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        items.push({
            name: variant.color_name,
            hex: variant.color_hex,
        });
    });

    return items;
}

function uniqueSizesFromVariants(variants = [], selectedColorName = '') {
    const seen = new Set();
    const items = [];

    variants.forEach((variant) => {
        if (!variant.size_label) {
            return;
        }

        if (selectedColorName && variant.color_name && variant.color_name !== selectedColorName) {
            return;
        }

        const key = variant.size_label;

        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        items.push(variant.size_label);
    });

    return items;
}

function findMatchingVariant(variants = [], selectedColorName = '', selectedSize = '') {
    if (!Array.isArray(variants) || variants.length === 0) {
        return null;
    }

    if (selectedColorName && selectedSize) {
        const exact = variants.find((variant) => (
            variant.color_name === selectedColorName
            && variant.size_label === selectedSize
        ));

        if (exact) {
            return exact;
        }
    }

    if (selectedColorName) {
        const byColor = variants.find((variant) => variant.color_name === selectedColorName);

        if (byColor) {
            return byColor;
        }
    }

    if (selectedSize) {
        const bySize = variants.find((variant) => variant.size_label === selectedSize);

        if (bySize) {
            return bySize;
        }
    }

    return findDefaultVariant(variants);
}

function getInitialSelections(product) {
    const normalizedColors = normalizeColorOptions(product?.colors);
    const normalizedVariants = normalizeVariants(product?.variants, product?.price);
    const defaultVariant = findDefaultVariant(normalizedVariants);

    const initialColor = defaultVariant?.color_name
        ? {
            name: defaultVariant.color_name,
            hex: defaultVariant.color_hex,
        }
        : normalizedColors[0] || { name: "", hex: "" };

    const initialSize = defaultVariant?.size_label
        || (Array.isArray(product?.sizes) ? product.sizes[0] || "" : "");

    return {
        color: initialColor,
        size: initialSize,
    };
}

export default function ProductDetailClient({ product }) {
    const { addToCart, loading } = useCart();
    const user = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const reviewsRef = useRef(null);

    const colors = normalizeColorOptions(product?.colors);
    const variants = normalizeVariants(product?.variants, product?.price);
    const { color: initialColor, size: initialSize } = getInitialSelections(product);
    const colorOptions = variants.length > 0 ? uniqueColorsFromVariants(variants) : colors;

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [selectedSize, setSelectedSize] = useState(initialSize);
    const [quantity, setQuantity] = useState(1);
    const [tabValue, setTabValue] = useState(0);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [favoritePending, setFavoritePending] = useState(false);

    useEffect(() => {
        const nextSelections = getInitialSelections(product);

        setSelectedColor(nextSelections.color);
        setSelectedSize(nextSelections.size);
        setQuantity(1);
        setTabValue(0);
    }, [product?.id, product?.sku]);

    const availableSizes = variants.length > 0
        ? uniqueSizesFromVariants(variants, selectedColor.name)
        : (Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : []);
    const activeVariant = variants.length > 0
        ? findMatchingVariant(variants, selectedColor.name, selectedSize)
        : null;
    const displayPrice = activeVariant?.price ?? Number(product?.price || 0);
    const isInStock = variants.length > 0 ? Number(activeVariant?.stock || 0) > 0 : true;

    const scrollToReviews = () => {
        setTabValue(1);
        if (reviewsRef.current) {
            reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleAddToCart = () => {
        if (variants.length > 0 && !activeVariant) {
            enqueueSnackbar("Please select an available variant.", { variant: "warning" });
            return;
        }

        if (!isInStock) {
            enqueueSnackbar("Selected variant is out of stock.", { variant: "warning" });
            return;
        }

        addToCart({
            ...product,
            variantId: activeVariant?.id || null,
            selectedColor: activeVariant?.color_name || selectedColor.name,
            selectedColorHex: activeVariant?.color_hex || selectedColor.hex,
            selectedSize: activeVariant?.size_label || selectedSize,
        }, quantity);
    };

    useEffect(() => {
        if (!user || !product?.id) {
            return;
        }
        let active = true;
        const fetchFavorites = async () => {
            try {
                const res = await apiFetch(`/api/favorites?userId=${user.id}`);
                if (!active) return;
                const ids = Array.isArray(res) ? res.map((item) => item.id) : [];
                setFavoriteIds(ids);
            } catch (error) {
                if (!active) return;
                if (error?.status === 401) {
                    enqueueSnackbar("You need to sign in to view favorites.", { variant: "info" });
                    return;
                }
                console.log(error);
            }
        };
        fetchFavorites();
        return () => {
            active = false;
        };
    }, [user, product?.id]);
    const isFavorite = favoriteIds.includes(product?.id);
    const handleToggleFavorite = async () => {
        if (!user) {
            enqueueSnackbar("You need to sign in to manage favorites.", { variant: "info" });
            return;
        }
        if (!product?.id || favoritePending) return;
        const isCurrentlyFavorite = favoriteIds.includes(product.id);
        const nextFavoriteValue = !isCurrentlyFavorite;
        setFavoritePending(true);
        try {
            await apiFetch(`/api/favorites`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: product.id,
                    user_id: user.id,
                    favorite: nextFavoriteValue
                })
            });
            setFavoriteIds((prev) =>
            nextFavoriteValue
                ? [...prev, product.id]
                : prev.filter((id) => id !== product.id)
        );
            enqueueSnackbar(nextFavoriteValue ? "Product added to favorites." : "Product removed from favorites.", { variant: "success" });
        } catch (error) {
            enqueueSnackbar("Failed to update favorite status.", { variant: "error" });
        } finally {
            setFavoritePending(false);
        }
    };

    const details = product.details || {};
    const bulletPoints = details.bullet_points || [];

    const renderStars = (rating, size = 20) => {
        return [1, 2, 3, 4, 5].map((star) => {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;

            if (star <= fullStars) {
                return (
                    <StarIcon
                        key={star}
                        sx={{ fontSize: size, color: '#F0B48C' }}
                    />
                );
            } else if (star === fullStars + 1 && hasHalfStar) {
                return (
                    <StarHalfIcon
                        key={star}
                        sx={{ fontSize: size, color: '#F0B48C' }}
                    />
                );
            } else {
                return (
                    <StarIcon
                        key={star}
                        sx={{ fontSize: size, color: 'rgba(156, 163, 175, 0.2)' }}
                    />
                );
            }
        });
    };

    return (
        <div className="container py-8 mx-auto">
            <div className="flex flex-col w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="w-full aspect-[3/4] md:aspect-[4/3] lg:aspect-[1/1] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative group">
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url("${product.image}")` }}
                            >
                            </div>
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    New Season
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col pt-2">
                        <div className="mb-4 border-b border-[#f1f3f2] dark:border-[#2a362f] pb-6">
                            <div className="flex justify-between items-start mb-2 gap-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-white leading-tight">
                                    {product.title}
                                </h1>
                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    disabled={favoritePending}
                                    aria-pressed={isFavorite}
                                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                    className={`shrink-0 h-10 w-10 rounded-full border flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isFavorite
                                        ? "border-primary text-primary bg-primary/10"
                                        : "border-[#e5e7eb] dark:border-[#2a362f] text-[#6d7e73] hover:border-primary hover:text-primary"
                                        }`}
                                >
                                    {isFavorite ? (
                                        <FavoriteIcon className="text-primary" sx={{ fontSize: 22 }} />
                                    ) : (
                                        <FavoriteBorderIcon className="text-current" sx={{ fontSize: 22 }} />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-0.5">
                                    {renderStars(product.average_rating || 0)}
                                </div>
                                <span
                                    onClick={scrollToReviews}
                                    className="text-sm text-[#6d7e73] underline cursor-pointer hover:text-primary"
                                >
                                    {product.review_count || 0} Değerlendirme
                                </span>
                            </div>

                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-primary">₺{displayPrice}</span>
                            </div>
                        </div>
                        <div className="mb-8">
                            <p className="text-[#6d7e73] dark:text-[#a0aead] leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {colorOptions.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-text-dark dark:text-white uppercase tracking-wider mb-3">
                                    Color: <span className="font-normal text-[#6d7e73]">{selectedColor.name}</span>
                                </h3>
                                <div className="flex gap-3">
                                    {colorOptions.map((color, index) => {
                                        return (
                                            <button
                                                key={index}
                                                aria-label={`Color ${color.name}`}
                                                onClick={() => {
                                                    const nextSizes = variants.length > 0
                                                        ? uniqueSizesFromVariants(variants, color.name)
                                                        : availableSizes;
                                                    const nextSize = nextSizes.includes(selectedSize)
                                                        ? selectedSize
                                                        : (nextSizes[0] || "");

                                                    setSelectedColor(color);
                                                    setSelectedSize(nextSize);
                                                }}
                                                className={`w-10 h-10 rounded-full border-2 transition-all focus:outline-none ${selectedColor.hex === color.hex
                                                    ? "border-white ring-2 ring-primary shadow-sm"
                                                    : "border-transparent hover:border-white hover:ring-2 hover:ring-gray-200"
                                                    }`}
                                                style={{ backgroundColor: color.hex }}
                                            ></button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {availableSizes.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-text-dark dark:text-white uppercase tracking-wider">
                                        {availableSizes[0] === 'Standard' ? 'Option:' : 'Size:'} <span className="font-normal text-[#6d7e73]">{selectedSize}</span>
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {availableSizes.map((size, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 min-w-[3rem] px-2 rounded-lg border transition-all ${selectedSize === size
                                                ? "border-2 border-primary bg-primary/10 text-primary font-bold"
                                                : "border-[#e5e7eb] dark:border-[#2a362f] text-text-dark dark:text-white hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="flex gap-4 h-12">
                                <div className="flex items-center border border-[#e5e7eb] dark:border-[#2a362f] rounded-lg bg-white dark:bg-[#1e2823] px-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-full text-[#6d7e73] hover:text-primary transition-colors flex items-center justify-center p-0"
                                    >
                                        <RemoveIcon sx={{ fontSize: 18 }} />
                                    </button>
                                    <input
                                        className="w-10 text-center border-none focus:ring-0 p-0 text-text-dark dark:text-white font-medium bg-transparent"
                                        readOnly
                                        type="text"
                                        value={quantity}
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-full text-[#6d7e73] hover:text-primary transition-colors flex items-center justify-center p-0"
                                    >
                                        <AddIcon sx={{ fontSize: 18 }} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loading || (variants.length > 0 && !activeVariant) || !isInStock}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:cursor-not-allowed disabled:bg-primary/40 disabled:shadow-none"
                                >
                                    <ShoppingBagIcon sx={{ fontSize: 20 }} />
                                    {loading ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#6d7e73] mt-2">
                                <CheckCircleIcon sx={{ fontSize: 18, color: isInStock ? '#8dc8a1' : '#ef4444' }} />
                                <span>
                                    {isInStock ? 'In Stock.' : 'Out of Stock.'} <span className="font-medium text-text-dark dark:text-white">Free shipping</span> (over 1000₺)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 border-t border-[#f1f3f2] dark:border-[#2a362f] pt-10" ref={reviewsRef}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, v) => setTabValue(v)}
                            textColor="inherit"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1.125rem',
                                    color: '#6d7e73',
                                    '&.Mui-selected': {
                                        color: '#8dc8a1',
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#8dc8a1',
                                }
                            }}
                        >
                            <Tab label="Product Details" />
                            <Tab label={`Reviews (${product.review_count || 0})`} />
                            <Tab label="Delivery & Returns" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="text-[#6d7e73] dark:text-[#a0aead] space-y-4">
                                <p>{details.description_long || product.description}</p>
                                {bulletPoints.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-2 mt-4">
                                        {bulletPoints.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl">
                                <h4 className="font-bold text-lg mb-4 text-text-dark dark:text-white">Material & Care</h4>
                                <div className="flex gap-6 mb-6">
                                    <div className="flex flex-col items-center gap-2 text-center w-20">
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2a362f] flex items-center justify-center text-primary shadow-sm">
                                            <LocalLaundryServiceIcon />
                                        </div>
                                        <span className="text-xs text-[#6d7e73]">30° Wash</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 text-center w-20">
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2a362f] flex items-center justify-center text-primary shadow-sm">
                                            <IronIcon />
                                        </div>
                                        <span className="text-xs text-[#6d7e73]">Low Heat</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 text-center w-20">
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2a362f] flex items-center justify-center text-primary shadow-sm">
                                            <DryCleaningIcon />
                                        </div>
                                        <span className="text-xs text-[#6d7e73]">Dry Clean</span>
                                    </div>
                                </div>
                                <div className="text-xs text-[#6d7e73] dark:text-[#a0aead]">
                                    *Product color may vary slightly due to photographic lighting sources.
                                </div>
                            </div>
                        </div>
                    )}
                    {tabValue === 1 && (
                        <div className="py-5">
                            {product.reviews && product.reviews.length > 0 ? (
                                <div className="space-y-8">
                                    {product.reviews.map((review, idx) => (
                                        <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center text-accent-champagne gap-0.5 mb-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <p className="font-bold text-text-dark dark:text-white">{review.user_name}</p>
                                                </div>
                                                <span className="text-xs text-text-muted">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-text-muted dark:text-gray-400">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-[#6d7e73]">
                                    No reviews yet.
                                </div>
                            )}
                        </div>
                    )}
                    {tabValue === 2 && (
                        <div className="py-10 text-[#6d7e73]">
                            <p>Standard delivery time is 2-4 business days. You have the right to free return within 14 days.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
