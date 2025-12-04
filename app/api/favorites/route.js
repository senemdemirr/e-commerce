import { pool } from "@/db";

export async function GET(request) {

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    try {
        const res = await pool.query("SELECT * FROM favorites WHERE user_id= $1", [userId]);
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