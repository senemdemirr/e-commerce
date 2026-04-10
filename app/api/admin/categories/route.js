import { pool } from '../../../../lib/db.js';
import {
    requireAdminReadAccess,
    requireAdminWriteAccess,
} from '../../../../lib/admin/auth.js';
import {
    buildCategoriesWithSubcategories,
    createFallbackCategory,
    isCategoryTestMode,
    isValidCategorySlug,
    listFallbackCategories,
    normalizeCategoryPayload,
} from '../../../../lib/admin/categories.js';

function forbiddenResponse() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    if (isCategoryTestMode()) {
        return Response.json(listFallbackCategories(), { status: 200 });
    }

    try {
        const result = await pool.query(`
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                c.slug AS category_slug,
                c.activate AS category_activate,
                c.created_at AS category_created_at,
                COALESCE(category_stats.subcategory_count, 0) AS category_subcategory_count,
                COALESCE(category_stats.product_count, 0) AS category_product_count,
                sc.id AS subcategory_id,
                sc.name AS subcategory_name,
                sc.slug AS subcategory_slug,
                sc.created_at AS subcategory_created_at,
                COALESCE(subcategory_stats.product_count, 0) AS subcategory_product_count
            FROM categories c
            LEFT JOIN (
                SELECT
                    sc.category_id,
                    COUNT(DISTINCT sc.id) AS subcategory_count,
                    COUNT(DISTINCT p.id) AS product_count
                FROM sub_categories sc
                LEFT JOIN products p ON p.sub_category_id = sc.id
                GROUP BY sc.category_id
            ) AS category_stats ON category_stats.category_id = c.id
            LEFT JOIN sub_categories sc ON sc.category_id = c.id
            LEFT JOIN (
                SELECT
                    sc.id AS subcategory_id,
                    COUNT(p.id) AS product_count
                FROM sub_categories sc
                LEFT JOIN products p ON p.sub_category_id = sc.id
                GROUP BY sc.id
            ) AS subcategory_stats ON subcategory_stats.subcategory_id = sc.id
            ORDER BY c.created_at DESC NULLS LAST, c.id DESC, sc.created_at DESC NULLS LAST, sc.id DESC
        `);

        return Response.json(buildCategoriesWithSubcategories(result.rows), { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const body = await req.json();
        const { name, slug, activate } = normalizeCategoryPayload(body);

        if (!name) {
            return invalidFieldResponse('Name is required');
        }

        if (!slug) {
            return invalidFieldResponse('Slug is required');
        }

        if (!isValidCategorySlug(slug)) {
            return invalidFieldResponse('Slug cannot contain Turkish characters');
        }

        if (isCategoryTestMode()) {
            return Response.json(createFallbackCategory({ name, slug, activate }), { status: 201 });
        }

        const result = await pool.query(
            'INSERT INTO categories (name, slug, activate) VALUES ($1, $2, $3) RETURNING id, name, slug, activate, created_at',
            [name, slug, activate]
        );

        return Response.json({
            ...result.rows[0],
            activate: Number(result.rows[0].activate || 0) === 1 ? 1 : 0,
            product_count: 0,
            subcategory_count: 0,
            subcategories: [],
        }, { status: 201 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Category already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
