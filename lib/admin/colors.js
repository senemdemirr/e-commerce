import { listFallbackColorRecords } from './test-data.js';

export function normalizeColorHex(value, options = {}) {
    const { fallback = '' } = options;
    const normalized = String(value || '').trim().toUpperCase();

    if (!normalized) {
        return fallback;
    }

    return normalized.startsWith('#') ? normalized : `#${normalized}`.replace(/^##/, '#');
}

export function isValidColorHex(value) {
    return /^#[0-9A-F]{6}$/.test(normalizeColorHex(value));
}

export function normalizeColorPayload(payload = {}) {
    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
        hex: normalizeColorHex(payload.hex ?? payload.code),
    };
}

export function normalizeColorRecord(color = {}) {
    const normalized = {
        id: Number(color.id || 0),
        name: String(color.name || '').trim(),
        hex: normalizeColorHex(color.hex ?? color.code, { fallback: '#111827' }),
        created_at: color.created_at || null,
        product_count: Number(color.product_count || 0),
        variant_count: Number(color.variant_count || 0),
    };

    return {
        ...normalized,
        is_used: normalized.product_count > 0 || normalized.variant_count > 0,
    };
}

export function isColorTestMode() {
    return process.env.NODE_ENV === 'test';
}

export function listFallbackColors() {
    return listFallbackColorRecords()
        .map((color) => normalizeColorRecord(color))
        .sort((left, right) => {
            const leftTime = Date.parse(left.created_at || 0);
            const rightTime = Date.parse(right.created_at || 0);

            if (rightTime !== leftTime) {
                return rightTime - leftTime;
            }

            return Number(right.id || 0) - Number(left.id || 0);
        });
}

export function findFallbackColorById(id) {
    return listFallbackColors().find((color) => color.id === Number(id)) || null;
}

export function createFallbackColor({ name, hex }) {
    const colors = listFallbackColors();
    const nextId = colors.reduce((maxId, color) => Math.max(maxId, color.id), 0) + 1;

    return normalizeColorRecord({
        id: nextId,
        name,
        hex,
        created_at: new Date().toISOString(),
        product_count: 0,
        variant_count: 0,
    });
}

export function updateFallbackColor(id, payload) {
    const currentColor = findFallbackColorById(id);

    if (!currentColor) {
        return null;
    }

    const normalizedPayload = normalizeColorPayload(payload);

    if (
        currentColor.name === normalizedPayload.name
        && currentColor.hex === normalizedPayload.hex
    ) {
        return {
            ...currentColor,
            updated: false,
        };
    }

    return {
        ...currentColor,
        name: normalizedPayload.name,
        hex: normalizedPayload.hex,
        updated: true,
    };
}

export function deleteFallbackColor(id) {
    return Boolean(findFallbackColorById(id));
}
