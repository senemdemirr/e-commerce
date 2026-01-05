import { pool } from "@/db";

export async function GET() {
    try {
        const result = await pool.query("SELECT id,name FROM cities ORDER BY name ASC");

        return Response.json(
            result.rows,
            {status:200}
        )
    }
    catch(error){
        return Response.json(
            {message:`Something went wrong: ${error}`},
            {status:500}
        )
    }
}