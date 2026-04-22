import { pool } from '../../../../../lib/db.js';
import { ensureProductVariantSchema } from '../../../../../lib/productSchema.js';
import { requireAdminWriteAccess } from '../../../../../lib/admin/auth.js';
import {
    deleteFallbackSize,
    findFallbackSizeById,
    isSizeTestMode,
    normalizeSizePayload,
    normalizeSizeRecord,
    updateFallbackSize,
} from '../../../../../lib/admin/sizes.js';

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function notFoundResponse() {
    return Response.json({ error: 'Size not found' }, { status: 404 });
}

async function parseSizeId(params) {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function loadSizeById(id) {
    const result = await pool.query(
        `
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
            WHERE s.id = $1
            LIMIT 1
        `,
        [id]
    );

    return result.rowCount > 0 ? normalizeSizeRecord(result.rows[0]) : null;
}

export async function PUT(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseSizeId(params);

        if (!id) {
            return notFoundResponse();
        }

        const body = await req.json();
        const { name } = normalizeSizePayload(body);

        if (!name) {
            return invalidFieldResponse('Size name is required');
        }

        if (isSizeTestMode()) {
            const currentSize = findFallbackSizeById(id);

            if (!currentSize) {
                return notFoundResponse();
            }

            return Response.json(updateFallbackSize(id, { name }), { status: 200 });
        }

        await ensureProductVariantSchema();

        const currentSize = await loadSizeById(id);

        if (!currentSize) {
            return notFoundResponse();
        }

        if (currentSize.name === name) {
            return Response.json({
                ...currentSize,
                updated: false,
            }, { status: 200 });
        }

        const result = await pool.query(
            `
                UPDATE sizes
                SET name = $1
                WHERE id = $2
                RETURNING id, name, created_at
            `,
            [name, id]
        );

        return Response.json({
            ...normalizeSizeRecord({
                ...result.rows[0],
                product_count: currentSize.product_count,
                variant_count: currentSize.variant_count,
            }),
            updated: true,
        }, { status: 200 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Size already exists' }, { status: 409 });
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
        const id = await parseSizeId(params);

        if (!id) {
            return notFoundResponse();
        }

        if (isSizeTestMode()) {
            const currentSize = findFallbackSizeById(id);

            if (!currentSize) {
                return notFoundResponse();
            }

            if (currentSize.is_used) {
                return Response.json({ error: 'Used sizes cannot be deleted' }, { status: 409 });
            }

            deleteFallbackSize(id);
            return Response.json({ deleted: true, id }, { status: 200 });
        }

        await ensureProductVariantSchema();

        const currentSize = await loadSizeById(id);

        if (!currentSize) {
            return notFoundResponse();
        }

        if (currentSize.is_used) {
            return Response.json({ error: 'Used sizes cannot be deleted' }, { status: 409 });
        }

        await pool.query(
            'DELETE FROM sizes WHERE id = $1',
            [id]
        );

        return Response.json({ deleted: true, id }, { status: 200 });
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
