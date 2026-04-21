import { pool } from "@/lib/db";
import {
    buildProductRelationsJoins,
    buildProductRelationsSelect,
    normalizeProductRow,
} from "@/lib/products-data";
import { ensureProductVariantSchema } from "@/lib/productSchema";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    //I'll use request parameter for the token
    const { sku } = await params;
    if (!sku || sku.endsWith(".json")) {
        // Chrome devtools vs. buraya düştüğünde 204 dön, hiç hata verme
        return new Response(null, { status: 204 });
    }

    try {
        await ensureProductVariantSchema();

        const res = await pool.query(
            `
                SELECT
                    ${buildProductRelationsSelect('p')},
                    sc.slug AS "subCategorySlug",
                    c.slug AS "categorySlug"
                FROM products p
                ${buildProductRelationsJoins('p')}
                LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
                LEFT JOIN categories c ON c.id = sc.category_id
                WHERE p.sku = $1
                LIMIT 1
            `,
            [sku]
        );
        if (res.rows.length === 0) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }
        const data = normalizeProductRow(res.rows[0]);

        // Fetch reviews
        const reviewsRes = await pool.query(`
            SELECT pr.rating, pr.comment, pr.created_at, u.name as user_name
            FROM product_reviews pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.product_id = $1
            ORDER BY pr.created_at DESC
        `, [data.id]);

        data.reviews = reviewsRes.rows;
        data.review_count = reviewsRes.rows.length;
        data.average_rating = reviewsRes.rows.length > 0
            ? reviewsRes.rows.reduce((acc, r) => acc + r.rating, 0) / reviewsRes.rows.length
            : 0;

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.log("GET api/products/sku error: ", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}
