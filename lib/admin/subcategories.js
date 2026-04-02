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
        created_at: '2026-01-01T00:00:00.000Z',
        product_count: 0,
    },
    {
        id: 2,
        category_id: 2,
        name: 'Akilli Saatler',
        slug: 'akilli-saatler',
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

export function normalizeSubcategoryPayload(payload = {}, options = {}) {
    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
        slug: typeof payload.slug === 'string' ? payload.slug.trim() : '',
        category_id: normalizeCategoryId(
            payload.category_id ?? payload.categoryId,
            options.defaultCategoryId ?? null
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

    return clone(FALLBACK_SUBCATEGORIES).map((subcategory) => {
        const parentCategory = parentCategories.find((category) => category.id === subcategory.category_id);

        return {
            ...subcategory,
            category_id: normalizeCategoryId(subcategory.category_id),
            product_count: Number(subcategory.product_count || 0),
            category_name: parentCategory?.name || 'Unknown Category',
            category_slug: parentCategory?.slug || '',
        };
    });
}

export function findFallbackSubcategoryById(id) {
    return listFallbackSubcategories().find((subcategory) => subcategory.id === id) || null;
}

export function createFallbackSubcategory({ name, slug, category_id }) {
    const parentCategory = findFallbackParentCategoryById(category_id);
    const subcategories = listFallbackSubcategories();
    const nextId = subcategories.reduce((maxId, subcategory) => Math.max(maxId, subcategory.id), 0) + 1;

    return {
        id: nextId,
        category_id,
        name,
        slug,
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
    const updated = !(
        currentSubcategory.name === nextName
        && currentSubcategory.slug === nextSlug
        && currentSubcategory.category_id === nextCategoryId
    );

    return {
        ...currentSubcategory,
        ...payload,
        category_id: nextCategoryId,
        name: nextName,
        slug: nextSlug,
        category_name: parentCategory?.name || currentSubcategory.category_name,
        category_slug: parentCategory?.slug || currentSubcategory.category_slug,
        updated,
    };
}

export function deleteFallbackSubcategory(id) {
    return Boolean(findFallbackSubcategoryById(id));
}
