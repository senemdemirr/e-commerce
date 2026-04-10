import { isCategoryTestMode } from './categories.js';

const FALLBACK_PARENT_CATEGORIES = [
    {
        id: 1,
        name: 'Moda',
        slug: 'moda',
    },
    {
        id: 2,
        name: 'Elektronik',
        slug: 'elektronik',
    },
    {
        id: 3,
        name: 'Ev Yasami',
        slug: 'ev-yasami',
    },
];

const FALLBACK_SUBCATEGORIES = [
    {
        id: 1,
        category_id: 1,
        name: 'Eski İsim',
        slug: 'eski-slug',
        activate: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        product_count: 0,
    },
    {
        id: 2,
        category_id: 2,
        name: 'Akilli Saatler',
        slug: 'akilli-saatler',
        activate: 0,
        created_at: '2026-01-02T00:00:00.000Z',
        product_count: 4,
    },
];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeCategoryId(value, fallback = null) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function normalizeSubcategoryActivate(value, fallback = 1) {
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return Number(value) === 1 ? 1 : 0;
}

export function normalizeSubcategoryPayload(payload = {}, options = {}) {
    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
        slug: typeof payload.slug === 'string' ? payload.slug.trim() : '',
        category_id: normalizeCategoryId(
            payload.category_id ?? payload.categoryId,
            options.defaultCategoryId ?? null
        ),
        activate: normalizeSubcategoryActivate(
            payload.activate ?? payload.is_active,
            options.defaultActivate ?? 1
        ),
    };
}

export function isValidSubcategorySlug(slug) {
    return /^[a-z0-9-]+$/.test(slug);
}

export function isSubcategoryTestMode() {
    return isCategoryTestMode();
}

export function listFallbackParentCategories() {
    return clone(FALLBACK_PARENT_CATEGORIES);
}

export function findFallbackParentCategoryById(id) {
    return listFallbackParentCategories().find((category) => category.id === id) || null;
}

export function listFallbackSubcategories() {
    const parentCategories = listFallbackParentCategories();

    return clone(FALLBACK_SUBCATEGORIES)
        .map((subcategory) => {
            const parentCategory = parentCategories.find((category) => category.id === subcategory.category_id);

            return {
                ...subcategory,
                category_id: normalizeCategoryId(subcategory.category_id),
                activate: normalizeSubcategoryActivate(subcategory.activate),
                product_count: Number(subcategory.product_count || 0),
                category_name: parentCategory?.name || 'Unknown Category',
                category_slug: parentCategory?.slug || '',
            };
        })
        .sort((left, right) => {
            const leftTime = Date.parse(left.created_at || 0);
            const rightTime = Date.parse(right.created_at || 0);

            if (rightTime !== leftTime) {
                return rightTime - leftTime;
            }

            return Number(right.id || 0) - Number(left.id || 0);
        });
}

export function findFallbackSubcategoryById(id) {
    return listFallbackSubcategories().find((subcategory) => subcategory.id === id) || null;
}

export function createFallbackSubcategory({ name, slug, category_id, activate }) {
    const parentCategory = findFallbackParentCategoryById(category_id);
    const subcategories = listFallbackSubcategories();
    const nextId = subcategories.reduce((maxId, subcategory) => Math.max(maxId, subcategory.id), 0) + 1;

    return {
        id: nextId,
        category_id,
        name,
        slug,
        activate: normalizeSubcategoryActivate(activate),
        created_at: new Date().toISOString(),
        product_count: 0,
        category_name: parentCategory?.name || 'Unknown Category',
        category_slug: parentCategory?.slug || '',
    };
}

export function updateFallbackSubcategory(id, payload) {
    const currentSubcategory = findFallbackSubcategoryById(id);

    if (!currentSubcategory) {
        return null;
    }

    const nextCategoryId = normalizeCategoryId(payload.category_id, currentSubcategory.category_id);
    const parentCategory = findFallbackParentCategoryById(nextCategoryId);
    const nextName = payload.name ?? currentSubcategory.name;
    const nextSlug = payload.slug ?? currentSubcategory.slug;
    const nextActivate = normalizeSubcategoryActivate(payload.activate, currentSubcategory.activate);
    const updated = !(
        currentSubcategory.name === nextName
        && currentSubcategory.slug === nextSlug
        && currentSubcategory.category_id === nextCategoryId
        && currentSubcategory.activate === nextActivate
    );

    return {
        ...currentSubcategory,
        ...payload,
        category_id: nextCategoryId,
        name: nextName,
        slug: nextSlug,
        activate: nextActivate,
        category_name: parentCategory?.name || currentSubcategory.category_name,
        category_slug: parentCategory?.slug || currentSubcategory.category_slug,
        updated,
    };
}

export function deleteFallbackSubcategory(id) {
    return Boolean(findFallbackSubcategoryById(id));
}
