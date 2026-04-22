import { pool } from '../../../../../lib/db.js';
import { ensureProductVariantSchema } from '../../../../../lib/productSchema.js';
import { requireAdminReadAccess } from '../../../../../lib/admin/auth.js';
import {
    isProductTestMode,
    listFallbackProducts,
} from '../../../../../lib/admin/products.js';

function normalizeLookupKey(value) {
    return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function createEmptyLookups() {
    return {
        colors: [],
        sizes: [],
        details: {
            material: [],
            care: [],
            bullet_point: [],
        },
    };
}

function sortByLookupLabel(values) {
    return [...values].sort((left, right) => left.localeCompare(right, 'tr-TR'));
}

function buildFallbackLookups() {
    const lookups = createEmptyLookups();
    const colorMap = new Map();
    const sizeSet = new Set();

    for (const product of listFallbackProducts()) {
        for (const color of product.colors || []) {
            const name = String(color?.name || '').trim();
            const hex = String(color?.hex || '').trim() || '#111827';
            const key = normalizeLookupKey(name);

            if (!name || colorMap.has(key)) {
                continue;
            }

            colorMap.set(key, { name, hex });
        }

        for (const size of product.sizes || []) {
            const label = String(size || '').trim();

            if (label) {
                sizeSet.add(label);
            }
        }
    }

    lookups.colors = Array.from(colorMap.values()).sort((left, right) => (
        left.name.localeCompare(right.name, 'tr-TR')
    ));
    lookups.sizes = sortByLookupLabel(Array.from(sizeSet));

    return lookups;
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);

    if (denied) {
        return denied;
    }

    if (isProductTestMode()) {
        return Response.json(buildFallbackLookups(), { status: 200 });
    }

    try {
        await ensureProductVariantSchema();

        const [colorsResult, sizesResult] = await Promise.all([
            pool.query(
                `
                    SELECT DISTINCT ON (LOWER(name))
                        name,
                        code
                    FROM colors
                    WHERE TRIM(COALESCE(name, '')) <> ''
                    ORDER BY LOWER(name), id ASC
                `
            ),
            pool.query(
                `
                    SELECT DISTINCT ON (LOWER(name))
                        name
                    FROM sizes
                    WHERE TRIM(COALESCE(name, '')) <> ''
                    ORDER BY LOWER(name), id ASC
                `
            ),
        ]);

        const lookups = createEmptyLookups();

        lookups.colors = colorsResult.rows.map((row) => ({
            name: String(row.name || '').trim(),
            hex: String(row.code || '').trim() || '#111827',
        }));
        lookups.sizes = sizesResult.rows.map((row) => String(row.name || '').trim()).filter(Boolean);

        return Response.json(lookups, { status: 200 });
    } catch {
        return Response.json({ error: 'Product lookups could not be loaded.' }, { status: 500 });
    }
}
