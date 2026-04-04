import { pool } from '../../../../../lib/db.js';
import { requireAdminWriteAccess } from '../../../../../lib/admin/auth.js';
import {
    deleteFallbackSubcategory,
    findFallbackParentCategoryById,
    findFallbackSubcategoryById,
    isSubcategoryTestMode,
    isValidSubcategorySlug,
    normalizeSubcategoryPayload,
    updateFallbackSubcategory,
} from '../../../../../lib/admin/subcategories.js';

function forbiddenResponse() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function notFoundResponse() {
    return Response.json({ error: 'Subcategory not found' }, { status: 404 });
}

function parentCategoryNotFoundResponse() {
    return Response.json({ error: 'Parent category not found' }, { status: 404 });
}

async function parseSubcategoryId(params) {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseSubcategoryId(params);
        if (!id) {
            return notFoundResponse();
        }

        const body = await req.json();

        if (isSubcategoryTestMode()) {
            const currentSubcategory = findFallbackSubcategoryById(id);

            if (!currentSubcategory) {
                return notFoundResponse();
            }

            const { name, slug, category_id, activate } = normalizeSubcategoryPayload(body, {
                defaultActivate: currentSubcategory.activate,
            });

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

            if (!findFallbackParentCategoryById(category_id)) {
                return parentCategoryNotFoundResponse();
            }

            const updatedSubcategory = updateFallbackSubcategory(id, {
                name,
                slug,
                category_id,
                activate,
            });
            if (!updatedSubcategory) {
                return notFoundResponse();
            }

            return Response.json(updatedSubcategory, { status: 200 });
        }

        const currentResult = await pool.query(
            `
                SELECT
                    sc.id,
                    sc.category_id,
                    sc.name,
                    sc.slug,
                    sc.activate,
                    sc.created_at,
                    c.name AS category_name,
                    c.slug AS category_slug
                FROM sub_categories sc
                INNER JOIN categories c ON c.id = sc.category_id
                WHERE sc.id = $1
                LIMIT 1
            `,
            [id]
        );

        if (currentResult.rowCount === 0) {
            return notFoundResponse();
        }

        const currentSubcategory = currentResult.rows[0];
        const { name, slug, category_id, activate } = normalizeSubcategoryPayload(body, {
            defaultActivate: Number(currentSubcategory.activate ?? 1) === 1 ? 1 : 0,
        });

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

        const categoryResult = await pool.query(
            'SELECT id, name, slug FROM categories WHERE id = $1 LIMIT 1',
            [category_id]
        );

        if (categoryResult.rowCount === 0) {
            return parentCategoryNotFoundResponse();
        }

        const parentCategory = categoryResult.rows[0];

        if (
            currentSubcategory.name === name
            && currentSubcategory.slug === slug
            && Number(currentSubcategory.category_id) === category_id
            && Number(currentSubcategory.activate ?? 1) === activate
        ) {
            return Response.json({
                ...currentSubcategory,
                category_id: Number(currentSubcategory.category_id),
                activate: Number(currentSubcategory.activate ?? 1) === 1 ? 1 : 0,
                updated: false,
            }, { status: 200 });
        }

        const result = await pool.query(
            'UPDATE sub_categories SET name = $1, slug = $2, category_id = $3, activate = $4 WHERE id = $5 RETURNING id, category_id, name, slug, activate, created_at',
            [name, slug, category_id, activate, id]
        );

        return Response.json({
            ...result.rows[0],
            category_id: Number(result.rows[0].category_id),
            activate: Number(result.rows[0].activate ?? 1) === 1 ? 1 : 0,
            category_name: parentCategory.name,
            category_slug: parentCategory.slug,
            updated: true,
        }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params } = {}) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        const id = await parseSubcategoryId(params);
        if (!id) {
            return notFoundResponse();
        }

        if (isSubcategoryTestMode()) {
            if (!deleteFallbackSubcategory(id)) {
                return notFoundResponse();
            }

            return Response.json({ deleted: true, id }, { status: 200 });
        }

        const result = await pool.query(
            'DELETE FROM sub_categories WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rowCount === 0) {
            return notFoundResponse();
        }

        return Response.json({ deleted: true, id: result.rows[0].id }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
