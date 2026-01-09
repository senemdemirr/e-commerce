import { pool } from "@/lib/db";

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return Response.json(
                { message: "Favorite not found" },
                { status: 404 }
            )
        }
        const existing = await pool.query("SELECT * FROM favorites WHERE id = $1", [id]);

        if (!existing.rows.length === 0) {
            return Response.json(
                { message: "Favorite not found" },
                { status: 404 }
            )
        }
        else {
            await pool.query("DELETE FROM favorites WHERE id = $1", [id]);

            return Response.json(
                { message: "Favorite deleted" },
                { status: 200 }
            )
        }



    } catch (error) {
        console.log("favorite delete error: ", error);
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }

}