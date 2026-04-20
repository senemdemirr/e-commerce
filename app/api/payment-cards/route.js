import { pool } from "@/lib/db";
import { ensurePaymentCardSchema } from "@/lib/paymentCards";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await ensurePaymentCardSchema();

        const user = await getOrCreateUserFromSession();

        if (user instanceof NextResponse || !user?.id) {
            return user instanceof NextResponse
                ? user
                : NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const result = await pool.query(
            `SELECT id, user_id, card_holder_name, card_alias, card_family, card_bank_name, card_mask, is_default,
                    CASE
                        WHEN card_token IS NOT NULL
                             AND (
                                 card_user_key IS NOT NULL
                                 OR EXISTS (
                                     SELECT 1
                                     FROM payment_cards fallback_cards
                                     WHERE fallback_cards.user_id = payment_cards.user_id
                                       AND fallback_cards.card_user_key IS NOT NULL
                                 )
                             )
                        THEN TRUE
                        ELSE FALSE
                    END AS can_charge
             FROM payment_cards
             WHERE user_id = $1
             ORDER BY is_default DESC, id DESC`,
            [user.id]
        );

        return NextResponse.json({ cards: result.rows }, { status: 200 });
    } catch (error) {
        console.error("GET /api/payment-cards error:", error);
        return NextResponse.json(
            { message: `Error fetching payment cards: ${error.message}` },
            { status: 500 }
        );
    }
}
