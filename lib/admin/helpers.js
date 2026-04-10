// Admin yardimci fonksiyonlar (pagination, search, response format)
// TDD: Ilgili testler -> tests/admin/admin-helpers.test.mjs

function normalizePositiveInteger(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function paginate(page = 1, limit = 10) {
    const safePage = normalizePositiveInteger(page, 1);
    const safeLimit = normalizePositiveInteger(limit, 10);

    return {
        page: safePage,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
    };
}

export function buildSearchClause(searchTerm = '', fields = [], startIndex = 1) {
    const normalizedSearch = typeof searchTerm === 'string' ? searchTerm.trim() : '';
    const safeFields = Array.isArray(fields) ? fields.filter(Boolean) : [];

    if (!normalizedSearch || safeFields.length === 0) {
        return {
            clause: '',
            values: [],
        };
    }

    const values = safeFields.map(() => `%${normalizedSearch}%`);
    const comparisons = safeFields.map(
        (field, index) => `${field} ILIKE $${startIndex + index}`
    );

    return {
        clause: `AND (${comparisons.join(' OR ')})`,
        values,
    };
}

export function formatAdminResponse(data = [], total = 0, page = 1, limit = 10) {
    const { page: safePage, limit: safeLimit } = paginate(page, limit);
    const safeTotal = Number.isFinite(Number(total)) ? Number(total) : 0;

    return {
        data,
        meta: {
            total: safeTotal,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(safeTotal / safeLimit)),
        },
    };
}
