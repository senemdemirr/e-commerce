import { pool } from '../../../../../lib/db.js';
import { ensureProductVariantSchema } from '../../../../../lib/productSchema.js';
import { requireAdminWriteAccess } from '../../../../../lib/admin/auth.js';
import {
    deleteFallbackColor,
    findFallbackColorById,
    isColorTestMode,
    isValidColorHex,
    normalizeColorPayload,
    normalizeColorRecord,
    updateFallbackColor,
} from '../../../../../lib/admin/colors.js';

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function notFoundResponse() {
    return Response.json({ error: 'Color not found' }, { status: 404 });
}

async function parseColorId(params) {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function loadColorById(id) {
    const result = await pool.query(
        `
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
            WHERE c.id = $1
            LIMIT 1
        `,
        [id]
    );

    return result.rowCount > 0 ? normalizeColorRecord(result.rows[0]) : null;
}

export async function PUT(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseColorId(params);

        if (!id) {
            return notFoundResponse();
        }

        const body = await req.json();
        const { name, hex } = normalizeColorPayload(body);

        if (!name) {
            return invalidFieldResponse('Color name is required');
        }

        if (!hex || !isValidColorHex(hex)) {
            return invalidFieldResponse('Color hex must be a valid 6-digit hex code');
        }

        if (isColorTestMode()) {
            const currentColor = findFallbackColorById(id);

            if (!currentColor) {
                return notFoundResponse();
            }

            return Response.json(updateFallbackColor(id, { name, hex }), { status: 200 });
        }

        await ensureProductVariantSchema();

        const currentColor = await loadColorById(id);

        if (!currentColor) {
            return notFoundResponse();
        }

        if (currentColor.name === name && currentColor.hex === hex) {
            return Response.json({
                ...currentColor,
                updated: false,
            }, { status: 200 });
        }

        const result = await pool.query(
            `
                UPDATE colors
                SET name = $1, code = $2
                WHERE id = $3
                RETURNING id, name, code AS hex, created_at
            `,
            [name, hex, id]
        );

        return Response.json({
            ...normalizeColorRecord({
                ...result.rows[0],
                product_count: currentColor.product_count,
                variant_count: currentColor.variant_count,
            }),
            updated: true,
        }, { status: 200 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Color already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseColorId(params);

        if (!id) {
            return notFoundResponse();
        }

        if (isColorTestMode()) {
            const currentColor = findFallbackColorById(id);

            if (!currentColor) {
                return notFoundResponse();
            }

            if (currentColor.is_used) {
                return Response.json({ error: 'Used colors cannot be deleted' }, { status: 409 });
            }

            deleteFallbackColor(id);
            return Response.json({ deleted: true, id }, { status: 200 });
        }

        await ensureProductVariantSchema();

        const currentColor = await loadColorById(id);

        if (!currentColor) {
            return notFoundResponse();
        }

        if (currentColor.is_used) {
            return Response.json({ error: 'Used colors cannot be deleted' }, { status: 409 });
        }

        await pool.query(
            'DELETE FROM colors WHERE id = $1',
            [id]
        );

        return Response.json({ deleted: true, id }, { status: 200 });
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
