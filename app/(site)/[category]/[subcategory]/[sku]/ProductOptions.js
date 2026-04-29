"use client";

import { Box } from '@mui/material';

function colorKey(color, index) {
    return `${color?.name || ''}::${color?.hex || ''}::${index}`;
}

function ColorSelector({ colorOptions, selectedColor, onColorChange }) {
    if (!colorOptions.length) {
        return null;
    }

    return (
        <Box className="mb-6">
            <Box
                component="h3"
                className="text-sm font-bold text-text-dark dark:text-white uppercase tracking-wider mb-3"
            >
                Color: <Box component="span" className="font-normal text-[#6d7e73]">{selectedColor.name}</Box>
            </Box>
            <Box className="flex gap-3">
                {colorOptions.map((color, index) => (
                    <Box
                        key={colorKey(color, index)}
                        component="button"
                        type="button"
                        aria-label={`Color ${color.name}`}
                        onClick={() => onColorChange(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all focus:outline-none ${selectedColor.hex === color.hex
                            ? "border-white ring-2 ring-primary shadow-sm"
                            : "border-transparent hover:border-white hover:ring-2 hover:ring-gray-200"
                            }`}
                        style={{ backgroundColor: color.hex }}
                    />
                ))}
            </Box>
        </Box>
    );
}

function SizeSelector({ availableSizes, selectedSize, onSizeChange }) {
    if (!availableSizes.length) {
        return null;
    }

    return (
        <Box className="mb-8">
            <Box className="flex justify-between items-center mb-3">
                <Box
                    component="h3"
                    className="text-sm font-bold text-text-dark dark:text-white uppercase tracking-wider"
                >
                    {availableSizes[0] === 'Standard' ? 'Option:' : 'Size:'} <Box component="span" className="font-normal text-[#6d7e73]">{selectedSize}</Box>
                </Box>
            </Box>
            <Box className="flex flex-wrap gap-3">
                {availableSizes.map((size, index) => (
                    <Box
                        key={`${size}-${index}`}
                        component="button"
                        type="button"
                        onClick={() => onSizeChange(size)}
                        className={`h-10 min-w-[3rem] px-2 rounded-lg border transition-all ${selectedSize === size
                            ? "border-2 border-primary bg-primary/10 text-primary font-bold"
                            : "border-[#e5e7eb] dark:border-[#2a362f] text-text-dark dark:text-white hover:border-primary hover:text-primary"
                            }`}
                    >
                        {size}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default function ProductOptions({
    colorOptions,
    selectedColor,
    onColorChange,
    availableSizes,
    selectedSize,
    onSizeChange,
}) {
    return (
        <>
            <ColorSelector
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                onColorChange={onColorChange}
            />
            <SizeSelector
                availableSizes={availableSizes}
                selectedSize={selectedSize}
                onSizeChange={onSizeChange}
            />
        </>
    );
}
