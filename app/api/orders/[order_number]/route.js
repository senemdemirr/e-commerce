import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { order_number } = await params;
        const user = await getOrCreateUserFromSession();

        if (!user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const orderResult = await pool.query(
            `SELECT o.*, os.title as status_label FROM orders o JOIN order_status os ON o.status = os.code WHERE o.order_number = $1 AND o.user_id = $2`,
            [order_number, user.id]
        );

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        const order = orderResult.rows[0];
        console.log("orderrr", order);

        // Dynamic status calculation
        const getDynamicStatus = (createdAt, dbStatus) => {
            if (dbStatus === 'cancelled') return 'cancelled';
            const orderDate = new Date(createdAt);
            const now = new Date();
            const diffInHours = (now - orderDate) / (1000 * 60 * 60);

            if (diffInHours >= 96) return 'delivered'; // 4 days
            if (diffInHours >= 24) return 'shipped';   // 1 day
            if (diffInHours >= 3) return 'preparing'; // 3 hours
            return 'order_received';
        };

        order.status = getDynamicStatus(order.created_at, order.status);

        // Fetch order items with product details if possible, or just the order_items
        const itemsResult = await pool.query(
            `SELECT oi.*, p.title, p.sku, p.image 
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [order.id]
        );

        order.items = itemsResult.rows;

        // Format shipping address from order snapshot columns
        order.shipping_address = {
            full_name: order.shipping_full_name,
            phone_number: order.shipping_phone,
            address_line: order.shipping_address,
            city: order.shipping_city,
            district: order.shipping_district,
            postal_code: order.shipping_postal_code
        };

        return NextResponse.json({ order }, { status: 200 });
    } catch (error) {
        console.error("GET /api/orders/[order_number] error:", error);
        return NextResponse.json(
            { message: `Error fetching order: ${error.message}` },
            { status: 500 }
        );
    }
}
