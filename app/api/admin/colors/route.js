import { pool } from '../../../../lib/db.js';
import { ensureProductVariantSchema } from '../../../../lib/productSchema.js';
import {
    requireAdminReadAccess,
    requireAdminWriteAccess,
} from '../../../../lib/admin/auth.js';
import {
    createFallbackColor,
    isColorTestMode,
    isValidColorHex,
    listFallbackColors,
    normalizeColorPayload,
    normalizeColorRecord,
} from '../../../../lib/admin/colors.js';

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function buildColorListQuery(whereSql = '') {
    return `
        SELECT
            c.id,
            c.name,
            c.code AS hex,
            c.created_at,
            COALESCE(product_refs.product_count, 0) AS product_count,
            COALESCE(variant_refs.variant_count, 0) AS variant_count
        FROM colors c
        LEFT JOIN (
            SELECT
                ref.color_id,
                COUNT(DISTINCT p.id)::int AS product_count
            FROM products p
            CROSS JOIN LATERAL unnest(COALESCE(p.colors_id, ARRAY[]::int[])) AS ref(color_id)
            GROUP BY ref.color_id
        ) AS product_refs ON product_refs.color_id = c.id
        LEFT JOIN (
            SELECT
                pv.color_id,
                COUNT(*)::int AS variant_count
            FROM product_variants pv
            WHERE pv.color_id IS NOT NULL
            GROUP BY pv.color_id
        ) AS variant_refs ON variant_refs.color_id = c.id
        ${whereSql}
        ORDER BY c.created_at DESC NULLS LAST, c.id DESC
    `;
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    if (isColorTestMode()) {
        return Response.json(listFallbackColors(), { status: 200 });
    }

    try {
        await ensureProductVariantSchema();

        const result = await pool.query(buildColorListQuery());

        return Response.json(
            result.rows.map((row) => normalizeColorRecord(row)),
            { status: 200 }
        );
    } catch {
        return Response.json({ error: 'Colors could not be loaded' }, { status: 500 });
    }
}

export async function POST(req) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const body = await req.json();
        const { name, hex } = normalizeColorPayload(body);

        if (!name) {
            return invalidFieldResponse('Color name is required');
        }

        if (!hex || !isValidColorHex(hex)) {
            return invalidFieldResponse('Color hex must be a valid 6-digit hex code');
        }

        if (isColorTestMode()) {
            return Response.json(createFallbackColor({ name, hex }), { status: 201 });
        }

        await ensureProductVariantSchema();

        const result = await pool.query(
            `
                INSERT INTO colors (name, code)
                VALUES ($1, $2)
                RETURNING id, name, code AS hex, created_at
            `,
            [name, hex]
        );

        return Response.json(
            normalizeColorRecord({
                ...result.rows[0],
                product_count: 0,
                variant_count: 0,
            }),
            { status: 201 }
        );
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Color already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
