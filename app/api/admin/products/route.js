import { pool } from '../../../../lib/db.js';
import {
    buildProductRelationsJoins,
    buildProductRelationsSelect,
} from '../../../../lib/products-data.js';
import { ensureProductVariantSchema } from '../../../../lib/productSchema.js';
import {
    requireAdminReadAccess,
    requireAdminWriteAccess,
} from '../../../../lib/admin/auth.js';
import {
    convertImageToStorageValue,
    createFallbackProduct,
    findFallbackSubcategoryById,
    isProductTestMode,
    listFallbackProducts,
    normalizeProductRow,
    parseProductFormData,
    prepareProductRelations,
    replaceProductDetailsForProduct,
    syncProductVariantsForProduct,
} from '../../../../lib/admin/products.js';

function forbiddenResponse() {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidFieldResponse(message) {
    return Response.json({ error: message }, { status: 400 });
}

function getSearchParams(req) {
    if (req?.nextUrl?.searchParams) {
        return req.nextUrl.searchParams;
    }

    try {
        return new URL(req?.url || 'http://localhost').searchParams;
    } catch {
        return new URL('http://localhost').searchParams;
    }
}

function buildPaginatedResponse(products, page, limit) {
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (safePage - 1) * limit;

    return {
        products: products.slice(startIndex, startIndex + limit),
        pagination: {
            page: safePage,
            limit,
            total,
            totalPages,
        },
    };
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    const searchParams = getSearchParams(req);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(24, Math.max(1, Number(searchParams.get('limit') || 12)));

    if (isProductTestMode()) {
        return Response.json(
            buildPaginatedResponse(listFallbackProducts(), page, limit),
            { status: 200 }
        );
    }

    try {
        await ensureProductVariantSchema();

        const offset = (page - 1) * limit;
        const [countResult, productsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) AS total FROM products'),
            pool.query(
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
                    ORDER BY p.created_at DESC NULLS LAST, p.id DESC
                    LIMIT $1 OFFSET $2
                `,
                [limit, offset]
            ),
        ]);

        const total = Number(countResult.rows[0]?.total || 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(page, totalPages);

        return Response.json({
            products: productsResult.rows.map((row) => normalizeProductRow(row)),
            pagination: {
                page: safePage,
                limit,
                total,
                totalPages,
            },
        }, { status: 200 });
    } catch {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    const denied = await requireAdminWriteAccess(req);
    if (denied) {
        return denied;
    }

    try {
        await ensureProductVariantSchema();

        const formData = await req.formData();
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

            return Response.json(createFallbackProduct({
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
            }), { status: 201 });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

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

            const relationState = await prepareProductRelations(client, parsed.payload);

            const createdProduct = await client.query(
                `
                    INSERT INTO products (
                        sub_category_id,
                        title,
                        description,
                        sku,
                        price,
                        image,
                        brand,
                        colors_id,
                        sizes_id
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id, sub_category_id, title, description, sku, price, image, brand, colors_id, sizes_id, created_at
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
                ]
            );

            await replaceProductDetailsForProduct(
                client,
                Number(createdProduct.rows[0].id),
                parsed.payload.details
            );

            await syncProductVariantsForProduct(
                client,
                Number(createdProduct.rows[0].id),
                parsed.payload,
                relationState
            );

            await client.query('COMMIT');

            return Response.json(
                normalizeProductRow({
                    ...createdProduct.rows[0],
                    ...subcategoryResult.rows[0],
                    colors: parsed.payload.colors,
                    sizes: parsed.payload.sizes,
                    details: parsed.payload.details,
                    variants: parsed.payload.variants,
                    variant_count: parsed.payload.variants.length,
                }),
                { status: 201 }
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
