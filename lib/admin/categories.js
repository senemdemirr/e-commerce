const FALLBACK_CATEGORIES = [
    {
        id: 1,
        name: 'Eski İsim',
        slug: 'eski-slug',
        created_at: '2026-01-01T00:00:00.000Z',
        subcategories: [
            {
                id: 1,
                category_id: 1,
                name: 'Eski Alt Kategori',
                slug: 'eski-alt-slug',
                created_at: '2026-01-01T00:00:00.000Z',
            },
        ],
    },
    {
        id: 2,
        name: 'Elektronik',
        slug: 'elektronik',
        created_at: '2026-01-02T00:00:00.000Z',
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

export function normalizeCategoryPayload(payload = {}) {
    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
        slug: typeof payload.slug === 'string' ? payload.slug.trim() : '',
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
                created_at: row.category_created_at || null,
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
            });
        }
    }

    return Array.from(categoriesMap.values());
}

export function listFallbackCategories() {
    return clone(FALLBACK_CATEGORIES);
}

export function findFallbackCategoryById(id) {
    return listFallbackCategories().find((category) => category.id === id) || null;
}

export function createFallbackCategory({ name, slug }) {
    const categories = listFallbackCategories();
    const nextId = categories.reduce((maxId, category) => Math.max(maxId, category.id), 0) + 1;

    return {
        id: nextId,
        name,
        slug,
        created_at: new Date().toISOString(),
        subcategories: [],
    };
}

export function updateFallbackCategory(id, payload) {
    const currentCategory = findFallbackCategoryById(id);
    if (!currentCategory) {
        return null;
    }

    if (currentCategory.name === payload.name && currentCategory.slug === payload.slug) {
        return {
            ...currentCategory,
            updated: false,
        };
    }

    return {
        ...currentCategory,
        ...payload,
        updated: true,
    };
}

export function deleteFallbackCategory(id) {
    return Boolean(findFallbackCategoryById(id));
}
