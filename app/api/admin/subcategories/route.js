import { pool } from '../../../../lib/db.js';
import { isAdminRequest } from '../../../../lib/admin/categories.js';
import {
    createFallbackSubcategory,
    findFallbackParentCategoryById,
    isSubcategoryTestMode,
    isValidSubcategorySlug,
    listFallbackSubcategories,
    normalizeSubcategoryPayload,
} from '../../../../lib/admin/subcategories.js';

function forbiddenResponse() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function parentCategoryNotFoundResponse() {
    return Response.json({ error: 'Parent category not found' }, { status: 404 });
}

export async function GET(req) {
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
    }

    if (isSubcategoryTestMode()) {
        return Response.json(listFallbackSubcategories(), { status: 200 });
    }

    try {
        const result = await pool.query(`
            SELECT
                sc.id,
                sc.category_id,
                sc.name,
                sc.slug,
                sc.activate,
                sc.created_at,
                c.name AS category_name,
                c.slug AS category_slug,
                COALESCE(COUNT(p.id), 0) AS product_count
            FROM sub_categories sc
            INNER JOIN categories c ON c.id = sc.category_id
            LEFT JOIN products p ON p.sub_category_id = sc.id
            GROUP BY sc.id, sc.activate, c.name, c.slug
            ORDER BY sc.created_at DESC NULLS LAST, sc.id DESC
        `);

        return Response.json(
            result.rows.map((subcategory) => ({
                ...subcategory,
                category_id: Number(subcategory.category_id),
                activate: Number(subcategory.activate ?? 1) === 1 ? 1 : 0,
                product_count: Number(subcategory.product_count || 0),
            })),
            { status: 200 }
        );
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
    }

    try {
        const body = await req.json();
        const { name, slug, category_id, activate } = normalizeSubcategoryPayload(body);

        if (!name) {
            return invalidFieldResponse('Name is required');
        }

        if (!category_id) {
            return invalidFieldResponse('Parent category is required');
        }

        if (!slug) {
            return invalidFieldResponse('Slug is required');
        }

        if (!isValidSubcategorySlug(slug)) {
            return invalidFieldResponse('Slug cannot contain Turkish characters');
        }

        if (isSubcategoryTestMode()) {
            const parentCategory = findFallbackParentCategoryById(category_id);

            if (!parentCategory) {
                return parentCategoryNotFoundResponse();
            }

            return Response.json(
                createFallbackSubcategory({ name, slug, category_id, activate }),
                { status: 201 }
            );
        }

        const categoryResult = await pool.query(
            'SELECT id, name, slug FROM categories WHERE id = $1 LIMIT 1',
            [category_id]
        );

        if (categoryResult.rowCount === 0) {
            return parentCategoryNotFoundResponse();
        }

        const parentCategory = categoryResult.rows[0];
        const result = await pool.query(
            'INSERT INTO sub_categories (category_id, name, slug, activate) VALUES ($1, $2, $3, $4) RETURNING id, category_id, name, slug, activate, created_at',
            [category_id, name, slug, activate]
        );

        return Response.json({
            ...result.rows[0],
            category_id: Number(result.rows[0].category_id),
            activate: Number(result.rows[0].activate ?? 1) === 1 ? 1 : 0,
            category_name: parentCategory.name,
            category_slug: parentCategory.slug,
            product_count: 0,
        }, { status: 201 });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
