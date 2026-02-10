import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    //I'll use request parameter for the token
    const { sku } = await params;
    if (!sku || sku.endsWith(".json")) {
        // Chrome devtools vs. buraya düştüğünde 204 dön, hiç hata verme
        return new Response(null, { status: 204 });
    }

    try {
        const res = await pool.query(`SELECT p.id, p.title, p.brand, p.price, p.image, p.sku, p.description, p.colors, p.sizes, p.details, sc.slug AS "subCategorySlug", c.slug AS "categorySlug" FROM products p LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id LEFT JOIN categories c ON c.id = sc.category_id WHERE p.sku = $1`, [sku]);
        if (res.rows.length === 0) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }
        const data = res.rows[0];

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