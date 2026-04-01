import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
    ORDER_STATUS_JOIN_CONDITION,
    ORDER_STATUS_TITLE_EXPR,
} from '@/lib/admin/order-status';

export async function GET() {
    try {
        const [statusesResult, totalOrdersResult] = await Promise.all([
            pool.query(`
                SELECT
                    os.id,
                    ${ORDER_STATUS_TITLE_EXPR} AS title,
                    COUNT(o.id)::int AS count
                FROM order_status os
                LEFT JOIN orders o ON ${ORDER_STATUS_JOIN_CONDITION}
                GROUP BY
                    os.id,
                    ${ORDER_STATUS_TITLE_EXPR}
                ORDER BY os.id ASC
            `),
            pool.query('SELECT COUNT(*)::int AS total FROM orders'),
        ]);

        return NextResponse.json({
            totalOrders: totalOrdersResult.rows[0]?.total || 0,
            statuses: statusesResult.rows,
        });
    } catch (error) {
        console.error('GET /api/admin/order-statuses error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
