import { pool } from '../../../../../lib/db.js';
import { requireAdminWriteAccess } from '../../../../../lib/admin/auth.js';
import {
    deleteFallbackCategory,
    findFallbackCategoryById,
    isCategoryTestMode,
    isValidCategorySlug,
    normalizeCategoryPayload,
    updateFallbackCategory,
} from '../../../../../lib/admin/categories.js';

function forbiddenResponse() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function notFoundResponse() {
    return Response.json({ error: 'Category not found' }, { status: 404 });
}

async function parseCategoryId(params) {
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
        const id = await parseCategoryId(params);
        if (!id) {
            return notFoundResponse();
        }

        const body = await req.json();
        if (isCategoryTestMode()) {
            const currentCategory = findFallbackCategoryById(id);
            if (!currentCategory) {
                return notFoundResponse();
            }

            const { name, slug, activate } = normalizeCategoryPayload(body, {
                defaultActivate: currentCategory.activate,
            });

            if (!name) {
                return invalidFieldResponse('Name is required');
            }

            if (!slug) {
                return invalidFieldResponse('Slug is required');
            }

            if (!isValidCategorySlug(slug)) {
                return invalidFieldResponse('Slug cannot contain Turkish characters');
            }

            const updatedCategory = updateFallbackCategory(id, { name, slug, activate });
            if (!updatedCategory) {
                return notFoundResponse();
            }

            return Response.json(updatedCategory, { status: 200 });
        }

        const currentResult = await pool.query(
            'SELECT id, name, slug, activate, created_at FROM categories WHERE id = $1 LIMIT 1',
            [id]
        );

        if (currentResult.rowCount === 0) {
            return notFoundResponse();
        }

        const currentCategory = currentResult.rows[0];
        const { name, slug, activate } = normalizeCategoryPayload(body, {
            defaultActivate: Number(currentCategory.activate) === 1 ? 1 : 0,
        });

        if (!name) {
            return invalidFieldResponse('Name is required');
        }

        if (!slug) {
            return invalidFieldResponse('Slug is required');
        }

        if (!isValidCategorySlug(slug)) {
            return invalidFieldResponse('Slug cannot contain Turkish characters');
        }

        if (
            currentCategory.name === name
            && currentCategory.slug === slug
            && Number(currentCategory.activate) === activate
        ) {
            return Response.json({
                ...currentCategory,
                activate: Number(currentCategory.activate) === 1 ? 1 : 0,
                updated: false,
            }, { status: 200 });
        }

        const result = await pool.query(
            'UPDATE categories SET name = $1, slug = $2, activate = $3 WHERE id = $4 RETURNING id, name, slug, activate, created_at',
            [name, slug, activate, id]
        );

        return Response.json({
            ...result.rows[0],
            activate: Number(result.rows[0].activate) === 1 ? 1 : 0,
            updated: true,
        }, { status: 200 });
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Category already exists' }, { status: 409 });
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
        const id = await parseCategoryId(params);
        if (!id) {
            return notFoundResponse();
        }

        if (isCategoryTestMode()) {
            if (!deleteFallbackCategory(id)) {
                return notFoundResponse();
            }

            return Response.json({ deleted: true, id }, { status: 200 });
        }

        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 RETURNING id',
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
