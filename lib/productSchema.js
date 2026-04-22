import { pool } from "./db.js";

let productVariantSchemaReadyPromise = null;

function createEmptyDetails() {
    return {
        material: [],
        care: [],
        bullet_point: [],
        description_long: [],
    };
}

function normalizeDetailSection(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }

    const normalizedValue = String(value || '').trim();
    return normalizedValue ? [normalizedValue] : [];
}

function parseLegacyColors(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const name = String(item.name || '').trim();
                return name
                    ? {
                        name,
                        hex: String(item.hex || item.code || '').trim(),
                    }
                    : null;
            }

            const name = String(item || '').trim();
            return name ? { name, hex: '' } : null;
        })
        .filter(Boolean);
}

function parseLegacySizes(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                return String(item.name || item.label || '').trim();
            }

            return String(item || '').trim();
        })
        .filter(Boolean);
}

function parseLegacyDetails(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return createEmptyDetails();
    }

    return {
        material: normalizeDetailSection(value.material),
        care: normalizeDetailSection(value.care),
        bullet_point: normalizeDetailSection(value.bullet_point || value.bullet_points),
        description_long: normalizeDetailSection(value.description_long),
    };
}

function hasDetailContent(details) {
    return Boolean(
        details.material.length > 0
        || details.care.length > 0
        || details.bullet_point.length > 0
        || details.description_long.length > 0
    );
}

function normalizeLookupKey(value) {
    return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function normalizeIdRefs(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item > 0);
    }

    const normalized = Number(value);
    return Number.isInteger(normalized) && normalized > 0 ? [normalized] : [];
}

function mergeColors(colors) {
    const map = new Map();

    for (const color of colors) {
        const key = `${normalizeLookupKey(color.name)}::${String(color.hex || '').trim()}`;

        if (!map.has(key)) {
            map.set(key, {
                name: color.name,
                hex: color.hex || '',
            });
        }
    }

    return Array.from(map.values());
}

function mergeSizes(sizes) {
    const map = new Map();

    for (const size of sizes) {
        const key = normalizeLookupKey(size);

        if (!map.has(key)) {
            map.set(key, size);
        }
    }

    return Array.from(map.values());
}

function appendDetail(details, section, value) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        return;
    }

    if (section === 'material') {
        details.material.push(normalizedValue);
    } else if (section === 'care') {
        details.care.push(normalizedValue);
    } else if (section === 'bullet_point') {
        details.bullet_point.push(normalizedValue);
    } else if (section === 'description_long') {
        details.description_long.push(normalizedValue);
    }
}

async function tableExists(client, tableName) {
    const result = await client.query(
        `
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = $1
            LIMIT 1
        `,
        [tableName]
    );

    return result.rowCount > 0;
}

async function getColumnInfo(client, tableName) {
    const result = await client.query(
        `
            SELECT column_name, udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = $1
        `,
        [tableName]
    );

    return new Map(result.rows.map((row) => [row.column_name, row.udt_name]));
}

async function createTargetTables(client) {
    await client.query('DROP TABLE IF EXISTS colors_next');
    await client.query('DROP TABLE IF EXISTS sizes_next');
    await client.query('DROP TABLE IF EXISTS product_details_next');

    await client.query(`
        CREATE TABLE colors_next(
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            code VARCHAR(20) NOT NULL DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await client.query(`
        CREATE TABLE sizes_next(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await client.query(`
        CREATE TABLE product_details_next(
            id SERIAL PRIMARY KEY,
            product_id INT REFERENCES products(id) ON DELETE CASCADE,
            section VARCHAR(50),
            value TEXT,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function createNormalizedTablesIfMissing(client, colorsColumns, sizesColumns) {
    if (colorsColumns.size === 0) {
        await client.query(`
            CREATE TABLE IF NOT EXISTS colors(
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                code VARCHAR(20) NOT NULL DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    if (sizesColumns.size === 0) {
        await client.query(`
            CREATE TABLE IF NOT EXISTS sizes(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
}

async function ensureProductVariantTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS product_variants(
            id SERIAL PRIMARY KEY,
            product_id INT NOT NULL,
            color_id INT,
            size_id INT,
            sku VARCHAR(200) NOT NULL,
            price DECIMAL(10,2),
            stock INT NOT NULL DEFAULT 0,
            is_default BOOLEAN NOT NULL DEFAULT FALSE,
            display_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await client.query(`
        ALTER TABLE product_variants
        ADD COLUMN IF NOT EXISTS color_id INT
    `);

    await client.query(`
        ALTER TABLE product_variants
        ADD COLUMN IF NOT EXISTS size_id INT
    `);

    await client.query('DROP INDEX IF EXISTS idx_product_variants_combination_unique');

    await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku_unique
        ON product_variants (sku)
    `);
}

async function ensureProductsColumns(client, productColumns) {
    if (!productColumns.has('colors_id')) {
        await client.query('ALTER TABLE products ADD COLUMN colors_id INT[] NOT NULL DEFAULT ARRAY[]::INT[]');
    } else if (productColumns.get('colors_id') !== '_int4') {
        await client.query(`
            ALTER TABLE products
            ALTER COLUMN colors_id TYPE INT[]
            USING CASE
                WHEN colors_id IS NULL THEN ARRAY[]::INT[]
                ELSE ARRAY[colors_id]
            END
        `);
    }

    if (!productColumns.has('sizes_id')) {
        await client.query('ALTER TABLE products ADD COLUMN sizes_id INT[] NOT NULL DEFAULT ARRAY[]::INT[]');
    } else if (productColumns.get('sizes_id') !== '_int4') {
        await client.query(`
            ALTER TABLE products
            ALTER COLUMN sizes_id TYPE INT[]
            USING CASE
                WHEN sizes_id IS NULL THEN ARRAY[]::INT[]
                ELSE ARRAY[sizes_id]
            END
        `);
    }
}

async function ensureVariantReferenceColumns(client) {
    await client.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'cart_items'
            ) THEN
                ALTER TABLE cart_items
                ADD COLUMN IF NOT EXISTS variant_id INT;
            END IF;
        END $$;
    `);

    await client.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'order_items'
            ) THEN
                ALTER TABLE order_items
                ADD COLUMN IF NOT EXISTS variant_id INT;
            END IF;
        END $$;
    `);
}

async function fetchProducts(client, productColumns) {
    const selectColumns = ['id'];

    for (const columnName of ['colors', 'sizes', 'details', 'color_group_id', 'size_group_id', 'colors_id', 'sizes_id', 'detail_id']) {
        if (productColumns.has(columnName)) {
            selectColumns.push(columnName);
        }
    }

    const result = await client.query(`
        SELECT ${selectColumns.join(', ')}
        FROM products
        ORDER BY id ASC
    `);

    return result.rows;
}

async function fetchColorsByRefs(client, refIds, colorsColumns) {
    const normalizedRefs = normalizeIdRefs(refIds);

    if (normalizedRefs.length === 0) {
        return [];
    }

    if (colorsColumns.has('items')) {
        const result = await client.query(
            `
                SELECT items
                FROM colors
                WHERE id = ANY($1::int[])
                ORDER BY array_position($1::int[], id)
            `,
            [normalizedRefs]
        );

        return mergeColors(
            result.rows.flatMap((row) => parseLegacyColors(row.items))
        );
    }

    if (colorsColumns.has('name') && colorsColumns.has('code')) {
        const result = await client.query(
            `
                SELECT id, name, code
                FROM colors
                WHERE id = ANY($1::int[])
                ORDER BY array_position($1::int[], id)
            `,
            [normalizedRefs]
        );

        return result.rows.map((row) => ({
            id: Number(row.id),
            name: String(row.name || '').trim(),
            hex: String(row.code || '').trim(),
        })).filter((item) => item.name);
    }

    return [];
}

async function fetchSizesByRefs(client, refIds, sizesColumns) {
    const normalizedRefs = normalizeIdRefs(refIds);

    if (normalizedRefs.length === 0) {
        return [];
    }

    if (sizesColumns.has('items')) {
        const result = await client.query(
            `
                SELECT items
                FROM sizes
                WHERE id = ANY($1::int[])
                ORDER BY array_position($1::int[], id)
            `,
            [normalizedRefs]
        );

        return mergeSizes(
            result.rows.flatMap((row) => parseLegacySizes(row.items))
        );
    }

    if (sizesColumns.has('name')) {
        const result = await client.query(
            `
                SELECT id, name
                FROM sizes
                WHERE id = ANY($1::int[])
                ORDER BY array_position($1::int[], id)
            `,
            [normalizedRefs]
        );

        return result.rows
            .map((row) => String(row.name || '').trim())
            .filter(Boolean);
    }

    return [];
}

function buildDetailsObjectFromRows(rows, keyField = 'section', valueField = 'value') {
    const details = createEmptyDetails();

    for (const row of rows) {
        appendDetail(
            details,
            String(row[keyField] || '').trim(),
            row[valueField]
        );
    }

    return details;
}

async function fetchDetailsByRefs(client, refIds, detailsColumns) {
    const normalizedRefs = normalizeIdRefs(refIds);

    if (normalizedRefs.length === 0) {
        return createEmptyDetails();
    }

    if (detailsColumns.has('material')) {
        const result = await client.query(
            `
                SELECT material, care, bullet_points, description_long
                FROM details
                WHERE id = ANY($1::int[])
                ORDER BY array_position($1::int[], id)
                LIMIT 1
            `,
            [normalizedRefs]
        );

        return result.rowCount === 0
            ? createEmptyDetails()
            : parseLegacyDetails(result.rows[0]);
    }

    if (detailsColumns.has('detail_key') && detailsColumns.has('detail_value')) {
        const result = await client.query(
            `
                SELECT detail_key, detail_value, display_order, id
                FROM details
                WHERE id = ANY($1::int[])
                ORDER BY array_position($1::int[], id), display_order ASC, id ASC
            `,
            [normalizedRefs]
        );

        return buildDetailsObjectFromRows(result.rows, 'detail_key', 'detail_value');
    }

    return createEmptyDetails();
}

async function fetchGroupColors(client, colorGroupId, hasTable) {
    if (!hasTable || !colorGroupId) {
        return [];
    }

    const result = await client.query(
        `
            SELECT name, hex
            FROM product_colors
            WHERE color_group_id = $1
            ORDER BY display_order ASC, id ASC
        `,
        [colorGroupId]
    );

    return result.rows.map((row) => ({
        name: String(row.name || '').trim(),
        hex: String(row.hex || '').trim(),
    })).filter((item) => item.name);
}

async function fetchGroupSizes(client, sizeGroupId, hasTable) {
    if (!hasTable || !sizeGroupId) {
        return [];
    }

    const result = await client.query(
        `
            SELECT label
            FROM product_sizes
            WHERE size_group_id = $1
            ORDER BY display_order ASC, id ASC
        `,
        [sizeGroupId]
    );

    return result.rows
        .map((row) => String(row.label || '').trim())
        .filter(Boolean);
}

async function fetchProductDetailsByProductId(client, productId, productDetailsColumns) {
    if (!(productDetailsColumns.has('product_id') && productDetailsColumns.has('section') && productDetailsColumns.has('value'))) {
        return createEmptyDetails();
    }

    const result = await client.query(
        `
            SELECT section, value
            FROM product_details
            WHERE product_id = $1
            ORDER BY display_order ASC, id ASC
        `,
        [productId]
    );

    return buildDetailsObjectFromRows(result.rows);
}

async function fetchLegacyProductDetailsByRef(client, detailRef, productDetailsColumns) {
    if (!detailRef || !productDetailsColumns.has('material')) {
        return createEmptyDetails();
    }

    const result = await client.query(
        `
            SELECT material, care, bullet_points, description_long
            FROM product_details
            WHERE id = $1
            LIMIT 1
        `,
        [detailRef]
    );

    return result.rowCount === 0
        ? createEmptyDetails()
        : parseLegacyDetails(result.rows[0]);
}

async function fetchProductDetailSnapshot(client, product, metadata) {
    const legacyProductDetails = metadata.productColumns.has('details')
        ? parseLegacyDetails(product.details)
        : createEmptyDetails();

    const lookupDetails = metadata.detailsTableExists && metadata.productColumns.has('detail_id')
        ? await fetchDetailsByRefs(client, product.detail_id, metadata.detailsColumns)
        : createEmptyDetails();

    let productDetails = createEmptyDetails();

    if (metadata.productDetailsTableExists) {
        if (
            metadata.productDetailsColumns.has('product_id')
            && metadata.productDetailsColumns.has('section')
            && metadata.productDetailsColumns.has('value')
        ) {
            productDetails = await fetchProductDetailsByProductId(
                client,
                Number(product.id),
                metadata.productDetailsColumns
            );
        } else if (metadata.productDetailsColumns.has('material')) {
            const detailRef = normalizeIdRefs(product.detail_id)[0] || product.detail_id;
            productDetails = await fetchLegacyProductDetailsByRef(
                client,
                detailRef,
                metadata.productDetailsColumns
            );
        }
    }

    if (hasDetailContent(productDetails)) {
        return productDetails;
    }

    if (hasDetailContent(legacyProductDetails)) {
        return legacyProductDetails;
    }

    if (hasDetailContent(lookupDetails)) {
        return lookupDetails;
    }

    return createEmptyDetails();
}

async function fetchVariantSnapshots(client, productId, variantColumns, colorsColumns, sizesColumns, hasGroupColors, hasGroupSizes) {
    if (!(await tableExists(client, 'product_variants'))) {
        return [];
    }

    const groupColorJoin = hasGroupColors && variantColumns.has('color_id')
        ? 'LEFT JOIN product_colors pc ON pc.id = pv.color_id'
        : '';
    const normalizedColorJoin = colorsColumns.has('name') && variantColumns.has('color_id')
        ? 'LEFT JOIN colors c ON c.id = pv.color_id'
        : '';
    const groupSizeJoin = hasGroupSizes && variantColumns.has('size_id')
        ? 'LEFT JOIN product_sizes ps ON ps.id = pv.size_id'
        : '';
    const normalizedSizeJoin = sizesColumns.has('name') && variantColumns.has('size_id')
        ? 'LEFT JOIN sizes s ON s.id = pv.size_id'
        : '';
    const colorNameSources = [];
    const colorHexSources = [];
    const sizeLabelSources = [];

    if (variantColumns.has('color_name')) {
        colorNameSources.push('pv.color_name');
    }

    if (variantColumns.has('color_hex')) {
        colorHexSources.push('pv.color_hex');
    }

    if (groupColorJoin) {
        colorNameSources.push('pc.name');
        colorHexSources.push('pc.hex');
    }

    if (normalizedColorJoin) {
        colorNameSources.push('c.name');
        colorHexSources.push('c.code');
    }

    if (variantColumns.has('size_label')) {
        sizeLabelSources.push('pv.size_label');
    }

    if (groupSizeJoin) {
        sizeLabelSources.push('ps.label');
    }

    if (normalizedSizeJoin) {
        sizeLabelSources.push('s.name');
    }

    const colorNameSql = colorNameSources.length > 0
        ? `COALESCE(${colorNameSources.join(', ')}, '') AS color_name`
        : `'' AS color_name`;
    const colorHexSql = colorHexSources.length > 0
        ? `COALESCE(${colorHexSources.join(', ')}, '') AS color_hex`
        : `'' AS color_hex`;
    const sizeLabelSql = sizeLabelSources.length > 0
        ? `COALESCE(${sizeLabelSources.join(', ')}, '') AS size_label`
        : `'' AS size_label`;

    const result = await client.query(
        `
            SELECT
                pv.id,
                ${colorNameSql},
                ${colorHexSql},
                ${sizeLabelSql}
            FROM product_variants pv
            ${groupColorJoin}
            ${normalizedColorJoin}
            ${groupSizeJoin}
            ${normalizedSizeJoin}
            WHERE pv.product_id = $1
            ORDER BY pv.id ASC
        `,
        [productId]
    );

    return result.rows.map((row) => ({
        id: Number(row.id),
        color_name: String(row.color_name || '').trim(),
        color_hex: String(row.color_hex || '').trim(),
        size_label: String(row.size_label || '').trim(),
    }));
}

async function buildProductSnapshots(client, metadata) {
    const products = await fetchProducts(client, metadata.productColumns);
    const snapshots = [];

    for (const product of products) {
        const legacyColors = metadata.productColumns.has('colors')
            ? parseLegacyColors(product.colors)
            : [];
        const currentColors = metadata.colorsTableExists
            ? await fetchColorsByRefs(client, product.colors_id, metadata.colorsColumns)
            : [];
        const groupColors = metadata.hasProductColors
            ? await fetchGroupColors(client, product.color_group_id, metadata.hasProductColors)
            : [];

        const legacySizes = metadata.productColumns.has('sizes')
            ? parseLegacySizes(product.sizes)
            : [];
        const currentSizes = metadata.sizesTableExists
            ? await fetchSizesByRefs(client, product.sizes_id, metadata.sizesColumns)
            : [];
        const groupSizes = metadata.hasProductSizes
            ? await fetchGroupSizes(client, product.size_group_id, metadata.hasProductSizes)
            : [];

        const details = await fetchProductDetailSnapshot(client, product, metadata);

        const variants = await fetchVariantSnapshots(
            client,
            Number(product.id),
            metadata.variantColumns,
            metadata.colorsColumns,
            metadata.sizesColumns,
            metadata.hasProductColors,
            metadata.hasProductSizes
        );

        snapshots.push({
            productId: Number(product.id),
            colors: legacyColors.length > 0
                ? mergeColors(legacyColors)
                : currentColors.length > 0
                    ? mergeColors(currentColors)
                    : mergeColors(groupColors),
            sizes: legacySizes.length > 0
                ? mergeSizes(legacySizes)
                : currentSizes.length > 0
                    ? mergeSizes(currentSizes)
                    : mergeSizes(groupSizes),
            details,
            variants,
        });
    }

    return snapshots;
}

async function insertOrReuseColor(client, cache, color) {
    const key = `${normalizeLookupKey(color.name)}::${String(color.hex || '').trim()}`;

    if (cache.has(key)) {
        return cache.get(key);
    }

    const result = await client.query(
        `
            INSERT INTO colors_next (name, code)
            VALUES ($1, $2)
            RETURNING id
        `,
        [color.name, color.hex || '']
    );

    const nextId = Number(result.rows[0].id);
    cache.set(key, nextId);
    return nextId;
}

async function insertOrReuseSize(client, cache, size) {
    const key = normalizeLookupKey(size);

    if (cache.has(key)) {
        return cache.get(key);
    }

    const result = await client.query(
        `
            INSERT INTO sizes_next (name)
            VALUES ($1)
            RETURNING id
        `,
        [size]
    );

    const nextId = Number(result.rows[0].id);
    cache.set(key, nextId);
    return nextId;
}

async function insertProductDetailsRows(client, productId, details) {
    const insertRows = async (section, values) => {
        for (const [index, value] of values.entries()) {
            await client.query(
                `
                    INSERT INTO product_details_next (
                        product_id,
                        section,
                        value,
                        display_order
                    )
                    VALUES ($1, $2, $3, $4)
                `,
                [productId, section, value, index]
            );
        }
    };

    await insertRows('material', details.material);
    await insertRows('care', details.care);
    await insertRows('bullet_point', details.bullet_point);
    await insertRows('description_long', details.description_long);
}

async function populateNormalizedSchema(client, snapshots) {
    const colorCache = new Map();
    const sizeCache = new Map();

    for (const snapshot of snapshots) {
        const colorIds = [];
        const sizeIds = [];
        const colorIdMap = new Map();
        const sizeIdMap = new Map();

        for (const color of snapshot.colors) {
            const colorId = await insertOrReuseColor(client, colorCache, color);
            colorIds.push(colorId);
            colorIdMap.set(normalizeLookupKey(color.name), colorId);
        }

        for (const size of snapshot.sizes) {
            const sizeId = await insertOrReuseSize(client, sizeCache, size);
            sizeIds.push(sizeId);
            sizeIdMap.set(normalizeLookupKey(size), sizeId);
        }

        await client.query(
            `
                UPDATE products
                SET
                    colors_id = $1::int[],
                    sizes_id = $2::int[]
                WHERE id = $3
            `,
            [colorIds, sizeIds, snapshot.productId]
        );

        await insertProductDetailsRows(client, snapshot.productId, snapshot.details);

        for (const variant of snapshot.variants) {
            const colorId = variant.color_name
                ? colorIdMap.get(normalizeLookupKey(variant.color_name)) || null
                : null;
            const sizeId = variant.size_label
                ? sizeIdMap.get(normalizeLookupKey(variant.size_label)) || null
                : null;

            await client.query(
                `
                    UPDATE product_variants
                    SET
                        color_id = $1,
                        size_id = $2
                    WHERE id = $3
                `,
                [colorId, sizeId, variant.id]
            );
        }
    }
}

async function replaceNormalizedTables(client, metadata) {
    if (metadata.colorsTableExists) {
        await client.query('DROP TABLE IF EXISTS colors');
    }

    if (metadata.sizesTableExists) {
        await client.query('DROP TABLE IF EXISTS sizes');
    }

    if (metadata.detailsTableExists) {
        await client.query('DROP TABLE IF EXISTS details');
    }

    if (metadata.productDetailsTableExists) {
        await client.query('DROP TABLE IF EXISTS product_details');
    }

    await client.query('ALTER TABLE colors_next RENAME TO colors');
    await client.query('ALTER TABLE sizes_next RENAME TO sizes');
    await client.query('ALTER TABLE product_details_next RENAME TO product_details');
}

async function ensureLookupIndexes(client) {
    await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_colors_name_code_unique
        ON colors (LOWER(name), code)
    `);

    await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_sizes_name_unique
        ON sizes (LOWER(name))
    `);

    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_product_details_product_order
        ON product_details (product_id, section, display_order, id)
    `);
}

async function cleanupLegacySchema(client, metadata) {
    await client.query(`
        ALTER TABLE products
        DROP COLUMN IF EXISTS colors,
        DROP COLUMN IF EXISTS sizes,
        DROP COLUMN IF EXISTS details,
        DROP COLUMN IF EXISTS color_group_id,
        DROP COLUMN IF EXISTS size_group_id,
        DROP COLUMN IF EXISTS detail_id
    `);

    await client.query(`
        ALTER TABLE product_variants
        DROP COLUMN IF EXISTS color_name,
        DROP COLUMN IF EXISTS color_hex,
        DROP COLUMN IF EXISTS size_label
    `);

    if (metadata.hasProductColors) {
        await client.query('DROP TABLE IF EXISTS product_colors');
    }

    if (metadata.hasProductSizes) {
        await client.query('DROP TABLE IF EXISTS product_sizes');
    }

    if (metadata.hasProductColorGroups) {
        await client.query('DROP TABLE IF EXISTS product_color_groups');
    }

    if (metadata.hasProductSizeGroups) {
        await client.query('DROP TABLE IF EXISTS product_size_groups');
    }
}

function isNormalizedSchema(metadata) {
    return metadata.colorsColumns.has('name')
        && metadata.colorsColumns.has('code')
        && !metadata.colorsColumns.has('items')
        && metadata.sizesColumns.has('name')
        && !metadata.sizesColumns.has('items')
        && !metadata.detailsTableExists
        && metadata.productDetailsColumns.has('product_id')
        && metadata.productDetailsColumns.has('section')
        && metadata.productDetailsColumns.has('value')
        && metadata.productColumns.get('colors_id') === '_int4'
        && metadata.productColumns.get('sizes_id') === '_int4'
        && !metadata.productColumns.has('colors')
        && !metadata.productColumns.has('sizes')
        && !metadata.productColumns.has('details')
        && !metadata.productColumns.has('color_group_id')
        && !metadata.productColumns.has('size_group_id')
        && !metadata.productColumns.has('detail_id')
        && metadata.variantColumns.has('color_id')
        && metadata.variantColumns.has('size_id')
        && !metadata.variantColumns.has('color_name')
        && !metadata.variantColumns.has('color_hex')
        && !metadata.variantColumns.has('size_label')
        && !metadata.hasProductColors
        && !metadata.hasProductSizes
        && !metadata.hasProductColorGroups
        && !metadata.hasProductSizeGroups;
}

async function collectMetadata(client) {
    const productColumns = await getColumnInfo(client, 'products');
    const variantColumns = await getColumnInfo(client, 'product_variants');
    const colorsTableExists = await tableExists(client, 'colors');
    const sizesTableExists = await tableExists(client, 'sizes');
    const detailsTableExists = await tableExists(client, 'details');
    const productDetailsTableExists = await tableExists(client, 'product_details');
    const colorsColumns = colorsTableExists ? await getColumnInfo(client, 'colors') : new Map();
    const sizesColumns = sizesTableExists ? await getColumnInfo(client, 'sizes') : new Map();
    const detailsColumns = detailsTableExists ? await getColumnInfo(client, 'details') : new Map();
    const productDetailsColumns = productDetailsTableExists ? await getColumnInfo(client, 'product_details') : new Map();

    return {
        productColumns,
        variantColumns,
        colorsTableExists,
        sizesTableExists,
        detailsTableExists,
        productDetailsTableExists,
        colorsColumns,
        sizesColumns,
        detailsColumns,
        productDetailsColumns,
        hasProductColors: await tableExists(client, 'product_colors'),
        hasProductSizes: await tableExists(client, 'product_sizes'),
        hasProductColorGroups: await tableExists(client, 'product_color_groups'),
        hasProductSizeGroups: await tableExists(client, 'product_size_groups'),
    };
}

async function migrateSchema(client) {
    const initialMetadata = await collectMetadata(client);

    await createNormalizedTablesIfMissing(
        client,
        initialMetadata.colorsColumns,
        initialMetadata.sizesColumns
    );
    await ensureProductVariantTable(client);
    await ensureProductsColumns(client, initialMetadata.productColumns);
    await ensureVariantReferenceColumns(client);

    const metadata = await collectMetadata(client);

    if (isNormalizedSchema(metadata)) {
        await ensureLookupIndexes(client);
        return;
    }

    const snapshots = await buildProductSnapshots(client, metadata);

    await createTargetTables(client);
    await ensureProductsColumns(client, await getColumnInfo(client, 'products'));
    await populateNormalizedSchema(client, snapshots);
    await cleanupLegacySchema(client, metadata);
    await replaceNormalizedTables(client, metadata);
    await ensureLookupIndexes(client);
}

export async function ensureProductVariantSchema() {
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    if (!productVariantSchemaReadyPromise) {
        productVariantSchemaReadyPromise = (async () => {
            const client = await pool.connect();

            try {
                await client.query('BEGIN');
                await migrateSchema(client);
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                productVariantSchemaReadyPromise = null;
                throw error;
            } finally {
                client.release();
            }
        })();
    }

    await productVariantSchemaReadyPromise;
}
