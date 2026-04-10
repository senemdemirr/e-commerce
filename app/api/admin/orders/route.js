import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
    ORDER_STATUS_JOIN_CONDITION,
    ORDER_STATUS_TITLE_EXPR,
} from '@/lib/admin/order-status';
import { requireAdminReadAccess } from '@/lib/admin/auth';

export async function GET(req) {
    try {
        const denied = await requireAdminReadAccess(req);
        if (denied) {
            return denied;
        }

        let url;
        try {
            url = new URL(req.url);
        } catch {
            // in tests nextUrl might be passed
            url = req.nextUrl || { searchParams: new URLSearchParams() };
        }
        
        const searchParams = url.searchParams;
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit')) || 10));
        const status = searchParams.get('status')?.trim();
        const search = searchParams.get('search')?.trim();

        const offset = (page - 1) * limit;

        const baseQuery = `
            FROM orders o
            LEFT JOIN order_status os ON ${ORDER_STATUS_JOIN_CONDITION}
        `;
        const filters = [];
        const values = [];

        if (status) {
            values.push(status);
            const statusIndex = values.length;
            filters.push(`LOWER(COALESCE(${ORDER_STATUS_TITLE_EXPR}, '')) = LOWER($${statusIndex})`);
        }

        if (search) {
            values.push(`%${search}%`);
            const searchIndex = values.length;
            filters.push(`(
                o.order_number ILIKE $${searchIndex}
                OR COALESCE(o.shipping_full_name, '') ILIKE $${searchIndex}
            )`);
        }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const query = `
            SELECT
                o.*,
                os.id AS status_id,
                ${ORDER_STATUS_TITLE_EXPR} AS status_title
            ${baseQuery}
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT $${values.length + 1}
            OFFSET $${values.length + 2}
        `;
        const countQuery = `
            SELECT COUNT(*)::int AS count
            ${baseQuery}
            ${whereClause}
        `;
        const countValues = [...values];
        values.push(limit, offset);

        const [ordersResult, countResult] = await Promise.all([
            pool.query(query, values),
            pool.query(countQuery, countValues)
        ]);

        const total = parseInt(countResult.rows[0].count) || 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            orders: ordersResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
