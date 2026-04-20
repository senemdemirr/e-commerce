'use client';

import { useEffect, useRef, useState } from 'react';
import {
    applyColorPreview,
    buildProductMask,
    normalizeHexColor,
} from '@/lib/productImageColorization';

function getObjectFitClass(fit) {
    return fit === 'contain' ? 'object-contain' : 'object-cover';
}

function drawImageToCanvas(context, image, width, height, fit) {
    const imageWidth = image.naturalWidth || image.width || width;
    const imageHeight = image.naturalHeight || image.height || height;
    const widthRatio = width / imageWidth;
    const heightRatio = height / imageHeight;
    const scale = fit === 'contain'
        ? Math.min(widthRatio, heightRatio)
        : Math.max(widthRatio, heightRatio);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    context.clearRect(0, 0, width, height);
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export default function ColorizedProductImage({
    src,
    alt,
    colorHex = '',
    fit = 'cover',
    className = '',
    mediaClassName = '',
    loading = 'lazy',
}) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const baseFrameRef = useRef(null);
    const productMaskRef = useRef(null);
    const [loadedImage, setLoadedImage] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [isPreviewReady, setIsPreviewReady] = useState(false);
    const [frameVersion, setFrameVersion] = useState(0);

    useEffect(() => {
        const element = containerRef.current;

        if (!element) {
            return undefined;
        }

        const measure = () => {
            const nextWidth = Math.round(element.clientWidth);
            const nextHeight = Math.round(element.clientHeight);

            setCanvasSize((current) => (
                current.width === nextWidth && current.height === nextHeight
                    ? current
                    : { width: nextWidth, height: nextHeight }
            ));
        };

        measure();

        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setIsPreviewReady(false);

        if (!src || typeof window === 'undefined') {
            setLoadedImage(null);
            return undefined;
        }

        let active = true;
        const image = new window.Image();
        image.decoding = 'async';
        image.onload = () => {
            if (!active) {
                return;
            }

            setLoadedImage(image);
        };
        image.onerror = () => {
            if (!active) {
                return;
            }

            setLoadedImage(null);
        };
        image.src = src;

        return () => {
            active = false;
            image.onload = null;
            image.onerror = null;
        };
    }, [src]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !loadedImage || !canvasSize.width || !canvasSize.height) {
            return;
        }

        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
            return;
        }

        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.round(canvasSize.width * devicePixelRatio));
        const height = Math.max(1, Math.round(canvasSize.height * devicePixelRatio));

        canvas.width = width;
        canvas.height = height;

        drawImageToCanvas(context, loadedImage, width, height, fit);
        baseFrameRef.current = context.getImageData(0, 0, width, height);
        productMaskRef.current = buildProductMask(
            baseFrameRef.current.data,
            width,
            height
        );
        setFrameVersion((current) => current + 1);
    }, [loadedImage, canvasSize.width, canvasSize.height, fit]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const baseFrame = baseFrameRef.current;

        if (!canvas || !baseFrame) {
            return;
        }

        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
            return;
        }

        const nextFrame = new ImageData(
            new Uint8ClampedArray(baseFrame.data),
            baseFrame.width,
            baseFrame.height
        );
        const normalizedColor = normalizeHexColor(colorHex);

        if (normalizedColor) {
            applyColorPreview(nextFrame.data, normalizedColor, productMaskRef.current);
        }

        context.putImageData(nextFrame, 0, 0);
        setIsPreviewReady(true);
    }, [colorHex, frameVersion]);

    const objectFitClass = getObjectFitClass(fit);

    return (
        <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`}>
            <img
                src={src}
                alt={alt}
                loading={loading}
                draggable="false"
                className={`absolute inset-0 h-full w-full ${objectFitClass} transition-opacity duration-200 ${mediaClassName} ${isPreviewReady ? 'opacity-0' : 'opacity-100'}`}
            />
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${mediaClassName} ${isPreviewReady ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
