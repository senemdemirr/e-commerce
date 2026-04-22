export function createEmptyColor() {
    return {
        name: '',
        hex: '#111827',
    };
}

export function createEmptyProductLookups() {
    return {
        colors: [],
        sizes: [],
        details: {
            material: [],
            care: [],
            bullet_point: [],
        },
    };
}

export function createEmptySize() {
    return '';
}

export function createEmptyTextRow() {
    return '';
}

export function createEmptyVariant(overrides = {}) {
    return {
        colorName: '',
        sizeLabel: '',
        sku: '',
        price: '',
        stock: '0',
        isDefault: false,
        ...overrides,
    };
}

export function createSku(value = '') {
    const letterMap = {
        c: /[çÇ]/g,
        g: /[ğĞ]/g,
        i: /[ıİ]/g,
        o: /[öÖ]/g,
        s: /[şŞ]/g,
        u: /[üÜ]/g,
    };

    let normalized = String(value).trim();

    Object.entries(letterMap).forEach(([replacement, pattern]) => {
        normalized = normalized.replace(pattern, replacement);
    });

    return normalized
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .toUpperCase();
}

function normalizeLookupKey(value = '') {
    return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function dedupeStringOptions(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    const options = [];
    const seen = new Set();

    for (const item of value) {
        const label = String(item || '').trim();

        if (!label) {
            continue;
        }

        const key = normalizeLookupKey(label);

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        options.push(label);
    }

    return options;
}

export function normalizeProductLookups(value) {
    const nextValue = value && typeof value === 'object' ? value : {};
    const colors = Array.isArray(nextValue.colors)
        ? nextValue.colors.reduce((result, item) => {
            const name = String(item?.name || '').trim();
            const hex = String(item?.hex || '').trim() || '#111827';
            const key = normalizeLookupKey(name);

            if (!name || result.some((color) => normalizeLookupKey(color.name) === key)) {
                return result;
            }

            result.push({ name, hex });
            return result;
        }, [])
        : [];
    const details = nextValue.details && typeof nextValue.details === 'object' && !Array.isArray(nextValue.details)
        ? nextValue.details
        : {};

    return {
        colors,
        sizes: dedupeStringOptions(nextValue.sizes),
        details: {
            material: dedupeStringOptions(details.material),
            care: dedupeStringOptions(details.care),
            bullet_point: dedupeStringOptions(details.bullet_point || details.bullet_points),
        },
    };
}

export function findLookupValue(options, value) {
    const lookupKey = normalizeLookupKey(value);

    if (!lookupKey || !Array.isArray(options)) {
        return null;
    }

    return options.find((item) => normalizeLookupKey(item) === lookupKey) || null;
}

export function findLookupColor(options, value) {
    const lookupKey = normalizeLookupKey(value);

    if (!lookupKey || !Array.isArray(options)) {
        return null;
    }

    return options.find((item) => normalizeLookupKey(item?.name) === lookupKey) || null;
}

export function normalizeSizeRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptySize()];
    }

    const seen = new Set();
    const normalized = value.reduce((result, item) => {
        const label = String(item || '').trim();

        if (!label) {
            return result;
        }

        const key = normalizeLookupKey(label);

        if (seen.has(key)) {
            return result;
        }

        seen.add(key);
        result.push(label);
        return result;
    }, []);

    return normalized.length > 0 ? normalized : [createEmptySize()];
}

export function normalizeTextRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptyTextRow()];
    }

    const normalized = value.reduce((result, item) => {
        const label = String(item || '').trim();

        if (!label) {
            return result;
        }

        result.push(label);
        return result;
    }, []);

    return normalized.length > 0 ? normalized : [createEmptyTextRow()];
}

export function normalizeColorRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptyColor()];
    }

    const seen = new Set();
    const normalized = value.reduce((result, color) => {
        const name = String(color?.name || '').trim();
        const hex = String(color?.hex || '#111827').trim() || '#111827';
        const key = normalizeLookupKey(name);

        if (!name || seen.has(key)) {
            return result;
        }

        seen.add(key);
        result.push({ name, hex });
        return result;
    }, []);

    return normalized.length > 0 ? normalized : [createEmptyColor()];
}

export function normalizeVariantRows(value, fallbackPrice = '') {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptyVariant({ price: fallbackPrice ? String(fallbackPrice) : '' })];
    }

    const normalized = value.map((variant) => createEmptyVariant({
        colorName: String(variant?.color_name || variant?.colorName || '').trim(),
        sizeLabel: String(variant?.size_label || variant?.sizeLabel || '').trim(),
        sku: String(variant?.sku || '').trim(),
        price: variant?.price !== undefined && variant?.price !== null && variant?.price !== ''
            ? String(variant.price)
            : (fallbackPrice ? String(fallbackPrice) : ''),
        stock: variant?.stock !== undefined && variant?.stock !== null && variant?.stock !== ''
            ? String(variant.stock)
            : '0',
        isDefault: Boolean(variant?.is_default ?? variant?.isDefault),
    }));

    if (!normalized.some((variant) => variant.isDefault)) {
        normalized[0].isDefault = true;
    }

    return normalized;
}

export function normalizeVariantPayload(variants, baseSku, basePrice) {
    const normalized = variants
        .map((variant) => {
            const colorName = String(variant?.colorName || '').trim();
            const sizeLabel = String(variant?.sizeLabel || '').trim();
            const hasAnyValue = Boolean(
                colorName
                || sizeLabel
                || String(variant?.sku || '').trim()
                || String(variant?.price || '').trim()
                || String(variant?.stock || '').trim()
                || variant?.isDefault
            );

            if (!hasAnyValue) {
                return null;
            }

            const generatedSku = createSku(
                [baseSku, colorName, sizeLabel].filter(Boolean).join('-')
            );

            return {
                color_name: colorName,
                size_label: sizeLabel,
                sku: createSku(variant?.sku || generatedSku),
                price: String(variant?.price || '').trim() || String(basePrice || '').trim(),
                stock: String(variant?.stock || '').trim() || '0',
                is_default: Boolean(variant?.isDefault),
            };
        })
        .filter(Boolean);

    if (normalized.length > 0 && !normalized.some((variant) => variant.is_default)) {
        normalized[0].is_default = true;
    }

    return normalized;
}

export function buildVariantMatrix({ colors, sizes, baseSku, basePrice, existingVariants = [] }) {
    const availableColors = colors.length > 0 ? colors : [{ name: '', hex: '' }];
    const availableSizes = sizes.length > 0 ? sizes : [''];
    const existingMap = new Map(
        existingVariants.map((variant) => [
            `${String(variant.colorName || '').trim()}::${String(variant.sizeLabel || '').trim()}`,
            variant,
        ])
    );

    const nextVariants = [];

    availableColors.forEach((color, colorIndex) => {
        availableSizes.forEach((size, sizeIndex) => {
            const colorName = String(color?.name || '').trim();
            const sizeLabel = String(size || '').trim();
            const key = `${colorName}::${sizeLabel}`;
            const existing = existingMap.get(key);

            nextVariants.push(createEmptyVariant({
                colorName,
                sizeLabel,
                sku: existing?.sku || createSku([baseSku, colorName, sizeLabel].filter(Boolean).join('-')),
                price: existing?.price || (basePrice ? String(basePrice) : ''),
                stock: existing?.stock || '0',
                isDefault: existing
                    ? Boolean(existing.isDefault)
                    : nextVariants.length === 0 && colorIndex === 0 && sizeIndex === 0,
            }));
        });
    });

    return nextVariants.length > 0 ? nextVariants : [createEmptyVariant({ price: basePrice ? String(basePrice) : '' })];
}
