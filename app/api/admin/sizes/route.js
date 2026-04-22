import { pool } from '../../../../lib/db.js';
import { ensureProductVariantSchema } from '../../../../lib/productSchema.js';
import {
    requireAdminReadAccess,
    requireAdminWriteAccess,
} from '../../../../lib/admin/auth.js';
import {
    createFallbackSize,
    isSizeTestMode,
    listFallbackSizes,
    normalizeSizePayload,
    normalizeSizeRecord,
} from '../../../../lib/admin/sizes.js';

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function buildSizeListQuery(whereSql = '') {
    return `
        SELECT
            s.id,
            s.name,
            s.created_at,
            COALESCE(product_refs.product_count, 0) AS product_count,
            COALESCE(variant_refs.variant_count, 0) AS variant_count
        FROM sizes s
        LEFT JOIN (
            SELECT
                ref.size_id,
                COUNT(DISTINCT p.id)::int AS product_count
            FROM products p
            CROSS JOIN LATERAL unnest(COALESCE(p.sizes_id, ARRAY[]::int[])) AS ref(size_id)
            GROUP BY ref.size_id
        ) AS product_refs ON product_refs.size_id = s.id
        LEFT JOIN (
            SELECT
                pv.size_id,
                COUNT(*)::int AS variant_count
            FROM product_variants pv
            WHERE pv.size_id IS NOT NULL
            GROUP BY pv.size_id
        ) AS variant_refs ON variant_refs.size_id = s.id
        ${whereSql}
        ORDER BY s.created_at DESC NULLS LAST, s.id DESC
    `;
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    if (isSizeTestMode()) {
        return Response.json(listFallbackSizes(), { status: 200 });
    }

    try {
        await ensureProductVariantSchema();

        const result = await pool.query(buildSizeListQuery());

        return Response.json(
            result.rows.map((row) => normalizeSizeRecord(row)),
            { status: 200 }
        );
    } catch {
        return Response.json({ error: 'Sizes could not be loaded' }, { status: 500 });
    }
}

export async function POST(req) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const body = await req.json();
        const { name } = normalizeSizePayload(body);

        if (!name) {
            return invalidFieldResponse('Size name is required');
        }

        if (isSizeTestMode()) {
            return Response.json(createFallbackSize({ name }), { status: 201 });
        }

        await ensureProductVariantSchema();

        const result = await pool.query(
            `
                INSERT INTO sizes (name)
                VALUES ($1)
                RETURNING id, name, created_at
            `,
            [name]
        );

        return Response.json(
            normalizeSizeRecord({
                ...result.rows[0],
                product_count: 0,
                variant_count: 0,
            }),
            { status: 201 }
        );
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Size already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
