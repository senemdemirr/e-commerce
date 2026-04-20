import {
    applyColorPreview,
    buildProductMask,
    colorizePixel,
    hexToRgb,
    normalizeHexColor,
    rgbToHsl,
} from '@/lib/productImageColorization.js';

describe('productImageColorization', () => {
    test('normalizeHexColor expands shorthand values', () => {
        expect(normalizeHexColor('#abc')).toBe('#aabbcc');
        expect(normalizeHexColor('123456')).toBe('#123456');
        expect(normalizeHexColor('not-a-color')).toBe('');
    });

    test('hexToRgb parses normalized colors', () => {
        expect(hexToRgb('#0f172a')).toEqual({ r: 15, g: 23, b: 42 });
    });

    test('applyColorPreview keeps white background pixels unchanged', () => {
        const pixels = new Uint8ClampedArray([255, 255, 255, 255]);

        applyColorPreview(pixels, '#ef4444');

        expect(Array.from(pixels)).toEqual([255, 255, 255, 255]);
    });

    test('buildProductMask isolates a centered product from the border background', () => {
        const width = 5;
        const height = 5;
        const pixels = new Uint8ClampedArray(width * height * 4);

        for (let index = 0; index < width * height; index += 1) {
            const offset = index * 4;
            pixels[offset] = 255;
            pixels[offset + 1] = 255;
            pixels[offset + 2] = 255;
            pixels[offset + 3] = 255;
        }

        for (let y = 1; y <= 3; y += 1) {
            for (let x = 1; x <= 3; x += 1) {
                const offset = ((y * width) + x) * 4;
                pixels[offset] = 160;
                pixels[offset + 1] = 160;
                pixels[offset + 2] = 160;
            }
        }

        const mask = buildProductMask(pixels, width, height);

        expect(mask[(2 * width) + 2]).toBe(1);
        expect(mask[0]).toBe(0);
        expect(mask[(4 * width) + 4]).toBe(0);
    });

    test('applyColorPreview shifts a neutral midtone toward the selected hue', () => {
        const pixels = new Uint8ClampedArray([128, 128, 128, 255]);

        applyColorPreview(pixels, '#2563eb');

        expect(pixels[2]).toBeGreaterThan(pixels[1]);
        expect(pixels[2]).toBeGreaterThan(pixels[0]);
    });

    test('colorizePixel darkens grayscale targets for black selections', () => {
        const targetHsl = rgbToHsl(17, 17, 17);
        const [red, green, blue] = colorizePixel(210, 185, 160, 255, targetHsl);

        expect(red).toBeLessThan(210);
        expect(Math.abs(red - green)).toBeLessThanOrEqual(1);
        expect(Math.abs(green - blue)).toBeLessThanOrEqual(1);
    });

    test('applyColorPreview changes only masked product pixels', () => {
        const pixels = new Uint8ClampedArray([
            255, 255, 255, 255,
            128, 128, 128, 255,
        ]);
        const mask = new Uint8Array([0, 1]);

        applyColorPreview(pixels, '#dc2626', mask);

        expect(Array.from(pixels.slice(0, 4))).toEqual([255, 255, 255, 255]);
        expect(pixels[4]).toBeGreaterThan(pixels[5]);
        expect(pixels[4]).toBeGreaterThan(pixels[6]);
    });
});
