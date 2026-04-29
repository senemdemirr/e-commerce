import { pool } from "@/lib/db";
import {
    buildProductRelationsJoins,
    buildProductRelationsSelect,
    normalizeProductRow,
} from "@/lib/products-data";
import { ensureProductVariantSchema } from "@/lib/productSchema";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const subCategory = searchParams.get('subcategory');
    let query = `
        SELECT
            ${buildProductRelationsSelect('p')},
            sc.slug AS "subCategorySlug",
            c.slug AS "categorySlug",
            COALESCE(review_stats.review_count, 0) AS review_count,
            COALESCE(review_stats.average_rating, 0) AS average_rating
        FROM products p
        ${buildProductRelationsJoins('p')}
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
        LEFT JOIN categories c ON c.id = sc.category_id
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*)::int AS review_count,
                COALESCE(AVG(pr.rating), 0)::float AS average_rating
            FROM product_reviews pr
            WHERE pr.product_id = p.id
        ) review_stats ON TRUE
        WHERE 1=1
    `;

    const values = [];
    try {
        await ensureProductVariantSchema();

        if (category && category.trim() !== "") {
            values.push(category.trim());
            query += ` AND c.slug = $${values.length}`;
        }
        if (subCategory && subCategory.trim() !== "") {
            values.push(subCategory.trim());
            query += ` AND sc.slug = $${values.length}`;
        }

        query += ' ORDER BY p.created_at DESC NULLS LAST, p.id DESC';

        const res = await pool.query(query, values);
        return Response.json(
            res.rows.map((row) => normalizeProductRow(row, { ensureDefaults: false })),
            { status: 200 }
        );

    } catch (error) {
        console.log("GET api/products error: ", error);
        return Response.json(
            { message: "Something went wrong" , error: error.message},
            { status: 500 }
        )
    }
}
