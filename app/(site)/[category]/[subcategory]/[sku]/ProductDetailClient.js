"use client";

import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useSnackbar } from "notistack";
import { apiFetch } from "@/lib/apiFetch/fetch";
import ProductImageSection from './ProductImageSection';
import ProductPurchasePanel from './ProductPurchasePanel';
import ProductDetailTabs from './ProductDetailTabs';

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
    }, [product]);

    const availableSizes = variants.length > 0
        ? uniqueSizesFromVariants(variants, selectedColor.name)
        : (Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : []);
    const activeVariant = variants.length > 0
        ? findMatchingVariant(variants, selectedColor.name, selectedSize)
        : null;
    const activeStock = variants.length > 0 ? Number(activeVariant?.stock || 0) : null;
    const displayPrice = activeVariant?.price ?? Number(product?.price || 0);
    const isInStock = variants.length > 0 ? activeStock > 0 : true;
    const showLowStockMessage = variants.length > 0 && activeStock > 0 && activeStock < 10;
    const hasMissingVariant = variants.length > 0 && !activeVariant;

    const scrollToReviews = () => {
        setTabValue(1);
        if (reviewsRef.current) {
            reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleColorChange = (color) => {
        const nextSizes = variants.length > 0
            ? uniqueSizesFromVariants(variants, color.name)
            : availableSizes;
        const nextSize = nextSizes.includes(selectedSize)
            ? selectedSize
            : (nextSizes[0] || "");

        setSelectedColor(color);
        setSelectedSize(nextSize);
    };

    const handleAddToCart = () => {
        if (hasMissingVariant) {
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
                if (!active) {
                    return;
                }

                const ids = Array.isArray(res) ? res.map((item) => item.id) : [];
                setFavoriteIds(ids);
            } catch (error) {
                if (!active) {
                    return;
                }

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
    }, [enqueueSnackbar, user, product?.id]);

    const isFavorite = favoriteIds.includes(product?.id);

    const handleToggleFavorite = async () => {
        if (!user) {
            enqueueSnackbar("You need to sign in to manage favorites.", { variant: "info" });
            return;
        }

        if (!product?.id || favoritePending) {
            return;
        }

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
                    favorite: nextFavoriteValue,
                }),
            });
            setFavoriteIds((prev) => (
                nextFavoriteValue
                    ? [...prev, product.id]
                    : prev.filter((id) => id !== product.id)
            ));
            enqueueSnackbar(
                nextFavoriteValue ? "Product added to favorites." : "Product removed from favorites.",
                { variant: "success" }
            );
        } catch {
            enqueueSnackbar("Failed to update favorite status.", { variant: "error" });
        } finally {
            setFavoritePending(false);
        }
    };

    const details = product.details || {};
    const materialItems = Array.isArray(details.material) ? details.material : [];
    const careItems = Array.isArray(details.care) ? details.care : [];
    const bulletPoints = Array.isArray(details.bullet_point)
        ? details.bullet_point
        : (Array.isArray(details.bullet_points) ? details.bullet_points : []);
    const longDescription = Array.isArray(details.description_long)
        ? (details.description_long[0] || '')
        : String(details.description_long || '').trim();

    return (
        <Box className="container py-8 mx-auto">
            <Box className="flex flex-col w-full">
                <Box className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    <Box className="lg:col-span-7 flex flex-col gap-4">
                        <ProductImageSection image={product.image} title={product.title} />
                    </Box>

                    <Box className="lg:col-span-5 flex flex-col pt-2">
                        <ProductPurchasePanel
                            product={product}
                            displayPrice={displayPrice}
                            isFavorite={isFavorite}
                            favoritePending={favoritePending}
                            onToggleFavorite={handleToggleFavorite}
                            onReviewsClick={scrollToReviews}
                            colorOptions={colorOptions}
                            selectedColor={selectedColor}
                            onColorChange={handleColorChange}
                            availableSizes={availableSizes}
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                            onAddToCart={handleAddToCart}
                            loading={loading}
                            isInStock={isInStock}
                            hasMissingVariant={hasMissingVariant}
                            activeStock={activeStock}
                            showLowStockMessage={showLowStockMessage}
                        />
                    </Box>
                </Box>

                <ProductDetailTabs
                    product={product}
                    longDescription={longDescription}
                    bulletPoints={bulletPoints}
                    materialItems={materialItems}
                    careItems={careItems}
                    tabValue={tabValue}
                    onTabChange={setTabValue}
                    reviewsRef={reviewsRef}
                />
            </Box>
        </Box>
    );
}
