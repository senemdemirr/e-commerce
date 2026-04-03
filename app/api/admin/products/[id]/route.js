import { pool } from '../../../../../lib/db.js';
import { isAdminRequest } from '../../../../../lib/admin/categories.js';
import {
    convertImageToStorageValue,
    deleteFallbackProduct,
    findFallbackProductById,
    findFallbackSubcategoryById,
    isProductTestMode,
    normalizeProductRow,
    parseProductFormData,
    updateFallbackProduct,
} from '../../../../../lib/admin/products.js';

function forbiddenResponse() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function notFoundResponse() {
    return Response.json({ error: 'Product not found' }, { status: 404 });
}

function normalizeId(params) {
    const value = Number(params?.id);
    return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(req, { params }) {
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
    }

    const id = normalizeId(params);

    if (!id) {
        return invalidFieldResponse('Invalid product id');
    }

    if (isProductTestMode()) {
        const product = findFallbackProductById(id);
        return product
            ? Response.json(product, { status: 200 })
            : notFoundResponse();
    }

    try {
        const result = await pool.query(
            `
                SELECT
                    p.id,
                    p.sub_category_id,
                    p.title,
                    p.description,
                    p.sku,
                    p.price,
                    p.image,
                    p.brand,
                    p.colors,
                    p.sizes,
                    p.details,
                    p.created_at,
                    sc.id AS subcategory_id,
                    sc.name AS subcategory_name,
                    sc.slug AS "subCategorySlug",
                    c.id AS category_id,
                    c.name AS category_name,
                    c.slug AS "categorySlug"
                FROM products p
                LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
                LEFT JOIN categories c ON c.id = sc.category_id
                WHERE p.id = $1
                LIMIT 1
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return notFoundResponse();
        }

        return Response.json(normalizeProductRow(result.rows[0]), { status: 200 });
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
    }

    const id = normalizeId(params);

    if (!id) {
        return invalidFieldResponse('Invalid product id');
    }

    try {
        const formData = await req.formData();
        const entries = Array.from(formData?.entries?.() || []);

        if (entries.length === 0) {
            return Response.json({ message: 'No changes submitted' }, { status: 200 });
        }

        const parsed = await parseProductFormData(formData);

        if (parsed.error) {
            return invalidFieldResponse(parsed.error);
        }

        const imageValue = await convertImageToStorageValue(parsed.payload.image);

        if (isProductTestMode()) {
            const subcategory = findFallbackSubcategoryById(parsed.payload.subcategory_id);

            if (!subcategory) {
                return Response.json({ error: 'Sub-category not found' }, { status: 404 });
            }

            const updatedProduct = updateFallbackProduct(id, {
                sub_category_id: parsed.payload.subcategory_id,
                title: parsed.payload.title,
                description: parsed.payload.description,
                sku: parsed.payload.sku,
                price: parsed.payload.price,
                image: imageValue,
                brand: parsed.payload.brand,
                colors: parsed.payload.colors,
                sizes: parsed.payload.sizes,
                details: parsed.payload.details,
            });

            return updatedProduct
                ? Response.json(updatedProduct, { status: 200 })
                : notFoundResponse();
        }

        const subcategoryResult = await pool.query(
            `
                SELECT
                    sc.id,
                    sc.name AS subcategory_name,
                    sc.slug AS "subCategorySlug",
                    c.id AS category_id,
                    c.name AS category_name,
                    c.slug AS "categorySlug"
                FROM sub_categories sc
                INNER JOIN categories c ON c.id = sc.category_id
                WHERE sc.id = $1
                LIMIT 1
            `,
            [parsed.payload.subcategory_id]
        );

        if (subcategoryResult.rowCount === 0) {
            return Response.json({ error: 'Sub-category not found' }, { status: 404 });
        }

        const updatedProduct = await pool.query(
            `
                UPDATE products
                SET
                    sub_category_id = $1,
                    title = $2,
                    description = $3,
                    sku = $4,
                    price = $5,
                    image = $6,
                    brand = $7,
                    colors = $8::jsonb,
                    sizes = $9,
                    details = $10::jsonb
                WHERE id = $11
                RETURNING id, sub_category_id, title, description, sku, price, image, brand, colors, sizes, details, created_at
            `,
            [
                parsed.payload.subcategory_id,
                parsed.payload.title,
                parsed.payload.description,
                parsed.payload.sku,
                parsed.payload.price,
                imageValue,
                parsed.payload.brand,
                JSON.stringify(parsed.payload.colors),
                parsed.payload.sizes,
                JSON.stringify(parsed.payload.details),
                id,
            ]
        );

        if (updatedProduct.rowCount === 0) {
            return notFoundResponse();
        }

        return Response.json(
            normalizeProductRow({
                ...updatedProduct.rows[0],
                ...subcategoryResult.rows[0],
            }),
            { status: 200 }
        );
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Product already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    if (!isAdminRequest(req)) {
        return forbiddenResponse();
    }

    const id = normalizeId(params);

    if (!id) {
        return invalidFieldResponse('Invalid product id');
    }

    if (isProductTestMode()) {
        return deleteFallbackProduct(id)
            ? Response.json({ id }, { status: 200 })
            : notFoundResponse();
    }

    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rowCount === 0) {
            return notFoundResponse();
        }

        return Response.json({ id: Number(result.rows[0].id) }, { status: 200 });
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
