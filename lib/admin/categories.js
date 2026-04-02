const FALLBACK_CATEGORIES = [
    {
        id: 1,
        name: 'Eski İsim',
        slug: 'eski-slug',
        activate: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        product_count: 0,
        subcategory_count: 1,
        subcategories: [
            {
                id: 1,
                category_id: 1,
                name: 'Eski Alt Kategori',
                slug: 'eski-alt-slug',
                created_at: '2026-01-01T00:00:00.000Z',
                product_count: 0,
            },
        ],
    },
    {
        id: 2,
        name: 'Elektronik',
        slug: 'elektronik',
        activate: 0,
        created_at: '2026-01-02T00:00:00.000Z',
        product_count: 0,
        subcategory_count: 0,
        subcategories: [],
    },
];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function isAdminRequest(req) {
    const role = req?.headers?.get?.('role') || req?.headers?.get?.('x-user-role');
    return role === 'admin';
}

function normalizeCategoryActivate(value, fallback = 1) {
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return Number(value) === 1 ? 1 : 0;
}

export function normalizeCategoryPayload(payload = {}, options = {}) {
    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
        slug: typeof payload.slug === 'string' ? payload.slug.trim() : '',
        activate: normalizeCategoryActivate(
            payload.activate ?? payload.is_active,
            options.defaultActivate ?? 1
        ),
    };
}

export function isValidCategorySlug(slug) {
    return /^[a-z0-9-]+$/.test(slug);
}

export function isCategoryTestMode() {
    return process.env.NODE_ENV === 'test';
}

export function buildCategoriesWithSubcategories(rows = []) {
    const categoriesMap = new Map();

    for (const row of rows) {
        if (!categoriesMap.has(row.category_id)) {
            categoriesMap.set(row.category_id, {
                id: row.category_id,
                name: row.category_name,
                slug: row.category_slug,
                activate: normalizeCategoryActivate(row.category_activate),
                created_at: row.category_created_at || null,
                product_count: Number(row.category_product_count || 0),
                subcategory_count: Number(row.category_subcategory_count || 0),
                subcategories: [],
            });
        }

        if (row.subcategory_id) {
            categoriesMap.get(row.category_id).subcategories.push({
                id: row.subcategory_id,
                category_id: row.category_id,
                name: row.subcategory_name,
                slug: row.subcategory_slug,
                created_at: row.subcategory_created_at || null,
                product_count: Number(row.subcategory_product_count || 0),
            });
        }
    }

    return Array.from(categoriesMap.values());
}

export function listFallbackCategories() {
    return clone(FALLBACK_CATEGORIES)
        .map((category) => ({
            ...category,
            activate: normalizeCategoryActivate(category.activate),
            product_count: Number(category.product_count || 0),
            subcategory_count: Number(category.subcategory_count || category.subcategories?.length || 0),
            subcategories: Array.isArray(category.subcategories)
                ? category.subcategories
                    .map((subcategory) => ({
                        ...subcategory,
                        product_count: Number(subcategory.product_count || 0),
                    }))
                    .sort((left, right) => {
                        const leftTime = Date.parse(left.created_at || 0);
                        const rightTime = Date.parse(right.created_at || 0);

                        if (rightTime !== leftTime) {
                            return rightTime - leftTime;
                        }

                        return Number(right.id || 0) - Number(left.id || 0);
                    })
                : [],
        }))
        .sort((left, right) => {
            const leftTime = Date.parse(left.created_at || 0);
            const rightTime = Date.parse(right.created_at || 0);

            if (rightTime !== leftTime) {
                return rightTime - leftTime;
            }

            return Number(right.id || 0) - Number(left.id || 0);
        });
}

export function findFallbackCategoryById(id) {
    return listFallbackCategories().find((category) => category.id === id) || null;
}

export function createFallbackCategory({ name, slug, activate }) {
    const categories = listFallbackCategories();
    const nextId = categories.reduce((maxId, category) => Math.max(maxId, category.id), 0) + 1;

    return {
        id: nextId,
        name,
        slug,
        activate: normalizeCategoryActivate(activate),
        created_at: new Date().toISOString(),
        product_count: 0,
        subcategory_count: 0,
        subcategories: [],
    };
}

export function updateFallbackCategory(id, payload) {
    const currentCategory = findFallbackCategoryById(id);
    if (!currentCategory) {
        return null;
    }

    if (
        currentCategory.name === payload.name
        && currentCategory.slug === payload.slug
        && currentCategory.activate === normalizeCategoryActivate(payload.activate, currentCategory.activate)
    ) {
        return {
            ...currentCategory,
            updated: false,
        };
    }

    return {
        ...currentCategory,
        ...payload,
        activate: normalizeCategoryActivate(payload.activate, currentCategory.activate),
        updated: true,
    };
}

export function deleteFallbackCategory(id) {
    return Boolean(findFallbackCategoryById(id));
}
