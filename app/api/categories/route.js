import { pool } from "@/db";

export async function GET(){
    try {
        const res = await pool.query("SELECT * FROM categories");

        return Response.json(res.rows, {status: 200});
        
    } catch (error) {
        console.log("GET /api/categories error: ",error);
        return Response.json(
            {message: "Something went wrong"},
            {status:500}
        )
    }
}