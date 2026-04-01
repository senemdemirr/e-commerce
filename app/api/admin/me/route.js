import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req) {
    try {
        // Token'dan admin email'ini çöz
        const adminToken = req.cookies.get('admin_token');

        if (!adminToken || !adminToken.value.startsWith('admin-session-token:')) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        // Token formatı: 'admin-session-token:BASE64_EMAIL'
        const base64Email = adminToken.value.split(':')[1];
        const email = Buffer.from(base64Email, 'base64').toString('utf-8');

        const result = await pool.query(
            'SELECT id, email, name, role FROM users WHERE email = $1 AND role = $2',
            [email, 'admin']
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 404 });
        }

        const admin = result.rows[0];

        return NextResponse.json({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
        });

    } catch (error) {
        console.error('Admin Me Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
