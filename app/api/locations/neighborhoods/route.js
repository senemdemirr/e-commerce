import { pool } from "@/lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("districtId");

    try {
        const result = await pool.query("SELECT id,name FROM neighborhoods WHERE district_id = $1", [districtId]);

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