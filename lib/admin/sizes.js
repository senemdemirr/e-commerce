function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const FALLBACK_SIZES = [
    {
        id: 1,
        name: 'S',
        created_at: '2026-03-04T09:00:00.000Z',
        product_count: 3,
        variant_count: 5,
    },
    {
        id: 2,
        name: 'M',
        created_at: '2026-03-02T09:00:00.000Z',
        product_count: 1,
        variant_count: 2,
    },
    {
        id: 3,
        name: 'XL',
        created_at: '2026-03-01T09:00:00.000Z',
        product_count: 0,
        variant_count: 0,
    },
];

export function normalizeSizePayload(payload = {}) {
    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
    };
}

export function normalizeSizeRecord(size = {}) {
    const normalized = {
        id: Number(size.id || 0),
        name: String(size.name || '').trim(),
        created_at: size.created_at || null,
        product_count: Number(size.product_count || 0),
        variant_count: Number(size.variant_count || 0),
    };

    return {
        ...normalized,
        is_used: normalized.product_count > 0 || normalized.variant_count > 0,
    };
}

export function isSizeTestMode() {
    return process.env.NODE_ENV === 'test';
}

export function listFallbackSizes() {
    return clone(FALLBACK_SIZES)
        .map((size) => normalizeSizeRecord(size))
        .sort((left, right) => {
            const leftTime = Date.parse(left.created_at || 0);
            const rightTime = Date.parse(right.created_at || 0);

            if (rightTime !== leftTime) {
                return rightTime - leftTime;
            }

            return Number(right.id || 0) - Number(left.id || 0);
        });
}

export function findFallbackSizeById(id) {
    return listFallbackSizes().find((size) => size.id === Number(id)) || null;
}

export function createFallbackSize({ name }) {
    const sizes = listFallbackSizes();
    const nextId = sizes.reduce((maxId, size) => Math.max(maxId, size.id), 0) + 1;

    return normalizeSizeRecord({
        id: nextId,
        name,
        created_at: new Date().toISOString(),
        product_count: 0,
        variant_count: 0,
    });
}

export function updateFallbackSize(id, payload) {
    const currentSize = findFallbackSizeById(id);

    if (!currentSize) {
        return null;
    }

    const normalizedPayload = normalizeSizePayload(payload);

    if (currentSize.name === normalizedPayload.name) {
        return {
            ...currentSize,
            updated: false,
        };
    }

    return {
        ...currentSize,
        name: normalizedPayload.name,
        updated: true,
    };
}

export function deleteFallbackSize(id) {
    return Boolean(findFallbackSizeById(id));
}
