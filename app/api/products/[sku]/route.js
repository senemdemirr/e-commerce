import { pool } from "@/lib/db";

export async function GET(request, { params }) {
    //I'll use request parameter for the token
    const { sku } = await params;
    if (!sku || sku.endsWith(".json")) {
        // Chrome devtools vs. buraya düştüğünde 204 dön, hiç hata verme
        return Response(null, { status: 204 });
    }

    try {
        const res = await pool.query(`SELECT p.title, p.brand, p.price, p.image, p.sku, p.description, p.colors, p.sizes, p.details, sc.slug AS "subCategorySlug", c.slug AS "categorySlug" FROM products p LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id LEFT JOIN categories c ON c.id = sc.category_id WHERE p.sku = $1`, [sku]);
        if (res.rows.length === 0) {
            return Response(
                JSON.stringify({ message: "Product not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }
        const data = await res.rows[0];

        return Response.json(data, { status: 200 });

    } catch (error) {
        console.log("GET api/products/sku error: ", error);
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}