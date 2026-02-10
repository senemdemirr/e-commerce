import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { order_number } = await params;
        const user = await getOrCreateUserFromSession();

        if (!user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 1. Get the order status numeric ID for 'cancelled'
        const statusResult = await pool.query(
            "SELECT id FROM order_status WHERE code = 'cancelled'"
        );

        if (statusResult.rows.length === 0) {
            return NextResponse.json({ message: "Cancellation status not found" }, { status: 500 });
        }

        const cancelledStatusId = statusResult.rows[0].id;

        // 2. Update the order status in the orders_table (not the view, to be safe, or direct update if view supports it)
        // Since the summary mentions orders_table, let's update that.
        // We also need to ensure the order belongs to the user.

        const updateResult = await pool.query(
            `UPDATE orders_table 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE order_number = $2 AND user_id = $3
             RETURNING id`,
            [cancelledStatusId, order_number, user.id]
        );

        if (updateResult.rows.length === 0) {
            return NextResponse.json({ message: "Order not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Order cancelled successfully" }, { status: 200 });
    } catch (error) {
        console.error("POST /api/orders/[order_number]/cancel error:", error);
        return NextResponse.json(
            { message: `Error cancelling order: ${error.message}` },
            { status: 500 }
        );
    }
}
