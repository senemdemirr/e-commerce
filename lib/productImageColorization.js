function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
}

function clampChannel(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function getPercentile(values, percentile) {
    if (!Array.isArray(values) || values.length === 0) {
        return 0;
    }

    const sorted = [...values].sort((left, right) => left - right);
    const position = clamp(percentile) * (sorted.length - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);

    if (lowerIndex === upperIndex) {
        return sorted[lowerIndex];
    }

    const weight = position - lowerIndex;

    return sorted[lowerIndex] + ((sorted[upperIndex] - sorted[lowerIndex]) * weight);
}

export function normalizeHexColor(hex) {
    const value = typeof hex === 'string' ? hex.trim().replace(/^#/, '') : '';

    if (/^[0-9a-fA-F]{3}$/.test(value)) {
        return `#${value.split('').map((character) => character + character).join('').toLowerCase()}`;
    }

    if (/^[0-9a-fA-F]{6}$/.test(value)) {
        return `#${value.toLowerCase()}`;
    }

    return '';
}

export function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex);

    if (!normalized) {
        return null;
    }

    return {
        r: Number.parseInt(normalized.slice(1, 3), 16),
        g: Number.parseInt(normalized.slice(3, 5), 16),
        b: Number.parseInt(normalized.slice(5, 7), 16),
    };
}

export function rgbToHsl(r, g, b) {
    const red = clamp(r / 255);
    const green = clamp(g / 255);
    const blue = clamp(b / 255);
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;

    if (max === min) {
        return { h: 0, s: 0, l: lightness };
    }

    const delta = max - min;
    const saturation = lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min);

    let hue;

    switch (max) {
        case red:
            hue = ((green - blue) / delta) + (green < blue ? 6 : 0);
            break;
        case green:
            hue = ((blue - red) / delta) + 2;
            break;
        default:
            hue = ((red - green) / delta) + 4;
            break;
    }

    return {
        h: hue / 6,
        s: saturation,
        l: lightness,
    };
}

function hueToRgb(p, q, t) {
    let nextT = t;

    if (nextT < 0) {
        nextT += 1;
    }

    if (nextT > 1) {
        nextT -= 1;
    }

    if (nextT < 1 / 6) {
        return p + ((q - p) * 6 * nextT);
    }

    if (nextT < 1 / 2) {
        return q;
    }

    if (nextT < 2 / 3) {
        return p + ((q - p) * ((2 / 3) - nextT) * 6);
    }

    return p;
}

export function hslToRgb(h, s, l) {
    const hue = clamp(h);
    const saturation = clamp(s);
    const lightness = clamp(l);

    if (saturation === 0) {
        const value = Math.round(lightness * 255);

        return { r: value, g: value, b: value };
    }

    const q = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - (lightness * saturation);
    const p = (2 * lightness) - q;

    return {
        r: Math.round(hueToRgb(p, q, hue + (1 / 3)) * 255),
        g: Math.round(hueToRgb(p, q, hue) * 255),
        b: Math.round(hueToRgb(p, q, hue - (1 / 3)) * 255),
    };
}

export function shouldPreserveNeutralPixel(r, g, b, a = 255) {
    if (a <= 12) {
        return true;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    return min >= 244 && (max - min) <= 10;
}

function getPixelOffset(index) {
    return index * 4;
}

function readPixel(data, index) {
    const offset = getPixelOffset(index);

    return {
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2],
        a: data[offset + 3],
    };
}

function getBrightness(r, g, b) {
    return ((r + g + b) / 3);
}

function getSaturation(r, g, b) {
    return Math.max(r, g, b) - Math.min(r, g, b);
}

function getColorDistance(r, g, b, reference) {
    return Math.abs(r - reference.r) + Math.abs(g - reference.g) + Math.abs(b - reference.b);
}

function collectBorderSamples(data, width, height) {
    const samples = [];
    const horizontalMargin = Math.max(2, Math.min(28, Math.round(width * 0.035)));
    const verticalMargin = Math.max(2, Math.min(28, Math.round(height * 0.025)));
    const step = Math.max(1, Math.round(Math.min(width, height) / 120));

    function pushSample(index) {
        const { r, g, b, a } = readPixel(data, index);

        samples.push({
            r,
            g,
            b,
            a,
            brightness: getBrightness(r, g, b),
            saturation: getSaturation(r, g, b),
        });
    }

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < horizontalMargin; x += 1) {
            pushSample((y * width) + x);
        }

        for (let x = Math.max(horizontalMargin, width - horizontalMargin); x < width; x += 1) {
            pushSample((y * width) + x);
        }
    }

    for (let x = 0; x < width; x += step) {
        for (let y = 0; y < verticalMargin; y += 1) {
            pushSample((y * width) + x);
        }

        for (let y = Math.max(verticalMargin, height - verticalMargin); y < height; y += 1) {
            pushSample((y * width) + x);
        }
    }

    return samples;
}

function buildBackgroundModel(data, width, height) {
    const samples = collectBorderSamples(data, width, height);

    if (samples.length === 0) {
        return {
            reference: { r: 255, g: 255, b: 255 },
            nearDistanceLimit: 30,
            softDistanceLimit: 70,
            brightnessFloor: 180,
            saturationLimit: 48,
        };
    }

    const brightnessValues = samples.map((sample) => sample.brightness);
    const saturationValues = samples.map((sample) => sample.saturation);
    const brightnessMedian = getPercentile(brightnessValues, 0.5);
    const saturationCutoff = Math.max(18, getPercentile(saturationValues, 0.8) + 12);
    const preferredSamples = samples.filter((sample) => (
        sample.brightness >= (brightnessMedian - 18)
        && sample.saturation <= saturationCutoff
        && sample.a > 12
    ));
    const referencePool = preferredSamples.length >= 24 ? preferredSamples : samples;
    const reference = {
        r: clampChannel(getPercentile(referencePool.map((sample) => sample.r), 0.5)),
        g: clampChannel(getPercentile(referencePool.map((sample) => sample.g), 0.5)),
        b: clampChannel(getPercentile(referencePool.map((sample) => sample.b), 0.5)),
    };
    const distanceValues = referencePool.map((sample) => getColorDistance(sample.r, sample.g, sample.b, reference));

    return {
        reference,
        nearDistanceLimit: Math.max(20, Math.min(92, getPercentile(distanceValues, 0.9) + 18)),
        softDistanceLimit: Math.max(40, Math.min(140, getPercentile(distanceValues, 0.97) + 34)),
        brightnessFloor: Math.max(70, getPercentile(brightnessValues, 0.08) - 44),
        saturationLimit: Math.max(18, Math.min(84, getPercentile(saturationValues, 0.9) + 18)),
    };
}

function isBackgroundPixel(data, index, model) {
    const { r, g, b, a } = readPixel(data, index);

    if (a <= 12 || shouldPreserveNeutralPixel(r, g, b, a)) {
        return true;
    }

    const brightness = getBrightness(r, g, b);
    const saturation = getSaturation(r, g, b);
    const distance = getColorDistance(r, g, b, model.reference);

    if (distance <= model.nearDistanceLimit) {
        return true;
    }

    if (
        saturation <= model.saturationLimit
        && brightness >= model.brightnessFloor
        && distance <= model.softDistanceLimit
    ) {
        return true;
    }

    return false;
}

export function buildProductMask(data, width, height) {
    const pixelCount = width * height;

    if (!pixelCount || !data || data.length < pixelCount * 4) {
        return null;
    }

    const model = buildBackgroundModel(data, width, height);
    const backgroundMask = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let queueHead = 0;
    let queueTail = 0;

    function enqueue(index) {
        if (backgroundMask[index] || !isBackgroundPixel(data, index, model)) {
            return;
        }

        backgroundMask[index] = 1;
        queue[queueTail] = index;
        queueTail += 1;
    }

    for (let x = 0; x < width; x += 1) {
        enqueue(x);
        enqueue(((height - 1) * width) + x);
    }

    for (let y = 0; y < height; y += 1) {
        enqueue(y * width);
        enqueue((y * width) + (width - 1));
    }

    while (queueHead < queueTail) {
        const index = queue[queueHead];
        const x = index % width;
        const y = Math.floor(index / width);

        queueHead += 1;

        if (x > 0) {
            enqueue(index - 1);
        }

        if (x < width - 1) {
            enqueue(index + 1);
        }

        if (y > 0) {
            enqueue(index - width);
        }

        if (y < height - 1) {
            enqueue(index + width);
        }
    }

    const productMask = new Uint8Array(pixelCount);

    for (let index = 0; index < pixelCount; index += 1) {
        productMask[index] = backgroundMask[index] ? 0 : 1;
    }

    return productMask;
}

export function colorizePixel(r, g, b, a, targetHsl) {
    if (!targetHsl || shouldPreserveNeutralPixel(r, g, b, a)) {
        return [r, g, b, a];
    }

    const sourceHsl = rgbToHsl(r, g, b);

    if (targetHsl.s < 0.08) {
        const grayscale = Math.round((0.299 * r) + (0.587 * g) + (0.114 * b));
        const shifted = Math.round((grayscale * 0.75) + (targetHsl.l * 255 * 0.25));

        return [shifted, shifted, shifted, a];
    }

    const saturation = clamp((targetHsl.s * 0.82) + (sourceHsl.s * 0.18));
    const lightnessShift = (targetHsl.l - 0.5) * 0.18;
    const lightness = clamp(sourceHsl.l + lightnessShift);
    const nextColor = hslToRgb(targetHsl.h, saturation, lightness);

    return [nextColor.r, nextColor.g, nextColor.b, a];
}

export function applyColorPreview(data, colorHex, productMask = null) {
    const targetRgb = hexToRgb(colorHex);

    if (!targetRgb) {
        return false;
    }

    const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

    for (let index = 0; index < data.length; index += 4) {
        if (productMask && productMask[index / 4] !== 1) {
            continue;
        }

        const [nextR, nextG, nextB, nextA] = colorizePixel(
            data[index],
            data[index + 1],
            data[index + 2],
            data[index + 3],
            targetHsl
        );

        data[index] = nextR;
        data[index + 1] = nextG;
        data[index + 2] = nextB;
        data[index + 3] = nextA;
    }

    return true;
}
