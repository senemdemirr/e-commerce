import { pool } from "@/db";
import { auth0 } from "@/lib/auth0";

export async function getOrCreateUserFromSession() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        console.log("user yok");
    }

    const { sub, email, name, email_verified } = session.user;

    const existing = await pool.query(`SELECT * FROM users WHERE email=$1 OR auth0_sub=$2`, [email, sub]);

    if (existing.rowCount > 0) {
        console.log("bu emaile kayıtlı kullanıcı var");
        const user = existing.rows[0];

        if (user.email_verified !== email_verified) {
            const updated = pool.query(`UPDATE users SET email_verified =$1 RETURNING * `, [email_verified]);
            return updated.rows[0];
        }
        return user;
    }
    const inserted = await pool.query(`INSERT INTO users(auth0_sub,email,name,email_verified) VALUES($1,$2,$3,$4) RETURNING *`, [sub, email, name, email_verified]);

    return inserted.rows[0];
}