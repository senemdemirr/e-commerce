import { pool } from "@/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");

    try {
        const result = await pool.query("SELECT id,name FROM districts WHERE city_id=$1", [cityId]);

        return Response.json(
            result.rows,
            { status: 200 }
        )
    } catch (error) {
        return Response.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )
    }
}