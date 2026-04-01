import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
    ORDER_STATUS_JOIN_CONDITION,
    ORDER_STATUS_TITLE_EXPR,
} from '@/lib/admin/order-status';

function findStatusCount(statuses, codes) {
    return statuses.reduce((total, item) => {
        return codes.includes(String(item.code || '').toLowerCase())
            ? total + Number(item.count || 0)
            : total;
    }, 0);
}

export async function GET() {
    try {
        const statusesResult = await pool.query(`
            SELECT
                os.id,
                os.code,
                ${ORDER_STATUS_TITLE_EXPR} AS title,
                COUNT(o.id)::int AS count
            FROM order_status os
            LEFT JOIN orders o ON ${ORDER_STATUS_JOIN_CONDITION}
            GROUP BY
                os.id,
                os.code,
                ${ORDER_STATUS_TITLE_EXPR}
            ORDER BY os.id ASC
        `);

        const statusRows = statusesResult.rows;
        const statuses = statusRows.map(({ code, ...status }) => status);
        const totalOrders = statusRows.reduce((total, item) => total + Number(item.count || 0), 0);
        const summary = {
            total: totalOrders,
            pending: findStatusCount(statusRows, ['order_received']),
            processing: findStatusCount(statusRows, ['preparing']),
            completed: findStatusCount(statusRows, ['delivered']),
        };

        return NextResponse.json({
            totalOrders,
            summary,
            statuses,
        });
    } catch (error) {
        console.error('GET /api/admin/order-statuses error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
