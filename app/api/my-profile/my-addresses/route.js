import { pool } from "@/db";
import { auth0 } from "@/lib/auth0";

export async function GET(request) {
    const session = await auth0.getSession();
    let userId;
    try {
        if (session) {
            const userIdRes = await pool.query("SELECT id FROM users WHERE auth0_sub = $1", [session.user.sub]);
            if (!userIdRes.rowCount) {
                return Response.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                )
            }
            userId = userIdRes.rows[0].id;
        }
        else {
            //for swagger
            const { searchParams } = new URL(request.url);
            const raw = searchParams.get("userId");
            if (!raw) {
                return Response.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                )
            }
            userId = raw;
        }



        const result = await pool.query("SELECT ua.id , ua.address_title,ua.address_line,ua.recipient_first_name, ua.recipient_last_name, ua.recipient_phone , n.name as neighborhood_name, d.name as district_name , c.name as city_name FROM user_addresses ua JOIN neighborhoods n ON n.id = ua.neighborhood_id JOIN districts d ON n.district_id = d.id JOIN cities c ON d.city_id = c.id WHERE user_id=$1", [userId]);

        return Response.json(
            result.rows[0],
            {status:200}
        )

    } catch (error) {
        return Response.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )

    }
}