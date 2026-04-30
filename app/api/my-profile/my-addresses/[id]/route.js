import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";

export async function PUT(request, { params }) {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id } = await params;
        const { address_title, recipient_first_name, recipient_last_name, recipient_phone, address_line, city_id, district_id, neighborhood_id } = body;

        const existing = await pool.query("SELECT id FROM user_addresses WHERE id=$1 AND user_id=$2", [id, user.id]);

        if (existing.rows.length === 0) {
            return Response.json(
                { message: "Adress not found" },
                { status: 404 }
            )
        }

        await pool.query(
            "UPDATE user_addresses SET address_title=$1, recipient_first_name=$2, recipient_last_name=$3, recipient_phone=$4, address_line=$5, city_id=$6, district_id=$7, neighborhood_id=$8 WHERE id=$9 AND user_id=$10",
            [address_title, recipient_first_name, recipient_last_name, recipient_phone, address_line, city_id, district_id, neighborhood_id, id, user.id]
        );

        return Response.json(
            { message: "Successfull" },
            { status: 200 }
        )
    } catch (error) {
        return Response.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )
    }

}
export async function DELETE(request,{ params }) {

    try {
        const user = await getOrCreateUserFromSession();
        if (!user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        if (!id) {
            return Response.json(
                { message: "It is not found" },
                { status: 404 }
            )
        }

        const existing = await pool.query("SELECT id FROM user_addresses WHERE id=$1 AND user_id=$2", [id, user.id]);

        if (existing.rows.length === 0) {
            return Response.json(
                { message: "It is not found" },
                { status: 404 }
            );
        }
        else {
            await pool.query("DELETE FROM user_addresses WHERE id=$1 AND user_id=$2", [id, user.id]);

            return Response.json(
                { message: "It is deleted" },
                { status: 200 }
            )
        }
    } catch (error) {
        return Response.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )
    }

}