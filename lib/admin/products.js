import { normalizeProductRow as normalizeAggregatedProductRow } from '@/lib/products-data.js';
import { isCategoryTestMode } from './categories.js';
import {
    listFallbackProductCategoryRecords,
    listFallbackProductRecords,
    listFallbackProductSubcategoryRecords,
} from './test-data.js';

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

function normalizeLookupKey(value) {
    return toTrimmedString(value).toLocaleLowerCase('tr-TR');
}

function normalizeBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = String(value ?? '').trim().toLowerCase();
    return ['1', 'true', 't', 'yes', 'y', 'on'].includes(normalized);
}

function normalizeDetailsPayload(details = {}) {
    const normalizeTextRows = (items) => {
        if (Array.isArray(items)) {
            return items
                .map((item) => String(item || '').trim())
                .filter(Boolean);
        }

        const value = String(items || '').trim();
        return value ? [value] : [];
    };

    return {
        material: normalizeTextRows(details.material),
        care: normalizeTextRows(details.care),
        bullet_point: normalizeTextRows(details.bullet_point || details.bullet_points),
        description_long: normalizeTextRows(details.description_long),
    };
}

function enrichProduct(product) {
    const subcategoryMap = new Map(
        listFallbackProductSubcategoryRecords()
            .map((subcategory) => [Number(subcategory.id), subcategory])
    );
    const categoryMap = new Map(
        listFallbackProductCategoryRecords()
            .map((category) => [Number(category.id), category])
    );
    const subcategory = subcategoryMap.get(Number(product.sub_category_id)) || null;
    const category = subcategory
        ? categoryMap.get(Number(subcategory.category_id)) || null
        : null;

    const normalized = normalizeAggregatedProductRow({
        ...product,
        variants: Array.isArray(product.variants) ? product.variants : [],
        variant_count: Array.isArray(product.variants) ? product.variants.length : 0,
    });

    return {
        ...normalized,
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
    return listFallbackProductRecords()
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
    const subcategory = listFallbackProductSubcategoryRecords()
        .find((item) => Number(item.id) === Number(id));

    if (!subcategory) {
        return null;
    }

    return subcategory;
}

export function createFallbackProduct(payload) {
    const products = listFallbackProducts();
    const nextId = products.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;

    return enrichProduct({
        id: nextId,
        colors_id: [],
        sizes_id: [],
        ...payload,
        variants: Array.isArray(payload.variants) ? payload.variants.map((variant, index) => ({
            id: 4000 + nextId * 10 + index,
            product_id: nextId,
            ...variant,
        })) : [],
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
        variants: Array.isArray(payload.variants)
            ? payload.variants.map((variant, index) => ({
                id: 4000 + Number(id) * 10 + index,
                product_id: Number(id),
                ...variant,
            }))
            : currentProduct.variants,
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

    const seenNames = new Set();

    for (const item of colors) {
        if (
            !item
            || typeof item !== 'object'
            || Array.isArray(item)
            || !toTrimmedString(item.name)
            || !toTrimmedString(item.hex)
        ) {
            return { error: 'Colors items must include name and hex values' };
        }

        const key = normalizeLookupKey(item.name);

        if (seenNames.has(key)) {
            return { error: 'Color names must be unique' };
        }

        seenNames.add(key);
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

    const normalizedSizes = [];
    const seenLabels = new Set();

    for (const item of sizes) {
        if (typeof item !== 'string') {
            return { error: 'Sizes items must be strings' };
        }

        const label = item.trim();

        if (!label) {
            continue;
        }

        const key = normalizeLookupKey(label);

        if (seenLabels.has(key)) {
            return { error: 'Size labels must be unique' };
        }

        seenLabels.add(key);
        normalizedSizes.push(label);
    }

    return { value: normalizedSizes };
}

function validateDetails(details) {
    if (details === null) {
        return { value: normalizeDetailsPayload({}) };
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
        && !(
            typeof details.material === 'string'
            || (Array.isArray(details.material) && details.material.every((item) => typeof item === 'string'))
        )
    ) {
        return { error: 'Details format is invalid: material must be a string or an array of strings' };
    }

    const rawBulletPoints = Object.prototype.hasOwnProperty.call(details, 'bullet_point')
        ? details.bullet_point
        : details.bullet_points;

    if (
        rawBulletPoints !== undefined
        && (!Array.isArray(rawBulletPoints) || rawBulletPoints.some((item) => typeof item !== 'string'))
    ) {
        return { error: 'Details format is invalid: bullet_point must be an array of strings' };
    }

    if (
        Object.prototype.hasOwnProperty.call(details, 'description_long')
        && !(
            typeof details.description_long === 'string'
            || (Array.isArray(details.description_long) && details.description_long.every((item) => typeof item === 'string'))
        )
    ) {
        return { error: 'Details format is invalid: description_long must be a string or an array of strings' };
    }

    return { value: normalizeDetailsPayload(details) };
}

function normalizeVariantPrice(value, fallbackPrice) {
    if (value === undefined || value === null || value === '') {
        return { value: fallbackPrice };
    }

    if (!isValidPriceFormat(value)) {
        return { error: 'Variant price format is invalid' };
    }

    return { value: Number(value) };
}

function normalizeVariantStock(value) {
    if (value === undefined || value === null || value === '') {
        return { value: 0 };
    }

    const normalized = Number(value);

    if (!Number.isInteger(normalized) || normalized < 0) {
        return { error: 'Variant stock must be a non-negative integer' };
    }

    return { value: normalized };
}

function validateVariants(variants, colors, sizes, basePrice) {
    if (variants === null) {
        return { value: [] };
    }

    if (!Array.isArray(variants)) {
        return { error: 'Variants must be an array' };
    }

    const colorLookup = new Map(colors.map((color) => [normalizeLookupKey(color.name), color]));
    const sizeLookup = new Map(sizes.map((size) => [normalizeLookupKey(size), size]));
    const seenCombinations = new Set();
    const normalizedVariants = [];

    for (const item of variants) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { error: 'Variant items must be objects' };
        }

        const colorName = toTrimmedString(item.color_name ?? item.colorName);
        const sizeLabel = toTrimmedString(item.size_label ?? item.sizeLabel);
        const sku = toTrimmedString(item.sku);

        if (!sku) {
            return { error: 'Variant SKU is required' };
        }

        if (!isValidProductSku(sku)) {
            return { error: 'Variant SKU cannot contain Turkish characters' };
        }

        if (colors.length > 0 && !colorName) {
            return { error: 'Each variant must reference a color' };
        }

        if (sizes.length > 0 && !sizeLabel) {
            return { error: 'Each variant must reference a size' };
        }

        if (colorName && !colorLookup.has(normalizeLookupKey(colorName))) {
            return { error: `Variant color "${colorName}" is not defined in colors` };
        }

        if (sizeLabel && !sizeLookup.has(normalizeLookupKey(sizeLabel))) {
            return { error: `Variant size "${sizeLabel}" is not defined in sizes` };
        }

        const variantPrice = normalizeVariantPrice(item.price, basePrice);
        if (variantPrice.error) {
            return { error: variantPrice.error };
        }

        const variantStock = normalizeVariantStock(item.stock);
        if (variantStock.error) {
            return { error: variantStock.error };
        }

        const combinationKey = `${normalizeLookupKey(colorName)}::${normalizeLookupKey(sizeLabel)}`;

        if (seenCombinations.has(combinationKey)) {
            return { error: 'Variant combinations must be unique' };
        }

        seenCombinations.add(combinationKey);
        const normalizedColor = colorName
            ? colorLookup.get(normalizeLookupKey(colorName)) || null
            : null;
        normalizedVariants.push({
            color_name: colorName,
            color_hex: normalizedColor?.hex || '',
            size_label: sizeLabel,
            sku,
            price: variantPrice.value,
            stock: variantStock.value,
            is_default: normalizeBoolean(item.is_default ?? item.isDefault),
        });
    }

    if (normalizedVariants.filter((item) => item.is_default).length > 1) {
        return { error: 'Only one variant can be marked as default' };
    }

    if (normalizedVariants.length > 0 && !normalizedVariants.some((item) => item.is_default)) {
        normalizedVariants[0].is_default = true;
    }

    return { value: normalizedVariants };
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

    const parsedVariants = parseJsonString(formData?.get?.('variants'), 'Variants');
    if (parsedVariants.error) {
        return { error: parsedVariants.error, hasAnyField: allEntries.length > 0 };
    }

    const variants = validateVariants(parsedVariants.value, colors.value, sizes.value, Number(price));
    if (variants.error) {
        return { error: variants.error, hasAnyField: allEntries.length > 0 };
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
            variants: variants.value,
            image,
        },
    };
}

async function findOrCreateColorId(client, color) {
    const existing = await client.query(
        `
            SELECT id
            FROM colors
            WHERE LOWER(name) = LOWER($1)
              AND code = $2
            LIMIT 1
        `,
        [color.name, color.hex]
    );

    if (existing.rowCount > 0) {
        return Number(existing.rows[0].id);
    }

    const created = await client.query(
        `
            INSERT INTO colors (name, code)
            VALUES ($1, $2)
            RETURNING id
        `,
        [color.name, color.hex]
    );

    return Number(created.rows[0].id);
}

async function findOrCreateSizeId(client, size) {
    const existing = await client.query(
        `
            SELECT id
            FROM sizes
            WHERE LOWER(name) = LOWER($1)
            LIMIT 1
        `,
        [size]
    );

    if (existing.rowCount > 0) {
        return Number(existing.rows[0].id);
    }

    const created = await client.query(
        `
            INSERT INTO sizes (name)
            VALUES ($1)
            RETURNING id
        `,
        [size]
    );

    return Number(created.rows[0].id);
}

async function syncProductColors(client, colors) {
    const colorIds = [];
    const colorIdMap = new Map();

    for (const color of colors) {
        const colorId = await findOrCreateColorId(client, color);
        colorIds.push(colorId);
        colorIdMap.set(normalizeLookupKey(color.name), colorId);
    }

    return { colorIds, colorIdMap };
}

async function syncProductSizes(client, sizes) {
    const sizeIds = [];
    const sizeIdMap = new Map();

    for (const size of sizes) {
        const sizeId = await findOrCreateSizeId(client, size);
        sizeIds.push(sizeId);
        sizeIdMap.set(normalizeLookupKey(size), sizeId);
    }

    return { sizeIds, sizeIdMap };
}

export async function replaceProductDetailsForProduct(client, productId, details) {
    await client.query(
        'DELETE FROM product_details WHERE product_id = $1',
        [productId]
    );

    const normalizedDetails = normalizeDetailsPayload(details);
    const detailRows = [
        ...normalizedDetails.material.map((value, index) => ({ section: 'material', value, displayOrder: index })),
        ...normalizedDetails.care.map((value, index) => ({ section: 'care', value, displayOrder: index })),
        ...normalizedDetails.bullet_point.map((value, index) => ({ section: 'bullet_point', value, displayOrder: index })),
        ...normalizedDetails.description_long.map((value, index) => ({ section: 'description_long', value, displayOrder: index })),
    ];

    for (const row of detailRows) {
        await client.query(
            `
                INSERT INTO product_details (
                    product_id,
                    section,
                    value,
                    display_order
                )
                VALUES ($1, $2, $3, $4)
            `,
            [productId, row.section, row.value, row.displayOrder]
        );
    }
}

async function syncProductVariants(client, productId, variants, colorIdMap, sizeIdMap) {
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);

    for (const [index, variant] of variants.entries()) {
        const colorId = variant.color_name
            ? colorIdMap.get(normalizeLookupKey(variant.color_name)) || null
            : null;
        const sizeId = variant.size_label
            ? sizeIdMap.get(normalizeLookupKey(variant.size_label)) || null
            : null;

        await client.query(
            `
                INSERT INTO product_variants (
                    product_id,
                    color_id,
                    size_id,
                    sku,
                    price,
                    stock,
                    is_default,
                    display_order
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
                productId,
                colorId,
                sizeId,
                variant.sku,
                variant.price,
                variant.stock,
                variant.is_default,
                index,
            ]
        );
    }
}

export async function prepareProductRelations(client, payload) {
    const { colorIds, colorIdMap } = await syncProductColors(client, payload.colors);
    const { sizeIds, sizeIdMap } = await syncProductSizes(client, payload.sizes);

    return {
        colors_id: colorIds,
        sizes_id: sizeIds,
        colorIdMap,
        sizeIdMap,
    };
}

export async function syncProductVariantsForProduct(client, productId, payload, relationState) {
    await syncProductVariants(
        client,
        productId,
        payload.variants,
        relationState.colorIdMap,
        relationState.sizeIdMap
    );
}

export function normalizeProductRow(row, options = {}) {
    return normalizeAggregatedProductRow(row, options);
}
