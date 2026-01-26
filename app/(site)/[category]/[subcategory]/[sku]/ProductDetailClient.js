"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from "@/context/CartContext";
import {
    Button,
    Tabs,
    Tab,
    Box,
    Typography
} from '@mui/material';

// MUI Icons
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import IronIcon from '@mui/icons-material/Iron';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';

export default function ProductDetailClient({ product }) {
    const { addToCart, loading } = useCart();

    // Process colors: handle both old (string array) and new (object array) formats
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const initialColor = colors.length > 0
        ? (typeof colors[0] === 'object' ? colors[0] : { name: colors[0], hex: colors[0] })
        : { name: "", hex: "" };

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
    const [quantity, setQuantity] = useState(1);
    const [tabValue, setTabValue] = useState(0);

    const handleAddToCart = () => {
        addToCart({
            ...product,
            selectedColor: selectedColor.name,
            selectedSize
        }, quantity);
    };

    const details = product.details || {};
    const bulletPoints = details.bullet_points || [];
    const materialCare = details.care || [];

    return (
        <div className="flex-grow flex justify-center w-full px-4 md:px-10 py-5">
            <div className="flex flex-col max-w-7xl w-full">
                {/* Product Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    {/* Left Column: Gallery */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Main Image */}
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

                    {/* Right Column: Details */}
                    <div className="lg:col-span-5 flex flex-col pt-2">
                        {/* Title & Rating */}
                        <div className="mb-4 border-b border-[#f1f3f2] dark:border-[#2a362f] pb-6">
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-white leading-tight">
                                    {product.title}
                                </h1>
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-primary">₺{product.price}</span>
                            </div>
                        </div>

                        {/* Description Short */}
                        <div className="mb-8">
                            <p className="text-[#6d7e73] dark:text-[#a0aead] leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Color Variants */}
                        {colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-text-dark dark:text-white uppercase tracking-wider mb-3">
                                    Color: <span className="font-normal text-[#6d7e73]">{selectedColor.name}</span>
                                </h3>
                                <div className="flex gap-3">
                                    {colors.map((colorObj, index) => {
                                        const color = typeof colorObj === 'object' ? colorObj : { name: colorObj, hex: colorObj };
                                        return (
                                            <button
                                                key={index}
                                                aria-label={`Color ${color.name}`}
                                                onClick={() => setSelectedColor(color)}
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

                        {/* Size Variants */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-text-dark dark:text-white uppercase tracking-wider">
                                        {product.sizes[0] === 'Standard' ? 'Option:' : 'Size:'} <span className="font-normal text-[#6d7e73]">{selectedSize}</span>
                                    </h3>
                                    {product.sizes[0] !== 'Standard' && (
                                        <button className="text-xs text-primary font-medium underline">Size Guide</button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size, index) => (
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

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="flex gap-4 h-12">
                                {/* Quantity */}
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
                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={loading}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                                >
                                    <ShoppingBagIcon sx={{ fontSize: 20 }} />
                                    {loading ? "Adding..." : "Add to Cart"}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#6d7e73] mt-2">
                                <CheckCircleIcon sx={{ fontSize: 18, color: '#8dc8a1' }} />
                                <span>In Stock. <span className="font-medium text-text-dark dark:text-white">Free shipping</span> (over 500₺)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed Content Section */}
                <div className="mt-20 border-t border-[#f1f3f2] dark:border-[#2a362f] pt-10">
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
                            <Tab label="Reviews (124)" />
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
                        <div className="py-10 text-center text-[#6d7e73]">
                            No reviews yet.
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
