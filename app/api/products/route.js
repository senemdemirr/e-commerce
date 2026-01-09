import { pool } from "@/lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const subCategory = searchParams.get('subcategory');
    let query = `SELECT p.*, sc.slug AS "subCategorySlug", c.slug AS "categorySlug" FROM products p LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id LEFT JOIN categories c ON c.id = sc.category_id WHERE 1=1`

    const values = []
    try {
        if(category && category.trim() !== ""){
            values.push(category)
            query += ` AND c.slug = $1`;
        }
        if(subCategory && subCategory.trim() !== 1){
            values.push(subCategory);
            query += ` AND sc.slug = $2`;
        }
        

        const res = await pool.query(query,values);
        return Response.json(res.rows, { status: 200 });

    } catch (error) {
        console.log("GET api/products error: ", error);
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}