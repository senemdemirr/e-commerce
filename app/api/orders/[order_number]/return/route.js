import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { order_number } = await params;
        const user = await getOrCreateUserFromSession();
        const body = await request.json();
        const { returns } = body; // Array of { order_item_id, reason_id, note }

        if (!user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 1. Get order ID and verify ownership
        const orderResult = await pool.query(
            "SELECT id FROM orders_table WHERE order_number = $1 AND user_id = $2",
            [order_number, user.id]
        );

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ message: "Order not found or unauthorized" }, { status: 404 });
        }

        const orderId = orderResult.rows[0].id;

        // 2. Process each returned item
        for (const item of returns) {
            await pool.query(
                `INSERT INTO product_returns (order_id, order_item_id, reason_id, note)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.order_item_id, item.reason_id, item.note || null]
            );
        }

        // Optional: Update order status to reflect return request?
        // For now, let's keep it simple as per user request to just "keep a table".
        // However, usually we might want to change status.
        // The user previously said "cancelled olan order ın card bg sini blur...", 
        // maybe they want the status to change to something like 'Return Requested'?
        // Let's stick to storing the data for now.

        // Actually, let's check if there is a 'return_requested' status.
        const statusResult = await pool.query("SELECT id FROM order_status WHERE code = 'return_requested'");
        if (statusResult.rows.length > 0) {
            await pool.query(
                "UPDATE orders_table SET status = $1 WHERE id = $2",
                [statusResult.rows[0].id, orderId]
            );
        }

        return NextResponse.json({ message: "Return request created successfully" }, { status: 200 });
    } catch (error) {
        console.error("POST /api/orders/[order_number]/return error:", error);
        return NextResponse.json(
            { message: `Error processing return: ${error.message}` },
            { status: 500 }
        );
    }
}
