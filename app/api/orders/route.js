import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

// GET - Fetch all orders for the logged-in user
export async function GET() {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const ordersResult = await pool.query(
            `SELECT 
                o.*,
                COUNT(oi.id) as item_count
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = $1
             GROUP BY o.id, o.status, o.user_id, o.order_number, o.subtotal, o.shipping_cost, o.total_amount, o.shipping_address_id, o.shipping_full_name, o.shipping_phone, o.shipping_address, o.shipping_city, o.shipping_district, o.shipping_postal_code, o.payment_method, o.payment_status, o.iyzico_payment_id, o.iyzico_conversation_id, o.created_at, o.updated_at, o.card_mask, o.card_family, o.card_bank
             ORDER BY o.created_at DESC`,
            [user.id]
        );

        const orders = ordersResult.rows;

        // Fetch items for each order
        for (let order of orders) {
            const itemsResult = await pool.query(
                `SELECT * FROM order_items WHERE order_id = $1`,
                [order.id]
            );
            order.items = itemsResult.rows;
        }

        return NextResponse.json(
            { orders },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/orders error:", error);
        return NextResponse.json(
            { message: `Error fetching orders: ${error.message}` },
            { status: 500 }
        );
    }
}
