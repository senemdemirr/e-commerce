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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        
        const offset = (page - 1) * limit;

        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query('SELECT id, auth0_sub, email, name, surname, phone, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            customers: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
