import { pool } from '../../../../lib/db.js';
import {
    buildCategoriesWithSubcategories,
    createFallbackCategory,
    isAdminRequest,
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
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
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
                c.created_at AS category_created_at,
                sc.id AS subcategory_id,
                sc.name AS subcategory_name,
                sc.slug AS subcategory_slug,
                sc.created_at AS subcategory_created_at
            FROM categories c
            LEFT JOIN sub_categories sc ON sc.category_id = c.id
            ORDER BY c.id ASC, sc.id ASC
        `);

        return Response.json(buildCategoriesWithSubcategories(result.rows), { status: 200 });
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
        const { name, slug } = normalizeCategoryPayload(body);

        if (!name) {
            return invalidFieldResponse('name alanı zorunlu');
        }

        if (!slug) {
            return invalidFieldResponse('slug alanı zorunlu');
        }

        if (!isValidCategorySlug(slug)) {
            return invalidFieldResponse('slug alanı Türkçe karakter içeremez');
        }

        if (isCategoryTestMode()) {
            return Response.json(createFallbackCategory({ name, slug }), { status: 201 });
        }

        const result = await pool.query(
            'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug, created_at',
            [name, slug]
        );

        return Response.json({
            ...result.rows[0],
            subcategories: [],
        }, { status: 201 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Category already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
