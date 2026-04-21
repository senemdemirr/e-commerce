export function createEmptyColor() {
    return {
        name: '',
        hex: '#111827',
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

export function normalizeSizeRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptySize()];
    }

    return value.map((item) => String(item || '').trim());
}

export function normalizeTextRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptyTextRow()];
    }

    return value.map((item) => String(item || '').trim());
}

export function normalizeColorRows(value) {
    if (!Array.isArray(value) || value.length === 0) {
        return [createEmptyColor()];
    }

    return value.map((color) => ({
        name: String(color?.name || '').trim(),
        hex: String(color?.hex || '#111827').trim() || '#111827',
    }));
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
