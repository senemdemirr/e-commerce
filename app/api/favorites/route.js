import { pool } from "@/db";

export async function GET(request) {

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    try {
        const res = await pool.query("SELECT p.title AS title, p.description AS description, p.image AS image, p.sku AS sku, p.brand AS brand, sc.slug AS subCategorySlug, c.slug AS categorySlug FROM favorites f LEFT JOIN products p ON p.id = f.product_id LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id LEFT JOIN categories c ON c.id = sc.category_id WHERE user_id= $1", [userId]);
        return Response.json(
            res.rows,
            { status: 200 }
        )

    } catch (error) {
        console.log("GET /api/favorites error: ", error);
        return Response.json(
            { message: "Something went wrong." },
            { status: 500 }
        )
    }
}