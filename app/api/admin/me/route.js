import { NextResponse } from 'next/server';
import { getAdminUserFromCookie } from '@/lib/admin/auth';

export async function GET(req) {
    try {
        const adminToken = req.cookies.get('admin_token');

        if (!adminToken || !adminToken.value.startsWith('admin-session-token:')) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }
        const admin = await getAdminUserFromCookie(req);

        if (!admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
        });

    } catch (error) {
        console.error('Admin Me Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
