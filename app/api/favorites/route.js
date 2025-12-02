import { pool } from "@/db";

export async function GET() {
    try {
        const res = await pool.query("SELECT * FROM favorites WHERE user_id= $1", [user]);
        return Response.json(
            res.rows[0],
            {status: 200}
        )
        
    } catch (error) {
        console.log("GET /api/favorites error: ", error);
        return Response.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}