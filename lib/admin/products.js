import { isCategoryTestMode } from './categories.js';

const FALLBACK_CATEGORY_MAP = new Map([
    [1, { id: 1, name: 'Moda', slug: 'moda' }],
    [2, { id: 2, name: 'Elektronik', slug: 'elektronik' }],
    [3, { id: 3, name: 'Ev Yasami', slug: 'ev-yasami' }],
]);

const FALLBACK_SUBCATEGORY_MAP = new Map([
    [1, { id: 1, category_id: 1, name: 'Sweatshirt', slug: 'sweatshirt' }],
    [2, { id: 2, category_id: 1, name: 'Sneaker', slug: 'sneaker' }],
    [3, { id: 3, category_id: 2, name: 'Akilli Saat', slug: 'akilli-saat' }],
]);

const FALLBACK_PRODUCTS = [
    {
        id: 1,
        sub_category_id: 1,
        title: 'Oversize Essential Hoodie',
        description: 'Yumusak dokulu pamuk karisimiyla gun boyu konfor sunan, katmanli kombinlere uygun basic hoodie.',
        sku: 'ESS-HOODIE-01',
        price: 1299.90,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGRkY1RDUiLz48Y2lyY2xlIGN4PSI0NzAiIGN5PSIxMjAiIHI9IjExMCIgZmlsbD0iI0ZGRDk0NCIgb3BhY2l0eT0iMC42NSIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjQ5MCIgcj0iMTUwIiBmaWxsPSIjRkY5NkE0IiBvcGFjaXR5PSIwLjQ1Ii8+PHJlY3QgeD0iMTQwIiB5PSIxMzAiIHdpZHRoPSIzMjAiIGhlaWdodD0iMzQwIiByeD0iNDAiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSIzMDAiIHk9IjI4NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM0IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjMWYyOTM3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Fc3NlbnRpYWw8L3RleHQ+PHRleHQgeD0iMzAwIiB5PSIzMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG9vZGllPC90ZXh0Pjwvc3ZnPg==',
        brand: 'North Loom',
        colors: [
            { name: 'Krem', hex: '#F7E7CE' },
            { name: 'Gece Siyahi', hex: '#111827' },
        ],
        sizes: ['S', 'M', 'L'],
        details: {
            care: ['30 derecede ters cevirerek yikayin', 'Dusuk isiyle utuleyin'],
            material: '%80 pamuk, %20 polyester',
            bullet_points: ['Yumusak ici polar doku', 'Gunluk katmanlamaya uygun', 'Unisex kalip'],
            description_long: 'Rahat silueti ve temiz gorunumu sayesinde hem jogger hem de denim kombinleriyle hizli sekilde kullanilabilir.',
        },
        created_at: '2026-03-01T10:00:00.000Z',
    },
];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeInteger(value, fallback = null) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized > 0 ? normalized : fallback;
}

function toTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function enrichProduct(product) {
    const subcategory = FALLBACK_SUBCATEGORY_MAP.get(Number(product.sub_category_id)) || null;
    const category = subcategory
        ? FALLBACK_CATEGORY_MAP.get(Number(subcategory.category_id)) || null
        : null;

    return {
        ...product,
        sub_category_id: Number(product.sub_category_id),
        price: Number(product.price || 0),
        colors: Array.isArray(product.colors) ? product.colors : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        details: product.details && typeof product.details === 'object' && !Array.isArray(product.details)
            ? product.details
            : {},
        category_id: category?.id || null,
        category_name: category?.name || '',
        categorySlug: category?.slug || '',
        subcategory_name: subcategory?.name || '',
        subCategorySlug: subcategory?.slug || '',
    };
}

export function isProductTestMode() {
    return isCategoryTestMode();
}

export function isValidProductSku(sku) {
    return /^[A-Za-z0-9-]+$/.test(sku);
}

export function isValidPriceFormat(value) {
    return /^\d+(\.\d{1,2})?$/.test(String(value || '').trim());
}

export function listFallbackProducts() {
    return clone(FALLBACK_PRODUCTS)
        .map((product) => enrichProduct(product))
        .sort((left, right) => {
            const leftTime = Date.parse(left.created_at || 0);
            const rightTime = Date.parse(right.created_at || 0);

            if (rightTime !== leftTime) {
                return rightTime - leftTime;
            }

            return Number(right.id || 0) - Number(left.id || 0);
        });
}

export function findFallbackProductById(id) {
    return listFallbackProducts().find((product) => product.id === Number(id)) || null;
}

export function findFallbackSubcategoryById(id) {
    const subcategory = FALLBACK_SUBCATEGORY_MAP.get(Number(id));

    if (!subcategory) {
        return null;
    }

    return clone(subcategory);
}

export function createFallbackProduct(payload) {
    const products = listFallbackProducts();
    const nextId = products.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;

    return enrichProduct({
        id: nextId,
        ...payload,
        created_at: new Date().toISOString(),
    });
}

export function updateFallbackProduct(id, payload) {
    const currentProduct = findFallbackProductById(id);

    if (!currentProduct) {
        return null;
    }

    return enrichProduct({
        ...currentProduct,
        ...payload,
        id: currentProduct.id,
        created_at: currentProduct.created_at,
    });
}

export function deleteFallbackProduct(id) {
    return Boolean(findFallbackProductById(id));
}

function parseJsonString(rawValue, fieldName) {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return { value: null };
    }

    try {
        return { value: JSON.parse(rawValue) };
    } catch {
        return { error: `${fieldName} must be valid JSON` };
    }
}

function validateColors(colors) {
    if (colors === null) {
        return { value: [] };
    }

    if (!Array.isArray(colors)) {
        return { error: 'Colors must be an array' };
    }

    const invalidItem = colors.find((item) => (
        !item
        || typeof item !== 'object'
        || Array.isArray(item)
        || !toTrimmedString(item.name)
        || !toTrimmedString(item.hex)
    ));

    if (invalidItem) {
        return { error: 'Colors items must include name and hex values' };
    }

    return {
        value: colors.map((item) => ({
            name: toTrimmedString(item.name),
            hex: toTrimmedString(item.hex),
        })),
    };
}

function validateSizes(sizes) {
    if (sizes === null) {
        return { value: [] };
    }

    if (!Array.isArray(sizes)) {
        return { error: 'Sizes must be an array' };
    }

    const invalidItem = sizes.find((item) => typeof item !== 'string');

    if (invalidItem !== undefined) {
        return { error: 'Sizes items must be strings' };
    }

    return {
        value: sizes.map((item) => item.trim()).filter(Boolean),
    };
}

function validateDetails(details) {
    if (details === null) {
        return { value: {} };
    }

    if (!details || typeof details !== 'object' || Array.isArray(details)) {
        return { error: 'Details must be a JSON object' };
    }

    if (
        Object.prototype.hasOwnProperty.call(details, 'care')
        && (!Array.isArray(details.care) || details.care.some((item) => typeof item !== 'string'))
    ) {
        return { error: 'Details format is invalid: care must be an array of strings' };
    }

    if (
        Object.prototype.hasOwnProperty.call(details, 'material')
        && typeof details.material !== 'string'
    ) {
        return { error: 'Details format is invalid: material must be a string' };
    }

    if (
        Object.prototype.hasOwnProperty.call(details, 'bullet_points')
        && (!Array.isArray(details.bullet_points) || details.bullet_points.some((item) => typeof item !== 'string'))
    ) {
        return { error: 'Details format is invalid: bullet_points must be an array of strings' };
    }

    if (
        Object.prototype.hasOwnProperty.call(details, 'description_long')
        && typeof details.description_long !== 'string'
    ) {
        return { error: 'Details format is invalid: description_long must be a string' };
    }

    return { value: details };
}

function normalizeImageFile(image) {
    if (!image || typeof image !== 'object') {
        return null;
    }

    const size = Number(image.size || 0);
    return {
        file: image,
        name: toTrimmedString(image.name),
        type: toTrimmedString(image.type) || 'application/octet-stream',
        size,
    };
}

export async function convertImageToStorageValue(image) {
    if (!image?.file || typeof image.file.arrayBuffer !== 'function') {
        return '';
    }

    const arrayBuffer = await image.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${image.type};base64,${buffer.toString('base64')}`;
}

export async function parseProductFormData(formData) {
    const allEntries = Array.from(formData?.entries?.() || []);
    const rawSubcategoryValues = typeof formData?.getAll === 'function'
        ? formData.getAll('subcategory_id')
        : [];

    const title = toTrimmedString(formData?.get?.('title'));
    const description = toTrimmedString(formData?.get?.('description'));
    const sku = toTrimmedString(formData?.get?.('sku'));
    const price = toTrimmedString(formData?.get?.('price'));
    const brand = toTrimmedString(formData?.get?.('brand'));
    const subcategoryRawValue = rawSubcategoryValues.length > 0
        ? rawSubcategoryValues[0]
        : formData?.get?.('subcategory_id');
    const subcategory_id = normalizeInteger(subcategoryRawValue);
    const image = normalizeImageFile(formData?.get?.('image'));

    if (!title) {
        return { error: 'Title is required', hasAnyField: allEntries.length > 0 };
    }

    if (!description) {
        return { error: 'Description is required', hasAnyField: allEntries.length > 0 };
    }

    if (!sku) {
        return { error: 'SKU is required', hasAnyField: allEntries.length > 0 };
    }

    if (!isValidProductSku(sku)) {
        return { error: 'SKU cannot contain Turkish characters', hasAnyField: allEntries.length > 0 };
    }

    if (!price) {
        return { error: 'Price is required', hasAnyField: allEntries.length > 0 };
    }

    if (!isValidPriceFormat(price)) {
        return { error: 'Price format is invalid', hasAnyField: allEntries.length > 0 };
    }

    if (rawSubcategoryValues.length > 1) {
        return { error: 'subcategory_id cannot be an array', hasAnyField: allEntries.length > 0 };
    }

    if (!subcategory_id) {
        return { error: 'subcategory_id is required', hasAnyField: allEntries.length > 0 };
    }

    if (!brand) {
        return { error: 'Brand is required', hasAnyField: allEntries.length > 0 };
    }

    if (!image) {
        return { error: 'Image is required', hasAnyField: allEntries.length > 0 };
    }

    if (image.size > 3 * 1024 * 1024) {
        return { error: 'Image size cannot exceed 3MB', hasAnyField: allEntries.length > 0 };
    }

    const parsedColors = parseJsonString(formData?.get?.('colors'), 'Colors');
    if (parsedColors.error) {
        return { error: parsedColors.error, hasAnyField: allEntries.length > 0 };
    }

    const colors = validateColors(parsedColors.value);
    if (colors.error) {
        return { error: colors.error, hasAnyField: allEntries.length > 0 };
    }

    const parsedSizes = parseJsonString(formData?.get?.('sizes'), 'Sizes');
    if (parsedSizes.error) {
        return { error: parsedSizes.error, hasAnyField: allEntries.length > 0 };
    }

    const sizes = validateSizes(parsedSizes.value);
    if (sizes.error) {
        return { error: sizes.error, hasAnyField: allEntries.length > 0 };
    }

    const parsedDetails = parseJsonString(formData?.get?.('details'), 'Details');
    if (parsedDetails.error) {
        return { error: parsedDetails.error, hasAnyField: allEntries.length > 0 };
    }

    const details = validateDetails(parsedDetails.value);
    if (details.error) {
        return { error: details.error, hasAnyField: allEntries.length > 0 };
    }

    return {
        hasAnyField: allEntries.length > 0,
        payload: {
            title,
            description,
            sku,
            price: Number(price),
            brand,
            subcategory_id,
            colors: colors.value,
            sizes: sizes.value,
            details: details.value,
            image,
        },
    };
}

export function normalizeProductRow(row) {
    return {
        ...row,
        id: Number(row.id),
        sub_category_id: Number(row.sub_category_id),
        price: Number(row.price || 0),
        colors: Array.isArray(row.colors) ? row.colors : [],
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
        details: row.details && typeof row.details === 'object' && !Array.isArray(row.details)
            ? row.details
            : {},
        category_id: row.category_id ? Number(row.category_id) : null,
    };
}
