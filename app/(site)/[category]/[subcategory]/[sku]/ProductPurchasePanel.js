"use client";

import { Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddToCartButton from './AddToCartButton';
import ProductOptions from './ProductOptions';
import ProductRatingStars from './ProductRatingStars';
import QuantitySelector from './QuantitySelector';

export default function ProductPurchasePanel({
    product,
    displayPrice,
    isFavorite,
    favoritePending,
    onToggleFavorite,
    onReviewsClick,
    colorOptions,
    selectedColor,
    onColorChange,
    availableSizes,
    selectedSize,
    onSizeChange,
    quantity,
    onQuantityChange,
    onAddToCart,
    loading,
    isInStock,
    hasMissingVariant,
    activeStock,
    showLowStockMessage,
}) {
    return (
        <>
            <Box className="mb-4 border-b border-[#f1f3f2] dark:border-[#2a362f] pb-6">
                <Box className="flex justify-between items-start mb-2 gap-4">
                    <Box
                        component="h1"
                        className="text-3xl md:text-4xl font-bold text-text-dark dark:text-white leading-tight"
                    >
                        {product.title}
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={onToggleFavorite}
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
                    </Box>
                </Box>

                <Box className="flex items-center gap-4 mb-4">
                    <ProductRatingStars rating={product.average_rating || 0} />
                    <Box
                        component="span"
                        onClick={onReviewsClick}
                        className="text-sm text-[#6d7e73] underline cursor-pointer hover:text-primary"
                    >
                        {product.review_count || 0} Değerlendirme
                    </Box>
                </Box>

                <Box className="flex items-end gap-3">
                    <Box component="span" className="text-3xl font-bold text-primary">₺{displayPrice}</Box>
                </Box>
            </Box>

            <Box className="mb-8">
                <Box component="p" className="text-[#6d7e73] dark:text-[#a0aead] leading-relaxed">
                    {product.description}
                </Box>
            </Box>

            <ProductOptions
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                onColorChange={onColorChange}
                availableSizes={availableSizes}
                selectedSize={selectedSize}
                onSizeChange={onSizeChange}
            />

            <Box className="flex flex-col gap-4 mt-auto">
                <Box className="flex gap-4 h-12">
                    <QuantitySelector value={quantity} onChange={onQuantityChange} />
                    <AddToCartButton
                        onClick={onAddToCart}
                        loading={loading}
                        isInStock={isInStock}
                        disabled={loading || hasMissingVariant || !isInStock}
                    />
                </Box>
                <Box className="flex items-center gap-2 text-sm text-[#6d7e73] mt-2">
                    <CheckCircleIcon sx={{ fontSize: 18, color: isInStock ? '#8dc8a1' : '#ef4444' }} />
                    <Box component="span">
                        {isInStock ? 'In Stock.' : 'Out of Stock.'} <Box component="span" className="font-medium text-text-dark dark:text-white">Free shipping</Box> (over 1000₺)
                    </Box>
                </Box>
                {showLowStockMessage && (
                    <Box className="inline-flex items-center self-start rounded-full bg-[#fff4e8] px-3 py-1 text-sm font-semibold text-[#b45309]">
                        Last {activeStock} product{activeStock === 1 ? '' : 's'}
                    </Box>
                )}
            </Box>
        </>
    );
}
