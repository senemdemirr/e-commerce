import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req, { params }) {
    try {
        const role = req.headers.get('role');
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;

        // Get customer info
        const userResult = await pool.query('SELECT id, email, name, surname, phone, email_verified, created_at FROM users WHERE id = $1', [id]);
        
        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Get customer orders
        const ordersResult = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [id]);

        const customer = userResult.rows[0];
        customer.orders = ordersResult.rows;

        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const role = req.headers.get('role');
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();

        const updates = [];
        const values = [];
        let index = 1;

        if (body.name !== undefined) {
            updates.push(`name = $${index++}`);
            values.push(body.name);
        }
        if (body.surname !== undefined) {
            updates.push(`surname = $${index++}`);
            values.push(body.surname);
        }
        if (body.phone !== undefined) {
            updates.push(`phone = $${index++}`);
            values.push(body.phone);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${index} RETURNING id, email, name, surname, phone, email_verified, created_at`;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
