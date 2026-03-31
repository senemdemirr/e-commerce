import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req, { params }) {
    try {
        const { orderNumber } = params;
        const result = await pool.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { orderNumber } = params;
        const body = await req.json();

        // Check if other fields are present
        const allowedFields = ['status'];
        const bodyKeys = Object.keys(body);
        
        const hasNotAllowedFields = bodyKeys.some(key => !allowedFields.includes(key));
        if (hasNotAllowedFields) {
            return NextResponse.json({ error: 'Only status field can be updated' }, { status: 400 });
        }

        const { status } = body;
        if (!status) {
             return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const result = await pool.query(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_number = $2 RETURNING *',
            [status, orderNumber]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
