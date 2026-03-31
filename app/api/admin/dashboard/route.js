import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req) {
    try {
        const role = req.headers.get('role');
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = {};

        // totalSales
        const salesRes = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status NOT IN ('cancelled', 'pending')");
        data.totalSales = parseFloat(salesRes.rows[0].total) || 0;

        // newOrders
        const newOrdersRes = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
        data.newOrders = parseInt(newOrdersRes.rows[0].count) || 0;

        // totalCustomers
        const custRes = await pool.query("SELECT COUNT(*) FROM users");
        data.totalCustomers = parseInt(custRes.rows[0].count) || 0;

        // dailyVisitors
        data.dailyVisitors = 150; // Mock data since visitors aren't tracked in DB

        // totalProducts
        const prodRes = await pool.query("SELECT COUNT(*) FROM products");
        data.totalProducts = parseInt(prodRes.rows[0].count) || 0;

        // recentOrders
        const recentRes = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
        data.recentOrders = recentRes.rows || [];

        // topCategories
        const catRes = await pool.query(`
            SELECT c.name, COUNT(p.id) as count
            FROM categories c
            LEFT JOIN sub_categories sc ON c.id = sc.category_id
            LEFT JOIN products p ON sc.id = p.sub_category_id
            GROUP BY c.id
            ORDER BY count DESC
            LIMIT 5
        `);
        data.topCategories = catRes.rows.map(row => ({ name: row.name, count: parseInt(row.count) }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
