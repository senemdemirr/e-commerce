import { pool } from "@/lib/db";
export async function PUT(request, { params }) {
    try {
        const body = await request.json();
        const { id } = await params;
        const { address_title, recipient_first_name, recipient_last_name, recipient_phone, address_line, city_id, district_id, neighborhood_id } = body;

        const existing = await pool.query("SELECT * FROM user_addresses WHERE id=$1", [id]);

        if (!existing) {
            return Response.json(
                { message: "Adress not found" },
                { status: 404 }
            )
        }

        await pool.query("UPDATE user_addresses SET address_title =$1, recipient_first_name=$2, recipient_last_name=$3, recipient_phone=$4, address_line=$5, city_id=$6, district_id=$7, neighborhood_id=$8 ", [address_title, recipient_first_name, recipient_last_name, recipient_phone, address_line, city_id, district_id, neighborhood_id]);

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
        const { id } = await params;
        console.log("id",id);
        if (!id) {
            return Response.json(
                { message: "It is not found" },
                { status: 404 }
            )
        }

        const existing = await pool.query("SELECT * FROM user_addresses WHERE id=$1", [id]);

        if (!existing.rows.length === 0) {
            return Response.json(
                { message: "It is not found" },
                { status: 404 }
            );
        }
        else {
            await pool.query("DELETE FROM user_addresses WHERE id=$1", [id]);

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