import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { product_id, order_id, rating, comment } = body;

        if (!product_id || !order_id || !rating) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const pid = parseInt(product_id);
        const oid = parseInt(order_id);

        // Verify the order belongs to the user and is delivered using the dynamic orders view
        const orderResult = await pool.query(
            `SELECT id, status FROM orders 
             WHERE id = $1 AND user_id = $2`,
            [oid, user.id]
        );

        if (orderResult.rows.length === 0) {
            return NextResponse.json({
                message: `Order ${oid} not found or unauthorized for user ${user.id}`
            }, { status: 404 });
        }

        if (orderResult.rows[0].status !== 'Delivered') {
            return NextResponse.json({
                message: `Order status is '${orderResult.rows[0].status}', needs to be 'Delivered'`
            }, { status: 400 }); // Changed to 400 as it's a validation error
        }

        // Insert or update review
        await pool.query(
            `INSERT INTO product_reviews (user_id, product_id, order_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, product_id, order_id) 
             DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP`,
            [user.id, pid, oid, rating, comment]
        );

        return NextResponse.json({ message: "Review submitted successfully" }, { status: 200 });
    } catch (error) {
        console.error("POST /api/products/reviews error:", error);
        return NextResponse.json(
            { message: `Error submitting review: ${error.message}` },
            { status: 500 }
        );
    }
}
