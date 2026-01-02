import { useUser } from "@/context/UserContext";
import { pool } from "@/db";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function PUT(request) {
    const session = await auth0.getSession();

    try {
        if (!session.user) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const body = await request.json();
        const { name, surname, phone } = body;
        const { user } = session;
        
        const result = await pool.query("UPDATE users SET name=$1,surname=$2,phone=$3 WHERE auth0_sub=$4 RETURNING *", [name, surname, phone, user.sub]);
        
        return Response.json(result.rows[0],{ status: 200 });

    }
    catch (error) {
        console.log("/api/my-profile/user-information error: ", error);
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )

    }
}