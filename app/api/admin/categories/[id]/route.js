import { pool } from '../../../../../lib/db.js';
import {
    deleteFallbackCategory,
    isAdminRequest,
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
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
    }

    try {
        const id = await parseCategoryId(params);
        if (!id) {
            return notFoundResponse();
        }

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
            const updatedCategory = updateFallbackCategory(id, { name, slug });
            if (!updatedCategory) {
                return notFoundResponse();
            }

            return Response.json(updatedCategory, { status: 200 });
        }

        const currentResult = await pool.query(
            'SELECT id, name, slug, created_at FROM categories WHERE id = $1 LIMIT 1',
            [id]
        );

        if (currentResult.rowCount === 0) {
            return notFoundResponse();
        }

        const currentCategory = currentResult.rows[0];
        if (currentCategory.name === name && currentCategory.slug === slug) {
            return Response.json({
                ...currentCategory,
                updated: false,
            }, { status: 200 });
        }

        const result = await pool.query(
            'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING id, name, slug, created_at',
            [name, slug, id]
        );

        return Response.json({
            ...result.rows[0],
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
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
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
