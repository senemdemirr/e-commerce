import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email alanı eksik' }, { status: 400 });
        }
        if (!password) {
            return NextResponse.json({ error: 'Şifre alanı eksik' }, { status: 400 });
        }

        // Veritabanından kullanıcıyı bul
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rowCount === 0) {
            // Güvenlik gereği hem email hem şifre hatalarında genelde 401 dönülür
            return NextResponse.json({ error: 'Geçersiz email' }, { status: 401 });
        }

        const user = result.rows[0];

        // Şifre kontrolü (bcrypt ile hashlere karşılaştırma)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 });
        }

        // Rol kontrolü (sadece admin girebilir)
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Kullanıcı admin değil' }, { status: 403 });
        }

        // Giriş başarılı senaryosu
        const response = NextResponse.json({ success: true, message: 'Giriş başarılı' }, { status: 200 });
        
        // Admin Token Cookisi (1 Günlük)
        // Mevcut middleware 'admin-session-token' sabit değerini bekliyor olabilir.
        response.cookies.set('admin_token', 'admin-session-token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24
        });
        
        return response;
        
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

