import { pool } from "@/db";

export async function GET() {
    try {
        const res = await pool.query("SELECT * FROM products");
        return Response.json(res.rows, {status: 200});
        
    } catch (error) {
        console.log("GET api/products error: ",error);
        return Response.json(
            {message: "Something went wrong"},
            {status: 500}
        )
    }
}