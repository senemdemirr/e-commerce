import { pool } from "@/db";

export async function GET(request, { params }) {
    //I'll use request parameter for the token
    const { sku } = await params;
    
    try {
        const res = await pool.query(`SELECT p.title,p.brand,p.price,p.image,p.sku, sc.slug AS "subCategorySlug", c.slug AS "categorySlug" FROM products p LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id LEFT JOIN categories c ON c.id = sc.category_id WHERE p.sku = $1`, [sku]);

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