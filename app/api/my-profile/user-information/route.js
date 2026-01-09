import { pool } from "@/lib/db";
import { auth0 } from "@/lib/auth0";

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
        
        return Response.json({message:"Successfully"},{ status: 200 });

    }
    catch (error) {
        console.log("/api/my-profile/user-information error: ", error);
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )

    }
}