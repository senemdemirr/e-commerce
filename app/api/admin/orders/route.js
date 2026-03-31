import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req) {
    try {
        const role = req.headers.get('role') || req.headers.get('x-user-role') || req.headers.get('authorization');
        
        let url;
        try {
            url = new URL(req.url);
        } catch {
            // in tests nextUrl might be passed
            url = req.nextUrl || { searchParams: new URLSearchParams() };
        }
        
        const searchParams = url.searchParams;
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');

        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM orders';
        let countQuery = 'SELECT COUNT(*) FROM orders';
        const values = [];
        const countValues = [];

        if (status) {
            query += ' WHERE status = $1';
            countQuery += ' WHERE status = $1';
            values.push(status);
            countValues.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);

        const [ordersResult, countResult] = await Promise.all([
            pool.query(query, values),
            pool.query(countQuery, countValues)
        ]);

        const total = parseInt(countResult.rows[0].count);
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
