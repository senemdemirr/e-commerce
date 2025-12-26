import { pool } from "@/db";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function getOrCreateUserFromSession() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        )
    }

    const { sub, email, given_name = "", family_name = "", email_verified } = session.user;


    const existing = await pool.query(`SELECT * FROM users WHERE email=$1 AND auth0_sub=$2`, [email, sub]);

    if (existing.rowCount > 0) {
        const user = existing.rows[0];

        if (user.email_verified !== email_verified) {
            const updated = await pool.query(`UPDATE users SET email_verified=$1 WHERE id =$2 RETURNING * `, [email_verified, user.id]);

            return updated.rows[0];
        }
        return user;
    }
    const inserted = await pool.query(`INSERT INTO users(auth0_sub,email,name,surname, phone,email_verified) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [sub, email, given_name, family_name, null, email_verified]);

    return inserted.rows[0];
}