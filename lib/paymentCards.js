import { pool } from "@/lib/db";

let paymentCardSchemaReadyPromise = null;

export async function ensurePaymentCardSchema() {
    if (!paymentCardSchemaReadyPromise) {
        paymentCardSchemaReadyPromise = pool.query(`
            ALTER TABLE payment_cards
            ADD COLUMN IF NOT EXISTS card_user_key VARCHAR(255)
        `).catch((error) => {
            paymentCardSchemaReadyPromise = null;
            throw error;
        });
    }

    await paymentCardSchemaReadyPromise;
}
