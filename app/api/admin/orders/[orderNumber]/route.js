import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
    ORDER_STATUS_JOIN_CONDITION,
    ORDER_STATUS_TITLE_EXPR,
} from '@/lib/admin/order-status';

async function getAdminFromRequest(req) {
    const adminToken = req.cookies?.get?.('admin_token');

    if (!adminToken?.value || !adminToken.value.startsWith('admin-session-token:')) {
        return null;
    }

    const base64Email = adminToken.value.split(':')[1];
    const email = Buffer.from(base64Email, 'base64').toString('utf-8');
    const adminResult = await pool.query(
        'SELECT id, email, name, surname, role FROM users WHERE email = $1 AND role = $2 LIMIT 1',
        [email, 'admin']
    );

    if (adminResult.rowCount === 0) {
        return null;
    }

    return adminResult.rows[0];
}

export async function GET(req, { params }) {
    try {
        const { orderNumber } = await params;
        const result = await pool.query(
            `
                SELECT
                    t.*,
                    u.email AS customer_email,
                    CONCAT_WS(' ', NULLIF(u.name, ''), NULLIF(u.surname, '')) AS customer_name,
                    u.phone AS customer_phone,
                    u.id AS customer_id,
                    admin_user.email AS status_updated_by_admin_email,
                    CONCAT_WS(' ', NULLIF(admin_user.name, ''), NULLIF(admin_user.surname, '')) AS status_updated_by_admin_name,
                    os.id AS status_id,
                    ${ORDER_STATUS_TITLE_EXPR} AS status_title
                FROM orders o
                JOIN orders_table t ON t.order_number = o.order_number
                LEFT JOIN users u ON u.id = t.user_id
                LEFT JOIN users admin_user ON admin_user.id = t.status_updated_by_admin_id
                LEFT JOIN order_status os ON ${ORDER_STATUS_JOIN_CONDITION}
                WHERE t.order_number = $1
            `,
            [orderNumber]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = result.rows[0];
        const itemsResult = await pool.query(
            `
                SELECT
                    oi.*,
                    COALESCE(p.title, oi.product_title) AS item_title,
                    COALESCE(p.image, '') AS image,
                    COALESCE(p.sku, oi.product_sku) AS sku
                FROM order_items oi
                LEFT JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = $1
                ORDER BY oi.id ASC
            `,
            [order.id]
        );

        return NextResponse.json({
            ...order,
            items: itemsResult.rows,
        });
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

        const { orderNumber } = await params;
        const body = await req.json();
        const admin = await getAdminFromRequest(req);

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

        if (!admin) {
            return NextResponse.json({ error: 'Admin session not found' }, { status: 401 });
        }

        const statusResult = await pool.query(
            `
                SELECT
                    os.id,
                    ${ORDER_STATUS_TITLE_EXPR} AS title
                FROM order_status os
                WHERE os.id::text = $1
                LIMIT 1
            `,
            [String(status)]
        );

        if (statusResult.rowCount === 0) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE orders_table
            SET
                status = $1,
                status_updated_by_admin_id = $2,
                status_updated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_number = $3
            RETURNING *`,
            [statusResult.rows[0].id, admin.id, orderNumber]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...result.rows[0],
            status_id: statusResult.rows[0].id,
            status_title: statusResult.rows[0].title,
            status_updated_by_admin_id: admin.id,
            status_updated_by_admin_email: admin.email,
            status_updated_by_admin_name: [admin.name, admin.surname].filter(Boolean).join(' ') || admin.email,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
