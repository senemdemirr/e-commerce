function tryParseJson(value) {
    if (typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function normalizeBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = String(value ?? '').trim().toLowerCase();
    return ['1', 'true', 't', 'yes', 'y', 'on'].includes(normalized);
}

function normalizeIdList(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0);
}

function normalizeColors(value, ensureDefaults) {
    const parsed = tryParseJson(value);

    if (Array.isArray(parsed)) {
        return parsed
            .map((item) => {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    return {
                        ...(item.id ? { id: Number(item.id) } : {}),
                        name: String(item.name || '').trim(),
                        hex: String(item.hex || item.code || '').trim(),
                    };
                }

                const label = String(item || '').trim();
                return label ? { name: label, hex: '' } : null;
            })
            .filter((item) => item && item.name);
    }

    return ensureDefaults ? [] : value;
}

function normalizeSizes(value, ensureDefaults) {
    const parsed = tryParseJson(value);

    if (Array.isArray(parsed)) {
        return parsed
            .map((item) => {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    return String(item.label || item.name || '').trim();
                }

                return String(item || '').trim();
            })
            .filter(Boolean);
    }

    return ensureDefaults ? [] : value;
}

function normalizeDetails(value, ensureDefaults) {
    const parsed = tryParseJson(value);
    const normalizeSection = (sectionValue) => {
        if (Array.isArray(sectionValue)) {
            return sectionValue
                .map((item) => String(item || '').trim())
                .filter(Boolean);
        }

        const normalizedValue = String(sectionValue || '').trim();
        return normalizedValue ? [normalizedValue] : [];
    };

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return {
            material: normalizeSection(parsed.material),
            care: normalizeSection(parsed.care),
            bullet_point: normalizeSection(parsed.bullet_point || parsed.bullet_points),
            description_long: normalizeSection(parsed.description_long),
        };
    }

    return ensureDefaults
        ? {
            material: [],
            care: [],
            bullet_point: [],
            description_long: [],
        }
        : value;
}

function normalizeVariants(value, ensureDefaults) {
    const parsed = tryParseJson(value);

    if (Array.isArray(parsed)) {
        return parsed
            .map((item) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    return null;
                }

                return {
                    ...(item.id ? { id: Number(item.id) } : {}),
                    ...(item.product_id ? { product_id: Number(item.product_id) } : {}),
                    color_id: item.color_id ? Number(item.color_id) : null,
                    size_id: item.size_id ? Number(item.size_id) : null,
                    sku: String(item.sku || '').trim(),
                    price: Number(item.price || 0),
                    stock: Number(item.stock || 0),
                    is_default: normalizeBoolean(item.is_default),
                    color_name: String(item.color_name || item.colorName || '').trim(),
                    color_hex: String(item.color_hex || item.colorHex || '').trim(),
                    size_label: String(item.size_label || item.sizeLabel || '').trim(),
                };
            })
            .filter((item) => item && item.sku);
    }

    return ensureDefaults ? [] : value;
}

export function normalizeProductRow(row, options = {}) {
    const { ensureDefaults = true } = options;
    const normalized = { ...row };

    if (Object.prototype.hasOwnProperty.call(row, 'id')) {
        normalized.id = Number(row.id);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'sub_category_id')) {
        normalized.sub_category_id = Number(row.sub_category_id);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'subcategory_id')) {
        normalized.subcategory_id = Number(row.subcategory_id);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'category_id')) {
        normalized.category_id = row.category_id ? Number(row.category_id) : null;
    }

    if (Object.prototype.hasOwnProperty.call(row, 'price')) {
        normalized.price = Number(row.price || 0);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'colors_id')) {
        normalized.colors_id = normalizeIdList(row.colors_id);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'sizes_id')) {
        normalized.sizes_id = normalizeIdList(row.sizes_id);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'variant_count')) {
        normalized.variant_count = Number(row.variant_count || 0);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'colors') || ensureDefaults) {
        normalized.colors = normalizeColors(row.colors, ensureDefaults);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'sizes') || ensureDefaults) {
        normalized.sizes = normalizeSizes(row.sizes, ensureDefaults);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'details') || ensureDefaults) {
        normalized.details = normalizeDetails(row.details, ensureDefaults);
    }

    if (Object.prototype.hasOwnProperty.call(row, 'variants') || ensureDefaults) {
        normalized.variants = normalizeVariants(row.variants, ensureDefaults);
    }

    return normalized;
}

export function buildProductRelationsJoins(productAlias = 'p') {
    return `
        LEFT JOIN LATERAL (
            SELECT
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', c.id,
                            'name', c.name,
                            'hex', c.code
                        )
                        ORDER BY array_position(${productAlias}.colors_id, c.id)
                    ),
                    '[]'::jsonb
                ) AS colors
            FROM colors c
            WHERE c.id = ANY(COALESCE(${productAlias}.colors_id, ARRAY[]::int[]))
        ) color_data ON TRUE
        LEFT JOIN LATERAL (
            SELECT
                COALESCE(
                    jsonb_agg(s.name ORDER BY array_position(${productAlias}.sizes_id, s.id)),
                    '[]'::jsonb
                ) AS sizes
            FROM sizes s
            WHERE s.id = ANY(COALESCE(${productAlias}.sizes_id, ARRAY[]::int[]))
        ) size_data ON TRUE
        LEFT JOIN LATERAL (
            SELECT jsonb_build_object(
                'material',
                COALESCE(
                    jsonb_agg(
                        to_jsonb(pd.value)
                        ORDER BY pd.display_order ASC, pd.id ASC
                    ) FILTER (WHERE pd.section = 'material'),
                    '[]'::jsonb
                ),
                'care',
                COALESCE(
                    jsonb_agg(
                        to_jsonb(pd.value)
                        ORDER BY pd.display_order ASC, pd.id ASC
                    )
                    FILTER (WHERE pd.section = 'care'),
                    '[]'::jsonb
                ),
                'bullet_point',
                COALESCE(
                    jsonb_agg(
                        to_jsonb(pd.value)
                        ORDER BY pd.display_order ASC, pd.id ASC
                    )
                    FILTER (WHERE pd.section = 'bullet_point'),
                    '[]'::jsonb
                ),
                'description_long',
                COALESCE(
                    jsonb_agg(
                        to_jsonb(pd.value)
                        ORDER BY pd.display_order ASC, pd.id ASC
                    ) FILTER (WHERE pd.section = 'description_long'),
                    '[]'::jsonb
                )
            ) AS details
            FROM product_details pd
            WHERE pd.product_id = ${productAlias}.id
        ) detail_data ON TRUE
        LEFT JOIN LATERAL (
            SELECT
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', pv.id,
                            'product_id', pv.product_id,
                            'color_id', pv.color_id,
                            'size_id', pv.size_id,
                            'sku', pv.sku,
                            'price', COALESCE(pv.price, ${productAlias}.price),
                            'stock', pv.stock,
                            'is_default', pv.is_default,
                            'color_name', COALESCE(c.name, ''),
                            'color_hex', COALESCE(c.code, ''),
                            'size_label', COALESCE(s.name, '')
                        )
                        ORDER BY pv.is_default DESC, pv.display_order ASC, pv.id ASC
                    ),
                    '[]'::jsonb
                ) AS variants,
                COUNT(*)::int AS variant_count
            FROM product_variants pv
            LEFT JOIN colors c ON c.id = pv.color_id
            LEFT JOIN sizes s ON s.id = pv.size_id
            WHERE pv.product_id = ${productAlias}.id
        ) variant_data ON TRUE
    `;
}

export function buildProductRelationsSelect(productAlias = 'p') {
    return `
        ${productAlias}.id,
        ${productAlias}.sub_category_id,
        ${productAlias}.title,
        ${productAlias}.description,
        ${productAlias}.sku,
        ${productAlias}.price,
        ${productAlias}.image,
        ${productAlias}.brand,
        COALESCE(${productAlias}.colors_id, ARRAY[]::int[]) AS colors_id,
        COALESCE(${productAlias}.sizes_id, ARRAY[]::int[]) AS sizes_id,
        COALESCE(color_data.colors, '[]'::jsonb) AS colors,
        COALESCE(size_data.sizes, '[]'::jsonb) AS sizes,
        COALESCE(
            detail_data.details,
            jsonb_build_object(
                'material', '[]'::jsonb,
                'care', '[]'::jsonb,
                'bullet_point', '[]'::jsonb,
                'description_long', '[]'::jsonb
            )
        ) AS details,
        COALESCE(variant_data.variants, '[]'::jsonb) AS variants,
        COALESCE(variant_data.variant_count, 0) AS variant_count,
        ${productAlias}.created_at
    `;
}
