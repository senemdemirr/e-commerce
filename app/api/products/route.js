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
            c.slug AS "categorySlug"
        FROM products p
        ${buildProductRelationsJoins('p')}
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
        LEFT JOIN categories c ON c.id = sc.category_id
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
