import { pool } from "@/db";
import { getOrCreateUserFromSession } from "@/lib/users";

async function getUserId(request) {
    const user = await getOrCreateUserFromSession();
    if (user?.id) return user.id;

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("userId");
    if (raw) return raw;

    return null;
}

export async function GET(request) {

    try {
        const userId = await getUserId(request);

        if (!userId) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await pool.query("SELECT ua.id , ua.address_title,ua.address_line,ua.recipient_first_name, ua.recipient_last_name, ua.recipient_phone , n.name as neighborhood_name, d.name as district_name , c.name as city_name FROM user_addresses ua JOIN neighborhoods n ON n.id = ua.neighborhood_id JOIN districts d ON n.district_id = d.id JOIN cities c ON d.city_id = c.id WHERE user_id=$1", [userId]);

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
export async function POST(request) {
    const body = await request.json();
    const { address_title, recipient_first_name, recipient_last_name, recipient_phone, address_line, city_id, district_id, neighborhood_id } = body;
    const userId = await getUserId(request);

    try {
        if (!userId) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        await pool.query("INSERT INTO user_addresses(user_id,recipient_first_name, recipient_last_name, recipient_phone,city_id,district_id,neighborhood_id,address_title,address_line) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",[userId,recipient_first_name,recipient_last_name,recipient_phone,city_id,district_id,neighborhood_id,address_title,address_line]);

        return Response.json(
            {message:"Successfully"},
            {status:200}
        )

    } catch (error) {
        return Response.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )
    }
}