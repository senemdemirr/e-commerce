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
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [user.id]
        );

        const orders = ordersResult.rows;

        // Dynamic status calculation helper
        const getDynamicStatus = (createdAt, dbStatus) => {
            if (dbStatus === 'cancelled') return 'cancelled';
            const orderDate = new Date(createdAt);
            const now = new Date();
            const diffInHours = (now - orderDate) / (1000 * 60 * 60);

            if (diffInHours >= 96) return 'delivered';
            if (diffInHours >= 24) return 'shipped';
            if (diffInHours >= 3) return 'preparing';
            return 'order_received';
        };

        // Fetch items for each order and update status
        for (let order of orders) {
            order.status = getDynamicStatus(order.created_at, order.status);
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
