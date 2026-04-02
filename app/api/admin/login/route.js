import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        // Veritabanından kullanıcıyı bul
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rowCount === 0) {
            // Güvenlik gereği hem email hem şifre hatalarında genelde 401 dönülür
            return NextResponse.json({ error: 'Invalid email' }, { status: 401 });
        }

        const user = result.rows[0];

        // Şifre kontrolü (bcrypt ile hashlere karşılaştırma)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Rol kontrolü (sadece admin girebilir)
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'User is not an admin' }, { status: 403 });
        }

        // Giriş başarılı senaryosu
        const response = NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
        
        // Admin Token Cookisi (1 Günlük) — email bilgisi token'a gömülü
        const tokenValue = 'admin-session-token:' + Buffer.from(user.email).toString('base64');
        response.cookies.set('admin_token', tokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24
        });
        
        return response;
        
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
