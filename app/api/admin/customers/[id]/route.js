import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const USER_ACTIVATE_EXPR = `
    CASE
        WHEN LOWER(TRIM(COALESCE(activate::text, '1'))) IN ('1', 'true', 't') THEN 1
        ELSE 0
    END
`;

function normalizeCustomerActivate(value) {
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    if (typeof value === 'number') {
        if (value === 1 || value === 0) {
            return value;
        }

        return null;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (['1', 'true', 't'].includes(normalized)) {
            return 1;
        }

        if (['0', 'false', 'f'].includes(normalized)) {
            return 0;
        }
    }

    return null;
}

export async function GET(req, { params }) {
    try {
        const role = req.headers.get('role');
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Get customer info
        const userResult = await pool.query(
            `SELECT id, email, name, surname, phone, role, ${USER_ACTIVATE_EXPR} AS activate, email_verified, created_at FROM users WHERE id = $1 AND LOWER(COALESCE(role, '')) = 'customer'`,
            [id]
        );
        
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

        const { id } = await params;
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
        if (body.activate !== undefined) {
            const activate = normalizeCustomerActivate(body.activate);

            if (activate === null) {
                return NextResponse.json({ error: 'Geçersiz aktiflik değeri' }, { status: 400 });
            }

            updates.push(`activate = $${index++}`);
            values.push(activate);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${index} AND LOWER(COALESCE(role, '')) = 'customer' RETURNING id, email, name, surname, phone, role, ${USER_ACTIVATE_EXPR} AS activate, email_verified, created_at`;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const role = req.headers.get('role');
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const orderCountResult = await pool.query(
            'SELECT COUNT(*)::int AS count FROM orders WHERE user_id = $1',
            [id]
        );
        const orderCount = Number(orderCountResult.rows[0]?.count || 0);

        if (orderCount > 0) {
            return NextResponse.json(
                { error: 'Sipariş geçmişi olan müşteri silinemez' },
                { status: 409 }
            );
        }

        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 AND LOWER(COALESCE(role, '')) = 'customer' RETURNING id, email, name, surname",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Customer delete API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
