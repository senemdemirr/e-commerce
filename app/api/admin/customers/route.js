import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req) {
    try {
        const role = req.headers.get('role') || req.headers.get('x-user-role');
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let url;
        try {
            url = new URL(req.url);
        } catch {
            url = req.nextUrl || { searchParams: new URLSearchParams() };
        }

        const searchParams = url.searchParams;
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit')) || 10));
        const search = searchParams.get('search')?.trim();
        const segment = searchParams.get('segment')?.trim() || 'all';
        const offset = (page - 1) * limit;

        const customerOrdersCte = `
            WITH customer_orders AS (
                SELECT
                    o.user_id,
                    COUNT(*)::int AS order_count,
                    COALESCE(SUM(o.total_amount), 0)::numeric AS total_spent,
                    MAX(o.created_at) AS last_order_date
                FROM orders o
                GROUP BY o.user_id
            )
        `;
        const baseQuery = `
            FROM users u
            LEFT JOIN customer_orders co ON co.user_id = u.id
        `;
        const filters = [];
        const values = [];

        if (search) {
            values.push(`%${search}%`);
            const searchIndex = values.length;
            filters.push(`(
                COALESCE(u.email, '') ILIKE $${searchIndex}
                OR COALESCE(u.name, '') ILIKE $${searchIndex}
                OR COALESCE(u.surname, '') ILIKE $${searchIndex}
                OR COALESCE(u.phone, '') ILIKE $${searchIndex}
                OR CONCAT_WS(' ', COALESCE(u.name, ''), COALESCE(u.surname, '')) ILIKE $${searchIndex}
            )`);
        }

        const segmentFilters = {
            active: 'COALESCE(co.order_count, 0) > 0',
            prospect: 'COALESCE(co.order_count, 0) = 0',
            verified: 'u.email_verified = TRUE',
            new: "u.created_at >= date_trunc('month', CURRENT_DATE)",
        };

        if (segment !== 'all' && segmentFilters[segment]) {
            filters.push(segmentFilters[segment]);
        }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const customerQuery = `
            ${customerOrdersCte}
            SELECT
                u.id,
                u.auth0_sub,
                u.email,
                u.name,
                u.surname,
                u.phone,
                u.email_verified,
                u.created_at,
                COALESCE(co.order_count, 0)::int AS order_count,
                COALESCE(co.total_spent, 0)::numeric AS total_spent,
                co.last_order_date
            ${baseQuery}
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT $${values.length + 1}
            OFFSET $${values.length + 2}
        `;
        const countQuery = `
            ${customerOrdersCte}
            SELECT COUNT(*)::int AS count
            ${baseQuery}
            ${whereClause}
        `;
        const summaryQuery = `
            ${customerOrdersCte}
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE u.created_at >= date_trunc('month', CURRENT_DATE))::int AS new_this_month,
                COUNT(*) FILTER (WHERE COALESCE(co.order_count, 0) > 0)::int AS active,
                COUNT(*) FILTER (WHERE COALESCE(co.order_count, 0) = 0)::int AS prospect,
                COUNT(*) FILTER (WHERE u.email_verified IS TRUE)::int AS verified
            ${baseQuery}
        `;
        const countValues = [...values];
        values.push(limit, offset);

        const [customerResult, countResult, summaryResult] = await Promise.all([
            pool.query(customerQuery, values),
            pool.query(countQuery, countValues),
            pool.query(summaryQuery),
        ]);

        const total = Number(countResult.rows[0]?.count || 0);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const summaryRow = summaryResult.rows[0] || {};
        const customers = customerResult.rows.map((customer) => ({
            ...customer,
            order_count: Number(customer.order_count || 0),
            total_spent: Number(customer.total_spent || 0),
        }));

        return NextResponse.json({
            customers,
            summary: {
                total: Number(summaryRow.total || 0),
                newThisMonth: Number(summaryRow.new_this_month || 0),
                active: Number(summaryRow.active || 0),
                prospect: Number(summaryRow.prospect || 0),
                verified: Number(summaryRow.verified || 0),
            },
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Customer list API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
