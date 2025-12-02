import { pool } from "@/db";

export async function GET() {
    try {
        const res = await pool.query("SELECT c.id AS category_id, c.name AS category_name, c.slug AS category_slug, sc.id AS subcategory_id, sc.name AS subcategory_name, sc.slug AS subcategory_slug FROM categories c LEFT JOIN sub_categories sc ON sc.category_id = c.id ORDER BY c.id, sc.id");
        
        const rows = res.rows;

        const categoriesMap = new Map();
        const categories = [];

        for(const row of rows){
            let category = categoriesMap.get(row.category_id);

            if(!category){
                category = {
                    id: row.category_id,
                    name: row.category_name,
                    slug: row.category_slug,
                    subcategories: []
                }
                categoriesMap.set(row.category_id, category);
                categories.push(category);
            }
            if(row.subcategory_id){
                category.subcategories.push({
                    id: row.subcategory_id,
                    name: row.subcategory_name,
                    slug: row.subcategory_slug
                })
            }
        }
        return Response.json(categories, { status: 200 });

    } catch (error) {
        console.log("GET /api/categories error: ", error);
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}