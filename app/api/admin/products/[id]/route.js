import { pool } from '../../../../../lib/db.js';
import {
    buildProductRelationsJoins,
    buildProductRelationsSelect,
} from '../../../../../lib/products-data.js';
import { ensureProductVariantSchema } from '../../../../../lib/productSchema.js';
import {
    requireAdminReadAccess,
    requireAdminWriteAccess,
} from '../../../../../lib/admin/auth.js';
import {
    convertImageToStorageValue,
    deleteFallbackProduct,
    deleteProductRelations,
    findFallbackProductById,
    findFallbackSubcategoryById,
    isProductTestMode,
    normalizeProductRow,
    parseProductFormData,
    prepareProductRelations,
    syncProductVariantsForProduct,
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

async function normalizeId(params) {
    const resolvedParams = await params;
    const value = Number(resolvedParams?.id);
    return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(req, { params }) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    const id = await normalizeId(params);

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
        await ensureProductVariantSchema();

        const result = await pool.query(
            `
                SELECT
                    ${buildProductRelationsSelect('p')},
                    sc.id AS subcategory_id,
                    sc.name AS subcategory_name,
                    sc.slug AS "subCategorySlug",
                    c.id AS category_id,
                    c.name AS category_name,
                    c.slug AS "categorySlug"
                FROM products p
                ${buildProductRelationsJoins('p')}
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
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    const id = await normalizeId(params);

    if (!id) {
        return invalidFieldResponse('Invalid product id');
    }

    try {
        await ensureProductVariantSchema();

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
                variants: parsed.payload.variants,
            });

            return updatedProduct
                ? Response.json(updatedProduct, { status: 200 })
                : notFoundResponse();
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const existingProduct = await client.query(
                `
                    SELECT
                        id,
                        colors_id,
                        sizes_id,
                        detail_id
                    FROM products
                    WHERE id = $1
                    LIMIT 1
                    FOR UPDATE
                `,
                [id]
            );

            if (existingProduct.rowCount === 0) {
                await client.query('ROLLBACK');
                return notFoundResponse();
            }

            const subcategoryResult = await client.query(
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
                await client.query('ROLLBACK');
                return Response.json({ error: 'Sub-category not found' }, { status: 404 });
            }

            const relationState = await prepareProductRelations(
                client,
                parsed.payload,
                existingProduct.rows[0]
            );

            const updatedProduct = await client.query(
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
                        colors_id = $8,
                        sizes_id = $9,
                        detail_id = $10
                    WHERE id = $11
                    RETURNING id, sub_category_id, title, description, sku, price, image, brand, colors_id, sizes_id, detail_id, created_at
                `,
                [
                    parsed.payload.subcategory_id,
                    parsed.payload.title,
                    parsed.payload.description,
                    parsed.payload.sku,
                    parsed.payload.price,
                    imageValue,
                    parsed.payload.brand,
                    relationState.colors_id,
                    relationState.sizes_id,
                    relationState.detail_id,
                    id,
                ]
            );

            await syncProductVariantsForProduct(client, id, parsed.payload, relationState);
            await client.query('COMMIT');

            return Response.json(
                normalizeProductRow({
                    ...updatedProduct.rows[0],
                    ...subcategoryResult.rows[0],
                    colors: parsed.payload.colors,
                    sizes: parsed.payload.sizes,
                    details: parsed.payload.details,
                    variants: parsed.payload.variants,
                    variant_count: parsed.payload.variants.length,
                }),
                { status: 200 }
            );
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        if (error?.code === '23505') {
            return Response.json({ error: 'Product already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    const id = await normalizeId(params);

    if (!id) {
        return invalidFieldResponse('Invalid product id');
    }

    if (isProductTestMode()) {
        return deleteFallbackProduct(id)
            ? Response.json({ id }, { status: 200 })
            : notFoundResponse();
    }

    try {
        await ensureProductVariantSchema();

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const productResult = await client.query(
                `
                    SELECT id, colors_id, sizes_id, detail_id
                    FROM products
                    WHERE id = $1
                    LIMIT 1
                    FOR UPDATE
                `,
                [id]
            );

            if (productResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return notFoundResponse();
            }

            const result = await client.query(
                'DELETE FROM products WHERE id = $1 RETURNING id',
                [id]
            );

            await deleteProductRelations(client, productResult.rows[0]);
            await client.query('COMMIT');

            return Response.json({ id: Number(result.rows[0].id) }, { status: 200 });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
