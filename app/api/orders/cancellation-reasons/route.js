import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await pool.query(
            "SELECT * FROM cancellation_reasons ORDER BY sort_order ASC"
        );
        return NextResponse.json({ reasons: result.rows }, { status: 200 });
    } catch (error) {
        console.error("GET /api/orders/cancellation-reasons error:", error);
        return NextResponse.json(
            { message: `Error fetching cancellation reasons: ${error.message}` },
            { status: 500 }
        );
    }
}
